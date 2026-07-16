import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CreditCard, Download } from "lucide-react";
import { Page } from "../../components/ui/Page.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { api } from "../../lib/api.js";
import { computedPaymentStatus, dueBucket, dueDateLabel, formatCurrency, monthlyDueDate } from "../../lib/utils.js";

const statusRank = {
  Overdue: 0,
  Pending: 1,
  Partial: 2,
  Paid: 3,
  "Paid On Time": 3,
  "Paid Early": 3
};

function matchesCard(tenant, card) {
  if (card === "All") return true;
  if (card === "Overdue") return computedPaymentStatus(tenant) === "Overdue";
  if (card === "Partial") return computedPaymentStatus(tenant) === "Partial";
  if (["Today's Due", "Tomorrow", "Next 7 Days"].includes(card)) return dueBucket(tenant) === card;
  return true;
}

export default function PaymentsPage({ mode = "payments" }) {
  const { data = [] } = useQuery({ queryKey: ["tenants"], queryFn: api.tenants });
  const [activeCard, setActiveCard] = useState("All");
  const sorted = [...data].sort((a, b) => {
    const statusDiff = (statusRank[computedPaymentStatus(a)] ?? 9) - (statusRank[computedPaymentStatus(b)] ?? 9);
    if (statusDiff !== 0) return statusDiff;
    return monthlyDueDate(a).getTime() - monthlyDueDate(b).getTime();
  });
  const rows = sorted.filter((tenant) => matchesCard(tenant, activeCard));
  const cards = ["Today's Due", "Tomorrow", "Next 7 Days", "Overdue", "Partial"];

  return (
    <Page>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-sm font-medium text-orange-brand">Payment ledger</p>
          <h1 className="mt-2 text-4xl font-semibold">{mode === "due" ? "Due List" : "Payments"}</h1>
        </div>
        <Button variant="secondary"><Download size={16} /> Export</Button>
      </div>
      <div className="mb-4 grid gap-4 md:grid-cols-5">
        {cards.map((item) => (
          <button
            key={item}
            onClick={() => setActiveCard(activeCard === item ? "All" : item)}
            className={`rounded-xl border p-5 text-left transition hover:-translate-y-0.5 ${activeCard === item ? "border-black bg-black text-white" : "border-border bg-white"}`}
          >
            <p className={`text-sm ${activeCard === item ? "text-white/70" : "text-zinc-500"}`}>{item}</p>
            <p className="mt-5 text-3xl font-semibold">{data.filter((tenant) => matchesCard(tenant, item)).length}</p>
          </button>
        ))}
      </div>
      {activeCard !== "All" && (
        <div className="mb-3 flex items-center justify-between rounded-full border border-border px-4 py-2 text-sm">
          <span>Filtering by {activeCard}</span>
          <button className="font-medium underline underline-offset-4" onClick={() => setActiveCard("All")}>Clear</button>
        </div>
      )}
      <Card hover={false} className="p-0">
        <div className="grid grid-cols-[1fr_120px_120px_120px] border-b border-border px-4 py-3 text-xs font-medium uppercase text-zinc-400">
          <span>Tenant</span><span>Due Date</span><span>Amount</span><span>Status</span>
        </div>
        {rows.map((tenant) => (
          <div key={tenant.id} className="grid grid-cols-[1fr_120px_120px_120px] items-center border-b border-border px-4 py-4 text-sm last:border-b-0">
            <span className="flex items-center gap-3"><CreditCard size={16} /> {tenant.name}<span className="text-zinc-400">Room {tenant.room}</span></span>
            <span>{dueDateLabel(tenant)}</span>
            <span className="font-medium">{formatCurrency(tenant.monthlyRent)}</span>
            <Badge>{computedPaymentStatus(tenant)}</Badge>
          </div>
        ))}
        {!rows.length && <div className="px-4 py-10 text-center text-sm text-zinc-500">No tenants match this due filter.</div>}
      </Card>
    </Page>
  );
}
