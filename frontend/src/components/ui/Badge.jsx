import { cn, statusTone } from "../../lib/utils";

export function Badge({ children, tone, className }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium", tone || statusTone(children), className)}>
      {children}
    </span>
  );
}
