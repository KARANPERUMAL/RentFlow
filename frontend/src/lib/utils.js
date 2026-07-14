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
