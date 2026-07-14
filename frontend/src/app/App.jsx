import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import LoginPage from "../features/auth/LoginPage.jsx";
import SignupPage from "../features/auth/SignupPage.jsx";
import DashboardPage from "../features/dashboard/DashboardPage.jsx";
import TenantsPage from "../features/tenants/TenantsPage.jsx";
import RoomsPage from "../features/rooms/RoomsPage.jsx";
import PaymentsPage from "../features/payments/PaymentsPage.jsx";
import ReportsPage from "../features/reports/ReportsPage.jsx";
import SettingsPage from "../features/settings/SettingsPage.jsx";
import { AppShell } from "./AppShell.jsx";

export default function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/tenants" element={<TenantsPage />} />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/floors" element={<RoomsPage view="floors" />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/due-list" element={<PaymentsPage mode="due" />} />
          <Route path="/vacancies" element={<RoomsPage view="vacancies" />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}
