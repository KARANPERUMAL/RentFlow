import { cn } from "../../lib/utils";

export function Button({ className, variant = "primary", size = "md", ...props }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full border text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-brand",
        variant === "primary" && "border-black bg-black text-white hover:-translate-y-0.5",
        variant === "secondary" && "border-border bg-white text-black hover:-translate-y-0.5 hover:border-black",
        variant === "ghost" && "border-transparent bg-transparent text-zinc-700 hover:bg-muted",
        variant === "danger" && "border-red-200 bg-red-50 text-red-700 hover:border-red-300",
        size === "sm" && "h-9 px-3",
        size === "md" && "h-10 px-4",
        size === "lg" && "h-12 px-6",
        className
      )}
      {...props}
    />
  );
}
