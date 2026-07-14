import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, BedDouble, CalendarClock, IndianRupee, Users } from "lucide-react";
import { Page } from "../../components/ui/Page.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { api } from "../../lib/api.js";
import { formatCurrency, todayLabel } from "../../lib/utils.js";

function Metric({ label, value, icon: Icon, accent }) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <p className="text-sm text-zinc-500">{label}</p>
        <div className="rounded-full border border-border p-2"><Icon size={16} className={accent ? "text-orange-brand" : "text-zinc-600"} /></div>
      </div>
      <p className="mt-6 text-3xl font-semibold">{value}</p>
    </Card>
  );
}

export default function DashboardPage() {
  const { data } = useQuery({ queryKey: ["dashboard"], queryFn: api.dashboard });
  if (!data) return <Page><div className="h-64 animate-pulse rounded-xl bg-zinc-100" /></Page>;
  const c = data.cards;

  return (
    <Page>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-orange-brand">Good Morning</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-normal">{data.user.ownerName}</h1>
          <p className="mt-2 text-zinc-500">{data.user.pgName} · {todayLabel()}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary">Add tenant</Button>
          <Button>Mark paid</Button>
        </div>
      </div>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Today's Due" value={c.todayDue} icon={CalendarClock} accent />
        <Metric label="Tomorrow Due" value={c.tomorrowDue} icon={CalendarClock} />
        <Metric label="Upcoming 7 Days" value={c.upcoming7} icon={CalendarClock} />
        <Metric label="Overdue" value={c.overdue} icon={ArrowUpRight} accent />
        <Metric label="Total Tenants" value={c.totalTenants} icon={Users} />
        <Metric label="Occupied Beds" value={c.occupiedBeds} icon={BedDouble} />
        <Metric label="Vacant Beds" value={c.vacantBeds} icon={BedDouble} accent />
        <Metric label="Occupancy" value={`${c.occupancy}%`} icon={BedDouble} />
      </section>
      <section className="mt-4 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <Card hover={false}>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Revenue</h2>
            <Button variant="ghost" size="sm">View reports</Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border p-4"><p className="text-sm text-zinc-500">Monthly</p><p className="mt-4 text-2xl font-semibold">{formatCurrency(c.monthlyRevenue)}</p></div>
            <div className="rounded-xl border border-border p-4"><p className="text-sm text-zinc-500">Collected</p><p className="mt-4 text-2xl font-semibold">{formatCurrency(c.collectedRevenue)}</p></div>
            <div className="rounded-xl border border-border p-4"><p className="text-sm text-zinc-500">Pending</p><p className="mt-4 text-2xl font-semibold">{formatCurrency(c.pendingRevenue)}</p></div>
          </div>
        </Card>
        <Card hover={false}>
          <h2 className="mb-5 text-lg font-semibold">Recent Activities</h2>
          <div className="space-y-3">
            {data.activities.map((activity) => (
              <div key={activity} className="rounded-xl border border-border px-4 py-3 text-sm text-zinc-700">{activity}</div>
            ))}
          </div>
        </Card>
      </section>
    </Page>
  );
}
