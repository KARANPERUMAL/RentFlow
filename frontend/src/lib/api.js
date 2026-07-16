import axios from "axios";
import { createDemoData } from "./demoData";
import { computedPaymentStatus, dueBucket } from "./utils";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api"
});

const DEMO_EMAIL = "demo@rentflow.com";
const DEMO_PASSWORD = "demo123";
const ACCOUNTS_KEY = "rentflow.ownerAccounts";
const SESSION_KEY = "rentflow.session";

let demoStore = createDemoData();

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function currentSession() {
  return readJson(SESSION_KEY, null);
}

function ownerAccounts() {
  return readJson(ACCOUNTS_KEY, {});
}

function saveOwnerAccounts(accounts) {
  writeJson(ACCOUNTS_KEY, accounts);
}

function emptyOwnerStore(user, floorsSetup = []) {
  const floors = floorsSetup.map((floorSetup, floorIndex) => ({
    id: `owner-floor-${floorIndex + 1}`,
    floorNumber: floorSetup.floor,
    rooms: floorSetup.rooms.map((room, roomIndex) => ({
      id: `owner-room-${floorSetup.floor}-${roomIndex + 1}`,
      roomNumber: room.number,
      capacity: Number(room.capacity),
      occupied: 0,
      available: Number(room.capacity),
      floorNumber: floorSetup.floor,
      beds: Array.from({ length: Number(room.capacity) }, (_, bedIndex) => ({
        id: `owner-bed-${floorSetup.floor}-${room.number}-${bedIndex}`,
        label: `Bed ${String.fromCharCode(65 + bedIndex)}`,
        tenantId: null
      }))
    }))
  }));

  return {
    user,
    floors,
    tenants: [],
    activities: ["Building setup completed. Add your first tenant when someone joins."]
  };
}

function activeStore() {
  const session = currentSession();
  if (!session || session.user?.email === DEMO_EMAIL) return demoStore;
  return ownerAccounts()[session.user.email]?.store || emptyOwnerStore(session.user, []);
}

function saveActiveStore(nextStore) {
  const session = currentSession();
  if (!session || session.user?.email === DEMO_EMAIL) {
    demoStore = nextStore;
    return;
  }
  const accounts = ownerAccounts();
  accounts[session.user.email] = {
    ...accounts[session.user.email],
    store: nextStore
  };
  saveOwnerAccounts(accounts);
}

function recalculateRoom(room) {
  const occupied = room.beds.filter((bed) => bed.tenantId).length;
  return {
    ...room,
    occupied,
    available: room.capacity - occupied
  };
}

function nextTenantId(tenants) {
  return tenants.reduce((max, tenant) => Math.max(max, Number(tenant.id) || 0), 0) + 1;
}

export const api = {
  async login(payload) {
    if (payload.email === DEMO_EMAIL && payload.password === DEMO_PASSWORD) {
      return { token: "demo-token", user: demoStore.user };
    }

    const account = ownerAccounts()[payload.email];
    if (!account || account.password !== payload.password) {
      throw new Error("Invalid email or password. Create an owner account first, or use demo credentials.");
    }

    return { token: `owner-token-${payload.email}`, user: account.store.user };
  },
  async registerOwner(payload) {
    const user = {
      ownerName: payload.ownerName,
      pgName: payload.pgName,
      email: payload.email,
      phoneNumber: payload.phoneNumber,
      address: payload.address,
      role: "Owner",
      readOnly: false
    };
    const accounts = ownerAccounts();
    accounts[payload.email] = {
      password: payload.password,
      store: emptyOwnerStore(user, payload.floors)
    };
    saveOwnerAccounts(accounts);
    return { token: `owner-token-${payload.email}`, user };
  },
  async dashboard() {
    const store = activeStore();
    const tenants = store.tenants;
    const expected = tenants.reduce((sum, tenant) => sum + tenant.monthlyRent, 0);
    const pending = tenants.filter((tenant) => ["Pending", "Overdue", "Partial"].includes(tenant.paymentStatus)).reduce((sum, tenant) => sum + tenant.monthlyRent, 0);
    const beds = store.floors.flatMap((floor) => floor.rooms.flatMap((room) => room.beds));
    const occupiedBeds = beds.filter((bed) => bed.tenantId).length;
    return {
      user: store.user,
      cards: {
        todayDue: tenants.filter((tenant) => dueBucket(tenant) === "Today's Due").length,
        tomorrowDue: tenants.filter((tenant) => dueBucket(tenant) === "Tomorrow").length,
        upcoming7: tenants.filter((tenant) => dueBucket(tenant) === "Next 7 Days").length,
        overdue: tenants.filter((tenant) => computedPaymentStatus(tenant) === "Overdue").length,
        totalTenants: tenants.length,
        occupiedBeds,
        vacantBeds: beds.filter((bed) => !bed.tenantId).length,
        monthlyRevenue: expected,
        collectedRevenue: expected - pending,
        pendingRevenue: pending,
        occupancy: beds.length ? Math.round((occupiedBeds / beds.length) * 100) : 0
      },
      activities: store.activities
    };
  },
  async tenants() {
    return activeStore().tenants;
  },
  async floors() {
    return activeStore().floors;
  },
  async addFloor() {
    const store = activeStore();
    const floorNumber = store.floors.reduce((max, floor) => Math.max(max, floor.floorNumber), 0) + 1;
    const nextStore = {
      ...store,
      floors: [
        ...store.floors,
        {
          id: `floor-${Date.now()}`,
          floorNumber,
          rooms: []
        }
      ],
      activities: [`Floor ${floorNumber} added`, ...store.activities]
    };
    saveActiveStore(nextStore);
    return nextStore.floors.at(-1);
  },
  async addRoom(floorId, payload = {}) {
    const store = activeStore();
    let createdRoom;
    const nextStore = {
      ...store,
      floors: store.floors.map((floor) => {
        if (floor.id !== floorId) return floor;
        const roomIndex = floor.rooms.length + 1;
        const roomNumber = payload.roomNumber || `${floor.floorNumber}${String(roomIndex).padStart(2, "0")}`;
        const capacity = Number(payload.capacity || 3);
        createdRoom = {
          id: `room-${floor.floorNumber}-${roomNumber}-${Date.now()}`,
          roomNumber,
          capacity,
          occupied: 0,
          available: capacity,
          floorNumber: floor.floorNumber,
          beds: Array.from({ length: capacity }, (_, bedIndex) => ({
            id: `bed-${floor.floorNumber}-${roomNumber}-${bedIndex}-${Date.now()}`,
            label: `Bed ${String.fromCharCode(65 + bedIndex)}`,
            tenantId: null
          }))
        };
        return { ...floor, rooms: [...floor.rooms, createdRoom] };
      }),
      activities: [`Room ${payload.roomNumber || "new"} added`, ...store.activities]
    };
    saveActiveStore(nextStore);
    return createdRoom;
  },
  async addTenant(payload) {
    const store = activeStore();
    const targetFloor = store.floors.find((floor) => String(floor.floorNumber) === String(payload.floor));
    const targetRoom = targetFloor?.rooms.find((room) => room.roomNumber === payload.room);
    const targetBed = targetRoom?.beds.find((bed) => bed.label === payload.bed && !bed.tenantId) || targetRoom?.beds.find((bed) => !bed.tenantId);

    if (!targetFloor || !targetRoom || !targetBed) {
      throw new Error("Select a room with at least one vacant bed.");
    }

    const id = nextTenantId(store.tenants);
    const tenant = {
      id,
      avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(payload.name)}`,
      name: payload.name,
      phone: payload.phone,
      alternatePhone: payload.alternatePhone || "",
      aadhar: payload.aadhar || "",
      occupation: payload.occupation || "Tenant",
      address: payload.address || "",
      emergencyContact: payload.emergencyContact || "",
      joiningDate: payload.joiningDate || new Date().toISOString().slice(0, 10),
      advanceAmount: Number(payload.advanceAmount || 0),
      monthlyRent: Number(payload.monthlyRent || 0),
      sharingType: `${targetRoom.capacity} Sharing`,
      floor: targetFloor.floorNumber,
      room: targetRoom.roomNumber,
      bed: targetBed.label,
      status: "Active",
      paymentStatus: "Pending",
      dueLabel: "Upcoming",
      notes: payload.notes || "No special notes.",
      paymentHistory: []
    };

    const nextStore = {
      ...store,
      tenants: [tenant, ...store.tenants],
      floors: store.floors.map((floor) => {
        if (floor.id !== targetFloor.id) return floor;
        return {
          ...floor,
          rooms: floor.rooms.map((room) => {
            if (room.id !== targetRoom.id) return room;
            return recalculateRoom({
              ...room,
              beds: room.beds.map((bed) => (bed.id === targetBed.id ? { ...bed, tenantId: id } : bed))
            });
          })
        };
      }),
      activities: [`${tenant.name} added to Room ${tenant.room}`, ...store.activities]
    };
    saveActiveStore(nextStore);
    return tenant;
  },
  async updateTenant(tenantId, payload) {
    const store = activeStore();
    const existing = store.tenants.find((tenant) => tenant.id === tenantId);
    if (!existing) throw new Error("Tenant not found.");

    const targetFloor = store.floors.find((floor) => String(floor.floorNumber) === String(payload.floor));
    const targetRoom = targetFloor?.rooms.find((room) => room.roomNumber === payload.room);
    const targetBed = targetRoom?.beds.find((bed) => bed.label === payload.bed);
    if (!targetFloor || !targetRoom || !targetBed) throw new Error("Select a valid room and bed.");
    if (targetBed.tenantId && targetBed.tenantId !== tenantId) throw new Error("Selected bed is already occupied.");

    const updatedTenant = {
      ...existing,
      avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(payload.name)}`,
      name: payload.name,
      phone: payload.phone,
      alternatePhone: payload.alternatePhone || "",
      aadhar: payload.aadhar || "",
      occupation: payload.occupation || "Tenant",
      address: payload.address || "",
      emergencyContact: payload.emergencyContact || "",
      joiningDate: payload.joiningDate,
      advanceAmount: Number(payload.advanceAmount || 0),
      monthlyRent: Number(payload.monthlyRent || 0),
      sharingType: `${targetRoom.capacity} Sharing`,
      floor: targetFloor.floorNumber,
      room: targetRoom.roomNumber,
      bed: targetBed.label,
      notes: payload.notes || "No special notes."
    };

    const nextStore = {
      ...store,
      tenants: store.tenants.map((tenant) => (tenant.id === tenantId ? updatedTenant : tenant)),
      floors: store.floors.map((floor) => ({
        ...floor,
        rooms: floor.rooms.map((room) => recalculateRoom({
          ...room,
          beds: room.beds.map((bed) => {
            if (bed.tenantId === tenantId) return { ...bed, tenantId: null };
            if (bed.id === targetBed.id) return { ...bed, tenantId };
            return bed;
          })
        }))
      })),
      activities: [`${updatedTenant.name} profile updated`, ...store.activities]
    };
    saveActiveStore(nextStore);
    return updatedTenant;
  },
  async deleteTenant(tenantId) {
    const store = activeStore();
    const tenant = store.tenants.find((item) => item.id === tenantId);
    const nextStore = {
      ...store,
      tenants: store.tenants.filter((item) => item.id !== tenantId),
      floors: store.floors.map((floor) => ({
        ...floor,
        rooms: floor.rooms.map((room) => recalculateRoom({
          ...room,
          beds: room.beds.map((bed) => (bed.tenantId === tenantId ? { ...bed, tenantId: null } : bed))
        }))
      })),
      activities: [`${tenant?.name || "Tenant"} deleted`, ...store.activities]
    };
    saveActiveStore(nextStore);
    return tenant;
  },
  async markPaid(tenantId, payment) {
    const store = activeStore();
    const paidAmount = Number(payment.amount || 0);
    const nextStore = {
      ...store,
      tenants: store.tenants.map((tenant) =>
        tenant.id === tenantId
          ? {
              ...tenant,
              paymentStatus: paidAmount < tenant.monthlyRent ? "Partial" : "Paid",
              dueLabel: paidAmount < tenant.monthlyRent ? "Partial" : "Paid",
              paymentHistory: [
                {
                  month: "July 2026",
                  date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }),
                  amount: paidAmount,
                  status: paidAmount < tenant.monthlyRent ? "Partial" : "Paid On Time",
                  method: payment.method,
                  remarks: payment.remarks
                },
                ...tenant.paymentHistory
              ]
            }
          : tenant
      ),
      activities: [`Payment received from tenant #${tenantId} by ${payment.method}`, ...store.activities]
    };
    saveActiveStore(nextStore);
    return nextStore.tenants.find((tenant) => tenant.id === tenantId);
  }
};
