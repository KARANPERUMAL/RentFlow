import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, IndianRupee, Pencil, Search, Trash2 } from "lucide-react";
import { Page } from "../../components/ui/Page.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { Input, Select } from "../../components/ui/Input.jsx";
import { api } from "../../lib/api.js";
import { cn, formatCurrency } from "../../lib/utils.js";

function TenantRow({ tenant, onPaid }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div layout className="overflow-hidden rounded-xl border border-border bg-white">
      <button onClick={() => setOpen(!open)} className="grid w-full grid-cols-[1fr_auto] items-center gap-4 px-4 py-4 text-left transition hover:bg-zinc-50 md:grid-cols-[120px_1fr_140px_120px_auto]">
        <span className="font-medium">Room {tenant.room}</span>
        <span className="min-w-0">
          <span className="block truncate font-medium">{tenant.name}</span>
          <span className="block text-sm text-zinc-500 md:hidden">{tenant.dueLabel} · {formatCurrency(tenant.monthlyRent)}</span>
        </span>
        <Badge className="hidden justify-self-start md:inline-flex">{tenant.dueLabel}</Badge>
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
                  <div className="mt-4 flex gap-2"><Badge>{tenant.status}</Badge><Badge>{tenant.paymentStatus}</Badge></div>
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
                      <div key={item.month} className="rounded-xl border border-border p-3 text-sm">
                        <div className="flex justify-between"><span>{item.month}</span><span>{formatCurrency(item.amount)}</span></div>
                        <Badge className="mt-2">{item.status}</Badge>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button size="sm"><Pencil size={15} /> Edit</Button>
                    <Button size="sm" variant="danger"><Trash2 size={15} /> Delete</Button>
                    <Button size="sm" variant="secondary" onClick={() => onPaid(tenant)}><IndianRupee size={15} /> Mark Paid</Button>
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
  const { data = [] } = useQuery({ queryKey: ["tenants"], queryFn: api.tenants });
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const mutation = useMutation({
    mutationFn: ({ id }) => api.markPaid(id, { amount: 6500, method: "UPI" }),
    onSuccess: () => queryClient.invalidateQueries()
  });
  const tenants = useMemo(() => data.filter((tenant) => {
    const matchesQuery = [tenant.name, tenant.phone, tenant.room, tenant.aadhar, String(tenant.floor)].join(" ").toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === "All" || tenant.paymentStatus === filter || tenant.sharingType === filter || tenant.status === filter;
    return matchesQuery && matchesFilter;
  }), [data, query, filter]);

  return (
    <Page>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-orange-brand">Tenant operations</p>
          <h1 className="mt-2 text-4xl font-semibold">Tenants</h1>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="flex items-center gap-2 rounded-full border border-border px-3"><Search size={16} className="text-zinc-400" /><Input className="border-0 px-0" placeholder="Search name, phone, room..." value={query} onChange={(e) => setQuery(e.target.value)} /></div>
          <Select className="sm:w-44" value={filter} onChange={(e) => setFilter(e.target.value)}>
            {["All", "Pending", "Paid", "Overdue", "Partial", "2 Sharing", "3 Sharing", "4 Sharing", "Active", "Left"].map((item) => <option key={item}>{item}</option>)}
          </Select>
          <Button>Add Tenant</Button>
        </div>
      </div>
      <div className="space-y-3">
        {tenants.map((tenant) => <TenantRow key={tenant.id} tenant={tenant} onPaid={(t) => mutation.mutate({ id: t.id })} />)}
      </div>
    </Page>
  );
}
