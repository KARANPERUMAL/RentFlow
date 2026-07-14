import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export function Card({ className, children, hover = true }) {
  return (
    <motion.div
      whileHover={hover ? { y: -3 } : undefined}
      transition={{ duration: 0.18 }}
      className={cn("rounded-xl border border-border bg-white p-5", className)}
    >
      {children}
    </motion.div>
  );
}
