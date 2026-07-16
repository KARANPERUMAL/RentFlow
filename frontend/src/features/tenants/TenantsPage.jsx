import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, ChevronDown, IndianRupee, Pencil, Search, Trash2, X } from "lucide-react";
import { Page } from "../../components/ui/Page.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { Input, Select } from "../../components/ui/Input.jsx";
import { api } from "../../lib/api.js";
import { cn, computedPaymentStatus, dueBucket, formatCurrency } from "../../lib/utils.js";

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

function AddTenantModal({ floors, tenant, onClose, onSubmit }) {
  const firstFloor = floors.find((floor) => String(floor.floorNumber) === String(tenant?.floor)) || floors[0];
  const firstRoom = firstFloor?.rooms.find((room) => room.roomNumber === tenant?.room) || firstFloor?.rooms.find((room) => room.available > 0) || firstFloor?.rooms[0];
  const [form, setForm] = useState({
    name: tenant?.name || "",
    phone: tenant?.phone || "",
    alternatePhone: tenant?.alternatePhone || "",
    aadhar: tenant?.aadhar || "",
    occupation: tenant?.occupation || "",
    address: tenant?.address || "",
    emergencyContact: tenant?.emergencyContact || "",
    joiningDate: tenant?.joiningDate || new Date().toISOString().slice(0, 10),
    advanceAmount: tenant?.advanceAmount || "",
    monthlyRent: tenant?.monthlyRent || "",
    floor: firstFloor?.floorNumber || "",
    room: firstRoom?.roomNumber || "",
    bed: tenant?.bed || firstRoom?.beds.find((bed) => !bed.tenantId)?.label || "",
    notes: tenant?.notes || ""
  });
  const selectedFloor = floors.find((floor) => String(floor.floorNumber) === String(form.floor));
  const rooms = selectedFloor?.rooms || [];
  const selectedRoom = rooms.find((room) => room.roomNumber === form.room);
  const vacantBeds = selectedRoom?.beds.filter((bed) => !bed.tenantId || bed.tenantId === tenant?.id) || [];

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function selectFloor(value) {
    const floor = floors.find((item) => String(item.floorNumber) === String(value));
    const room = floor?.rooms.find((item) => item.available > 0) || floor?.rooms[0];
    setForm((current) => ({
      ...current,
      floor: value,
      room: room?.roomNumber || "",
      bed: room?.beds.find((bed) => !bed.tenantId)?.label || ""
    }));
  }

  function selectRoom(value) {
    const room = rooms.find((item) => item.roomNumber === value);
    setForm((current) => ({
      ...current,
      room: value,
      bed: room?.beds.find((bed) => !bed.tenantId)?.label || ""
    }));
  }

  return (
    <Modal title={tenant ? "Edit Tenant" : "Add Tenant"} onClose={onClose}>
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
        <Select value={form.floor} onChange={(event) => selectFloor(event.target.value)}>
          {floors.map((floor) => <option key={floor.id} value={floor.floorNumber}>Floor {floor.floorNumber}</option>)}
        </Select>
        <Select value={form.room} onChange={(event) => selectRoom(event.target.value)}>
          {rooms.map((room) => <option key={room.id} value={room.roomNumber}>Room {room.roomNumber} · {room.available} vacant</option>)}
        </Select>
        <Select value={form.bed} onChange={(event) => update("bed", event.target.value)}>
          {vacantBeds.length ? vacantBeds.map((bed) => <option key={bed.id}>{bed.label}</option>) : <option value="">No vacant beds</option>}
        </Select>
        <Input placeholder="Notes" value={form.notes || ""} onChange={(event) => update("notes", event.target.value)} />
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button disabled={!form.name || !form.phone || !form.room || !form.bed} onClick={() => onSubmit(form)}>{tenant ? "Save Changes" : "Save Tenant"}</Button>
      </div>
    </Modal>
  );
}

function MarkPaidModal({ tenant, onClose, onSubmit }) {
  const [form, setForm] = useState({
    amount: tenant?.monthlyRent || "",
    method: "UPI",
    remarks: ""
  });

  if (!tenant) return null;

  return (
    <Modal title={`Mark Paid · ${tenant.name}`} onClose={onClose}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input type="number" placeholder="Amount Received" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} />
        <Select value={form.method} onChange={(event) => setForm({ ...form, method: event.target.value })}>
          <option>Cash</option>
          <option>UPI</option>
          <option>Bank</option>
        </Select>
        <Input className="sm:col-span-2" placeholder="Remarks" value={form.remarks} onChange={(event) => setForm({ ...form, remarks: event.target.value })} />
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={() => onSubmit(form)}>Save Payment</Button>
      </div>
    </Modal>
  );
}

function TenantRow({ tenant, onPaid, onEdit, onDelete, todayDueCount }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const displayStatus = computedPaymentStatus(tenant);
  const displayBucket = dueBucket(tenant);
  return (
    <motion.div layout className="overflow-hidden rounded-xl border border-border bg-white">
      <button onClick={() => setOpen(!open)} className="grid w-full grid-cols-[1fr_auto] items-center gap-4 px-4 py-4 text-left transition hover:bg-zinc-50 md:grid-cols-[120px_1fr_140px_120px_auto]">
        <span className="font-medium">Room {tenant.room}</span>
        <span className="min-w-0">
          <span className="block truncate font-medium">{tenant.name}</span>
          <span className="block text-sm text-zinc-500 md:hidden">{displayBucket} · {formatCurrency(tenant.monthlyRent)}</span>
        </span>
        <Badge className="hidden justify-self-start md:inline-flex">{displayBucket}</Badge>
        <span className="hidden font-semibold md:block">{formatCurrency(tenant.monthlyRent)}</span>
        <ChevronDown className={cn("transition", open && "rotate-180")} size={18} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }}>
            <div className="border-t border-border p-4 md:p-6">
              <div className="grid gap-6 lg:grid-cols-[220px_1fr_260px]">
                <div>
                  <img src={tenant.avatar} alt="" className="h-20 w-20 rounded-full border border-border" />
                  <h3 className="mt-4 text-xl font-semibold">{tenant.name}</h3>
                  <p className="text-sm text-zinc-500">{tenant.occupation}</p>
                  <div className="mt-4 flex gap-2"><Badge>{tenant.status}</Badge><Badge>{displayStatus}</Badge></div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    ["Phone", tenant.phone],
                    ["Aadhar", tenant.aadhar],
                    ["Address", tenant.address],
                    ["Emergency", tenant.emergencyContact],
                    ["Joining Date", tenant.joiningDate],
                    ["Advance Paid", formatCurrency(tenant.advanceAmount)],
                    ["Monthly Rent", formatCurrency(tenant.monthlyRent)],
                    ["Sharing", tenant.sharingType],
                    ["Floor", `Floor ${tenant.floor}`],
                    ["Bed", `${tenant.room} · ${tenant.bed}`],
                    ["Notes", tenant.notes]
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-border p-3">
                      <p className="text-xs uppercase text-zinc-400">{label}</p>
                      <p className="mt-1 text-sm font-medium">{value}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="mb-3 text-sm font-semibold">Payment History</p>
                  <div className="space-y-2">
                    {tenant.paymentHistory.map((item) => (
                      <div key={`${item.month}-${item.date || item.status}`} className="rounded-xl border border-border p-3 text-sm">
                        <div className="flex justify-between gap-3"><span>{item.month}</span><span>{formatCurrency(item.amount)}</span></div>
                        <p className="mt-1 text-xs text-zinc-500">{item.date || "Date not recorded"}</p>
                        <Badge className="mt-2">{item.status}</Badge>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => onEdit(tenant)}><Pencil size={15} /> Edit</Button>
                    <Button size="sm" variant="danger" onClick={() => onDelete(tenant)}><Trash2 size={15} /> Delete</Button>
                    <Button size="sm" variant="secondary" onClick={() => onPaid(tenant)}><IndianRupee size={15} /> Mark Paid</Button>
                    <Button size="sm" variant="secondary" onClick={() => navigate("/due-list")}>
                      <Bell size={15} /> Due List
                      {todayDueCount > 0 && <span className="rounded-full bg-orange-brand px-1.5 py-0.5 text-[11px] font-semibold text-white">{todayDueCount}</span>}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function TenantsPage() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data = [] } = useQuery({ queryKey: ["tenants"], queryFn: api.tenants });
  const { data: floors = [] } = useQuery({ queryKey: ["floors"], queryFn: api.floors });
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [filter, setFilter] = useState("All");
  const [showAddTenant, setShowAddTenant] = useState(searchParams.get("action") === "add");
  const [editTenant, setEditTenant] = useState(null);
  const [paymentTenant, setPaymentTenant] = useState(null);
  const todayDueCount = data.filter((tenant) => dueBucket(tenant) === "Today's Due").length;
  const paymentMutation = useMutation({
    mutationFn: ({ id, payment }) => api.markPaid(id, payment),
    onSuccess: () => {
      setPaymentTenant(null);
      queryClient.invalidateQueries();
    }
  });
  const tenantMutation = useMutation({
    mutationFn: api.addTenant,
    onSuccess: () => {
      setShowAddTenant(false);
      queryClient.invalidateQueries();
    }
  });
  const editMutation = useMutation({
    mutationFn: ({ id, form }) => api.updateTenant(id, form),
    onSuccess: () => {
      setEditTenant(null);
      queryClient.invalidateQueries();
    }
  });
  const deleteMutation = useMutation({
    mutationFn: api.deleteTenant,
    onSuccess: () => queryClient.invalidateQueries()
  });
  const tenants = useMemo(() => data.filter((tenant) => {
    const matchesQuery = [tenant.name, tenant.phone, tenant.room, tenant.aadhar, String(tenant.floor)].join(" ").toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === "All" || tenant.paymentStatus === filter || tenant.sharingType === filter || tenant.status === filter;
    return matchesQuery && matchesFilter;
  }), [data, query, filter]);

  useEffect(() => {
    if (searchParams.get("action") === "pay" && data.length && !paymentTenant) {
      const unpaidTenant = data.find((tenant) => tenant.paymentStatus !== "Paid") || data[0];
      setPaymentTenant(unpaidTenant);
      setSearchParams({});
    }
  }, [data, paymentTenant, searchParams, setSearchParams]);

  return (
    <Page>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-orange-brand">Tenant operations</p>
          <h1 className="mt-2 text-4xl font-semibold">Tenants</h1>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="flex items-center gap-2 rounded-full border border-border px-3"><Search size={16} className="text-zinc-400" /><Input className="border-0 px-0" placeholder="Search name, phone, room..." value={query} onChange={(e) => {
            setQuery(e.target.value);
            setSearchParams(e.target.value ? { q: e.target.value } : {});
          }} /></div>
          <Select className="sm:w-44" value={filter} onChange={(e) => setFilter(e.target.value)}>
            {["All", "Pending", "Paid", "Overdue", "Partial", "2 Sharing", "3 Sharing", "4 Sharing", "Active", "Left"].map((item) => <option key={item}>{item}</option>)}
          </Select>
          <Button onClick={() => setShowAddTenant(true)}>Add Tenant</Button>
        </div>
      </div>
      <div className="space-y-3">
        {tenants.map((tenant) => (
          <TenantRow
            key={tenant.id}
            tenant={tenant}
            todayDueCount={todayDueCount}
            onPaid={(t) => setPaymentTenant(t)}
            onEdit={(t) => setEditTenant(t)}
            onDelete={(t) => {
              if (window.confirm(`Delete ${t.name}? This will free ${t.room} ${t.bed}.`)) {
                deleteMutation.mutate(t.id);
              }
            }}
          />
        ))}
        {!tenants.length && <div className="rounded-xl border border-border p-8 text-center text-sm text-zinc-500">No tenants found. Add a tenant or adjust your search.</div>}
      </div>
      {showAddTenant && <AddTenantModal floors={floors} onClose={() => setShowAddTenant(false)} onSubmit={(form) => tenantMutation.mutate(form)} />}
      {editTenant && <AddTenantModal floors={floors} tenant={editTenant} onClose={() => setEditTenant(null)} onSubmit={(form) => editMutation.mutate({ id: editTenant.id, form })} />}
      {paymentTenant && <MarkPaidModal tenant={paymentTenant} onClose={() => setPaymentTenant(null)} onSubmit={(payment) => paymentMutation.mutate({ id: paymentTenant.id, payment })} />}
    </Page>
  );
}
