import { cn } from "../../lib/utils";

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-full border border-border bg-white px-4 text-sm outline-none transition focus:border-black",
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }) {
  return (
    <select
      className={cn("h-11 w-full rounded-full border border-border bg-white px-4 text-sm outline-none transition focus:border-black", className)}
      {...props}
    >
      {children}
    </select>
  );
}
