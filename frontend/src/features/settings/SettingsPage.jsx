import { Bell, Building2, ShieldCheck, UserRound } from "lucide-react";
import { Page } from "../../components/ui/Page.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Input } from "../../components/ui/Input.jsx";

export default function SettingsPage() {
  return (
    <Page>
      <div className="mb-6">
        <p className="text-sm font-medium text-orange-brand">Configuration</p>
        <h1 className="mt-2 text-4xl font-semibold">Settings</h1>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Card hover={false}>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold"><Building2 size={18} /> Property</h2>
          <div className="space-y-3"><Input defaultValue="RentFlow Residency" /><Input defaultValue="Bengaluru, India" /><Button>Save property</Button></div>
        </Card>
        <Card hover={false}>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold"><UserRound size={18} /> Owner</h2>
          <div className="space-y-3"><Input defaultValue="Karan Perumal" /><Input defaultValue="demo@rentflow.com" /><Button>Save owner</Button></div>
        </Card>
        <Card hover={false}>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold"><ShieldCheck size={18} /> Access</h2>
          <p className="text-sm leading-6 text-zinc-600">Demo users are read-only. Owner, Manager and Accountant roles are reserved in the backend model for future expansion.</p>
        </Card>
        <Card hover={false}>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold"><Bell size={18} /> Reminders</h2>
          <p className="text-sm leading-6 text-zinc-600">WhatsApp, SMS and push notification hooks can be attached to the payment reminder service without changing tenant records.</p>
        </Card>
      </div>
    </Page>
  );
}
