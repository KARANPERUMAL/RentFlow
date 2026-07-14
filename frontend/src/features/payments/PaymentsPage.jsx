import { useQuery } from "@tanstack/react-query";
import { CreditCard, Download, IndianRupee } from "lucide-react";
import { Page } from "../../components/ui/Page.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { api } from "../../lib/api.js";
import { formatCurrency } from "../../lib/utils.js";

export default function PaymentsPage({ mode = "payments" }) {
  const { data = [] } = useQuery({ queryKey: ["tenants"], queryFn: api.tenants });
  const rows = mode === "due" ? data.filter((tenant) => tenant.paymentStatus !== "Paid") : data.slice(0, 36);
  return (
    <Page>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-sm font-medium text-orange-brand">Payment ledger</p>
          <h1 className="mt-2 text-4xl font-semibold">{mode === "due" ? "Due List" : "Payments"}</h1>
        </div>
        <Button variant="secondary"><Download size={16} /> Export</Button>
      </div>
      <div className="mb-4 grid gap-4 md:grid-cols-4">
        {["Today's Due", "Tomorrow", "Next 7 Days", "Overdue"].map((item) => (
          <Card key={item}><p className="text-sm text-zinc-500">{item}</p><p className="mt-5 text-3xl font-semibold">{data.filter((tenant) => tenant.dueLabel === item || tenant.paymentStatus === item).length}</p></Card>
        ))}
      </div>
      <Card hover={false} className="p-0">
        <div className="grid grid-cols-[1fr_120px_120px_120px] border-b border-border px-4 py-3 text-xs font-medium uppercase text-zinc-400">
          <span>Tenant</span><span>Due Date</span><span>Amount</span><span>Status</span>
        </div>
        {rows.map((tenant) => (
          <div key={tenant.id} className="grid grid-cols-[1fr_120px_120px_120px] items-center border-b border-border px-4 py-4 text-sm last:border-b-0">
            <span className="flex items-center gap-3"><CreditCard size={16} /> {tenant.name}<span className="text-zinc-400">Room {tenant.room}</span></span>
            <span>{tenant.joiningDate.slice(-2)} Jul</span>
            <span className="font-medium">{formatCurrency(tenant.monthlyRent)}</span>
            <Badge>{tenant.paymentStatus}</Badge>
          </div>
        ))}
      </Card>
    </Page>
  );
}
