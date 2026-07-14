import axios from "axios";
import { createDemoData } from "./demoData";

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
        todayDue: tenants.filter((tenant) => tenant.dueLabel === "Due Today").length,
        tomorrowDue: tenants.filter((tenant) => tenant.dueLabel === "Tomorrow").length,
        upcoming7: tenants.filter((tenant) => tenant.dueLabel === "Upcoming").length,
        overdue: tenants.filter((tenant) => tenant.paymentStatus === "Overdue").length,
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
  async markPaid(tenantId, payment) {
    const store = activeStore();
    const nextStore = {
      ...store,
      tenants: store.tenants.map((tenant) =>
        tenant.id === tenantId
          ? { ...tenant, paymentStatus: "Paid", dueLabel: "Paid", paymentHistory: [{ month: "July 2026", amount: payment.amount, status: "Paid On Time" }, ...tenant.paymentHistory] }
          : tenant
      ),
      activities: [`Payment received from tenant #${tenantId} by ${payment.method}`, ...store.activities]
    };
    saveActiveStore(nextStore);
    return nextStore.tenants.find((tenant) => tenant.id === tenantId);
  }
};
