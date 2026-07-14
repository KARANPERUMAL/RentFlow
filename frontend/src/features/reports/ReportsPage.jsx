import { useQuery } from "@tanstack/react-query";
import { Download, FileSpreadsheet, PieChart } from "lucide-react";
import { Page } from "../../components/ui/Page.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { api } from "../../lib/api.js";
import { formatCurrency } from "../../lib/utils.js";

export default function ReportsPage() {
  const { data } = useQuery({ queryKey: ["dashboard"], queryFn: api.dashboard });
  const cards = data ? [
    ["Monthly Revenue", formatCurrency(data.cards.monthlyRevenue)],
    ["Pending", formatCurrency(data.cards.pendingRevenue)],
    ["Collection", formatCurrency(data.cards.collectedRevenue)],
    ["Occupancy", `${data.cards.occupancy}%`],
    ["Vacancy", data.cards.vacantBeds],
    ["New Joinings", 9],
    ["Left Tenants", 3],
    ["Payment History", "12 months"]
  ] : [];
  return (
    <Page>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-sm font-medium text-orange-brand">Owner intelligence</p>
          <h1 className="mt-2 text-4xl font-semibold">Reports</h1>
        </div>
        <div className="flex gap-2"><Button variant="secondary"><FileSpreadsheet size={16} /> Excel</Button><Button><Download size={16} /> PDF</Button></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value]) => (
          <Card key={label}>
            <PieChart size={18} className="text-orange-brand" />
            <p className="mt-5 text-sm text-zinc-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold">{value}</p>
          </Card>
        ))}
      </div>
      <Card hover={false} className="mt-4">
        <h2 className="text-lg font-semibold">Future-ready modules</h2>
        <div className="mt-4 grid gap-2 md:grid-cols-3">
          {["Payment gateways", "WhatsApp reminders", "Digital receipts", "Staff roles", "Expenses", "Complaints"].map((item) => (
            <div key={item} className="rounded-full border border-border px-4 py-3 text-sm">{item}</div>
          ))}
        </div>
      </Card>
    </Page>
  );
}
