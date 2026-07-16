import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
}

export function todayLabel() {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date());
}

export function startOfDay(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function monthlyDueDate(tenant, referenceDate = new Date()) {
  const day = Number(tenant.joiningDate?.slice(-2) || 1);
  return new Date(referenceDate.getFullYear(), referenceDate.getMonth(), Math.min(day, 28));
}

export function daysUntilDue(tenant, referenceDate = new Date()) {
  const today = startOfDay(referenceDate);
  const dueDate = monthlyDueDate(tenant, referenceDate);
  return Math.round((dueDate.getTime() - today.getTime()) / 86400000);
}

export function isPaidStatus(status) {
  return ["Paid", "Paid On Time", "Paid Early"].includes(status);
}

export function computedPaymentStatus(tenant, referenceDate = new Date()) {
  if (isPaidStatus(tenant.paymentStatus)) return "Paid";
  if (tenant.paymentStatus === "Partial") return "Partial";
  return daysUntilDue(tenant, referenceDate) < 0 ? "Overdue" : "Pending";
}

export function dueBucket(tenant, referenceDate = new Date()) {
  if (isPaidStatus(tenant.paymentStatus)) return "Paid";
  if (tenant.paymentStatus === "Partial") return "Partial";
  const days = daysUntilDue(tenant, referenceDate);
  if (days < 0) return "Overdue";
  if (days === 0) return "Today's Due";
  if (days === 1) return "Tomorrow";
  if (days <= 7) return "Next 7 Days";
  return "Upcoming";
}

export function dueDateLabel(tenant, referenceDate = new Date()) {
  return monthlyDueDate(tenant, referenceDate).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short"
  });
}

export function statusTone(status) {
  return {
    Paid: "border-emerald-200 bg-emerald-50 text-emerald-700",
    "Paid Early": "border-emerald-200 bg-emerald-50 text-emerald-700",
    "Paid On Time": "border-emerald-200 bg-emerald-50 text-emerald-700",
    Late: "border-amber-200 bg-amber-50 text-amber-700",
    Pending: "border-zinc-200 bg-zinc-50 text-zinc-700",
    Partial: "border-orange-200 bg-orange-50 text-orange-700",
    Overdue: "border-red-200 bg-red-50 text-red-700",
    Active: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Left: "border-zinc-200 bg-zinc-50 text-zinc-700",
    Blocked: "border-red-200 bg-red-50 text-red-700"
  }[status] ?? "border-zinc-200 bg-zinc-50 text-zinc-700";
}
