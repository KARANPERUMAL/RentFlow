import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { BedDouble, DoorOpen, Plus, X } from "lucide-react";
import { Page } from "../../components/ui/Page.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { api } from "../../lib/api.js";
import { formatCurrency } from "../../lib/utils.js";

const roomFilters = ["All", "Vacancies", "Occupied"];

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4">
      <motion.div initial={{ opacity: 0, y: 14, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="w-full max-w-2xl rounded-xl border border-border bg-white p-5">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close"><X size={16} /></Button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

function TenantDetailsModal({ tenant, onClose }) {
  if (!tenant) return null;
  return (
    <Modal title={`Room ${tenant.room} · ${tenant.bed}`} onClose={onClose}>
      <div className="grid gap-5 sm:grid-cols-[120px_1fr]">
        <img src={tenant.avatar} alt="" className="h-24 w-24 rounded-full border border-border" />
        <div>
          <h3 className="text-2xl font-semibold">{tenant.name}</h3>
          <p className="mt-1 text-sm text-zinc-500">{tenant.occupation}</p>
          <div className="mt-4 flex flex-wrap gap-2"><Badge>{tenant.status}</Badge><Badge>{tenant.paymentStatus}</Badge></div>
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {[
          ["Phone", tenant.phone],
          ["Aadhar", tenant.aadhar],
          ["Emergency", tenant.emergencyContact],
          ["Joining Date", tenant.joiningDate],
          ["Monthly Rent", formatCurrency(tenant.monthlyRent)],
          ["Advance Paid", formatCurrency(tenant.advanceAmount)],
          ["Address", tenant.address],
          ["Notes", tenant.notes]
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-border p-3">
            <p className="text-xs uppercase text-zinc-400">{label}</p>
            <p className="mt-1 text-sm font-medium">{value || "-"}</p>
          </div>
        ))}
      </div>
    </Modal>
  );
}

function AddTenantFromBedModal({ floor, room, bed, onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    alternatePhone: "",
    aadhar: "",
    occupation: "",
    address: "",
    emergencyContact: "",
    joiningDate: new Date().toISOString().slice(0, 10),
    advanceAmount: "",
    monthlyRent: "",
    notes: ""
  });

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <Modal title={`Add Tenant · Room ${room.roomNumber} ${bed.label}`} onClose={onClose}>
      <div className="mb-4 rounded-xl border border-border px-4 py-3 text-sm">
        Floor {floor.floorNumber} · Room {room.roomNumber} · {bed.label} · {room.capacity} Sharing
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input placeholder="Name" value={form.name} onChange={(event) => update("name", event.target.value)} />
        <Input placeholder="Phone" value={form.phone} onChange={(event) => update("phone", event.target.value)} />
        <Input placeholder="Alternative Phone" value={form.alternatePhone} onChange={(event) => update("alternatePhone", event.target.value)} />
        <Input placeholder="Aadhar Number" value={form.aadhar} onChange={(event) => update("aadhar", event.target.value)} />
        <Input placeholder="Occupation" value={form.occupation} onChange={(event) => update("occupation", event.target.value)} />
        <Input placeholder="Emergency Contact" value={form.emergencyContact} onChange={(event) => update("emergencyContact", event.target.value)} />
        <Input placeholder="Address" value={form.address} onChange={(event) => update("address", event.target.value)} />
        <Input type="date" value={form.joiningDate} onChange={(event) => update("joiningDate", event.target.value)} />
        <Input placeholder="Advance Amount" type="number" value={form.advanceAmount} onChange={(event) => update("advanceAmount", event.target.value)} />
        <Input placeholder="Monthly Rent" type="number" value={form.monthlyRent} onChange={(event) => update("monthlyRent", event.target.value)} />
        <Input className="sm:col-span-2" placeholder="Notes" value={form.notes} onChange={(event) => update("notes", event.target.value)} />
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button disabled={!form.name || !form.phone} onClick={() => onSubmit({ ...form, floor: floor.floorNumber, room: room.roomNumber, bed: bed.label })}>Save Tenant</Button>
      </div>
    </Modal>
  );
}

export default function RoomsPage({ view = "rooms" }) {
  const queryClient = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["floors"], queryFn: api.floors });
  const { data: tenants = [] } = useQuery({ queryKey: ["tenants"], queryFn: api.tenants });
  const [selected, setSelected] = useState("floor-1");
  const [roomFilter, setRoomFilter] = useState("All");
  const [tenantDetails, setTenantDetails] = useState(null);
  const [bedTarget, setBedTarget] = useState(null);
  const floor = data.find((item) => item.id === selected) || data[0];
  const addFloorMutation = useMutation({
    mutationFn: api.addFloor,
    onSuccess: (newFloor) => {
      setSelected(newFloor.id);
      queryClient.invalidateQueries({ queryKey: ["floors"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    }
  });
  const addRoomMutation = useMutation({
    mutationFn: ({ floorId, payload }) => api.addRoom(floorId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["floors"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    }
  });
  const addTenantMutation = useMutation({
    mutationFn: api.addTenant,
    onSuccess: () => {
      setBedTarget(null);
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      queryClient.invalidateQueries({ queryKey: ["floors"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    }
  });

  const rooms = (floor?.rooms || []).filter((room) => {
    if (roomFilter === "Vacancies") return room.available > 0;
    if (roomFilter === "Occupied") return room.occupied > 0;
    return true;
  });

  function vacancyCount(item) {
    return item.rooms.reduce((sum, room) => sum + room.available, 0);
  }

  function addRoom() {
    if (!floor) return;
    const roomNumber = window.prompt("Room number", `${floor.floorNumber}${String(floor.rooms.length + 1).padStart(2, "0")}`);
    if (!roomNumber) return;
    const capacity = Number(window.prompt("Capacity: 2, 3 or 4 sharing", "3"));
    if (![2, 3, 4].includes(capacity)) return;
    addRoomMutation.mutate({ floorId: floor.id, payload: { roomNumber, capacity } });
  }

  return (
    <Page>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-orange-brand">{view === "vacancies" ? "Vacancy map" : "Building structure"}</p>
          <h1 className="mt-2 text-4xl font-semibold">{view === "vacancies" ? "Vacancies" : "Rooms"}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-full border border-border bg-zinc-50 p-1">
            {roomFilters.map((item) => (
              <button
                key={item}
                onClick={() => setRoomFilter(item)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${roomFilter === item ? "bg-black text-white" : "text-zinc-600 hover:bg-white hover:text-black"}`}
              >
                {item}
              </button>
            ))}
          </div>
          <Button variant="secondary" onClick={() => addFloorMutation.mutate()}><Plus size={16} /> Floor</Button>
          <Button onClick={addRoom}><Plus size={16} /> Add Room</Button>
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
        <aside className="space-y-2">
          {data.map((item) => (
            <button key={item.id} onClick={() => setSelected(item.id)} className={`flex w-full items-center gap-2 rounded-full border px-4 py-3 text-left text-sm font-medium transition ${selected === item.id ? "border-black bg-black text-white" : "border-border hover:border-black"}`}>
              <span className="flex-1">Floor {item.floorNumber}</span>
              <span
                title={`${vacancyCount(item)} vacant beds`}
                className={`min-w-6 rounded-full px-2 py-0.5 text-center text-xs font-semibold ${
                  selected === item.id
                    ? "bg-white text-black"
                    : vacancyCount(item) > 0
                      ? "bg-orange-brand text-white"
                      : "border border-border bg-white text-zinc-500"
                }`}
              >
                {vacancyCount(item)}
              </span>
            </button>
          ))}
        </aside>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rooms.map((room) => (
            <Card key={room.id} hover={false} className="min-w-0">
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <p className="text-sm text-zinc-500">Room</p>
                  <h2 className="mt-1 text-2xl font-semibold">{room.roomNumber}</h2>
                </div>
                <DoorOpen className="text-orange-brand" size={20} />
              </div>
              <div className="mb-4 grid grid-cols-3 gap-2 text-center">
                <div className="min-w-0 rounded-xl border border-border px-1.5 py-3"><p className="text-[11px] leading-tight text-zinc-500">Capacity</p><p className="mt-1 text-sm font-semibold">{room.capacity}</p></div>
                <div className="min-w-0 rounded-xl border border-border px-1.5 py-3"><p className="text-[11px] leading-tight text-zinc-500">Occupied</p><p className="mt-1 text-sm font-semibold">{room.occupied}</p></div>
                <div className="min-w-0 rounded-xl border border-border px-1.5 py-3"><p className="text-[11px] leading-tight text-zinc-500">Available</p><p className="mt-1 text-sm font-semibold">{room.available}</p></div>
              </div>
              <div className="space-y-2">
                <AnimatePresence>
                  {room.beds.map((bed) => (
                    <motion.div layout key={bed.id} className="flex items-center justify-between rounded-xl border border-border px-3 py-2 text-sm">
                      <span className="flex items-center gap-2"><BedDouble size={15} /> {bed.label}</span>
                      {bed.tenantId ? (
                        <button
                          className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
                          onClick={() => setTenantDetails(tenants.find((tenant) => tenant.id === bed.tenantId))}
                        >
                          Active
                        </button>
                      ) : (
                        <button
                          className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700"
                          onClick={() => setBedTarget({ floor, room, bed })}
                        >
                          Empty
                        </button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </Card>
          ))}
          {!rooms.length && <div className="rounded-xl border border-border p-8 text-sm text-zinc-500">No rooms match this filter.</div>}
        </section>
      </div>
      {tenantDetails && <TenantDetailsModal tenant={tenantDetails} onClose={() => setTenantDetails(null)} />}
      {bedTarget && <AddTenantFromBedModal floor={bedTarget.floor} room={bedTarget.room} bed={bedTarget.bed} onClose={() => setBedTarget(null)} onSubmit={(form) => addTenantMutation.mutate(form)} />}
    </Page>
  );
}
