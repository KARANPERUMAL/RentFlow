import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Building2, CreditCard, DoorOpen, Home, Layers3, LogOut, Menu, Search, Settings, Users, FileBarChart, Bell } from "lucide-react";
import { useState } from "react";
import { Button } from "../components/ui/Button.jsx";
import { Input } from "../components/ui/Input.jsx";
import { cn } from "../lib/utils.js";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/tenants", label: "Tenants", icon: Users },
  { to: "/rooms", label: "Rooms", icon: DoorOpen },
  { to: "/floors", label: "Floors", icon: Layers3 },
  { to: "/payments", label: "Payments", icon: CreditCard },
  { to: "/due-list", label: "Due List", icon: Bell },
  { to: "/vacancies", label: "Vacancies", icon: Building2 },
  { to: "/reports", label: "Reports", icon: FileBarChart },
  { to: "/settings", label: "Settings", icon: Settings }
];

export function AppShell() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-30 border-b border-border bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          <button className="rounded-full border border-border p-2 lg:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-black bg-black text-sm font-semibold text-white">Rf</div>
            <div>
              <p className="text-sm font-semibold leading-none">RentFlow</p>
              <p className="mt-1 text-xs text-zinc-500">PG management suite</p>
            </div>
          </div>
          <div className="ml-auto hidden w-full max-w-md items-center gap-2 rounded-full border border-border px-3 md:flex">
            <Search size={16} className="text-zinc-400" />
            <Input className="h-10 border-0 px-0 focus:border-0" placeholder="Search tenants, rooms, phone, Aadhaar..." />
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              localStorage.removeItem("rentflow.session");
              navigate("/login");
            }}
          >
            <LogOut size={16} /> Logout
          </Button>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl lg:grid-cols-[236px_1fr]">
        <aside className={cn("border-r border-border bg-white px-4 py-5 lg:block", open ? "block" : "hidden")}>
          <nav className="sticky top-20 flex flex-col gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-full px-3 py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-muted hover:text-black",
                    isActive && "bg-black text-white hover:bg-black hover:text-white"
                  )
                }
              >
                <item.icon size={17} />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <Outlet />
      </div>
    </div>
  );
}
