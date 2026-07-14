import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowRight, Building2 } from "lucide-react";
import { Button } from "../../components/ui/Button.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { api } from "../../lib/api.js";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(3)
});

export default function LoginPage() {
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, setError, formState } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "demo@rentflow.com", password: "demo123" }
  });

  async function onSubmit(values) {
    try {
      const session = await api.login(values);
      localStorage.setItem("rentflow.session", JSON.stringify(session));
      navigate("/dashboard");
    } catch (error) {
      setError("root", { message: error.message });
    }
  }

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[1fr_0.85fr]">
      <section className="flex items-center justify-center px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white"><Building2 size={20} /></div>
            <div>
              <p className="font-semibold">RentFlow</p>
              <p className="text-sm text-zinc-500">Modern PG operations</p>
            </div>
          </div>
          <h1 className="text-4xl font-semibold tracking-normal text-black">Run your PG without the notebook.</h1>
          <p className="mt-4 text-base leading-7 text-zinc-600">Demo mode is read-only with realistic data. Owner accounts start with building setup first, tenants later.</p>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
            <Input placeholder="Email" {...register("email")} />
            <Input placeholder="Password" type="password" {...register("password")} />
            {(formState.errors.email || formState.errors.password) && <p className="text-sm text-red-600">Enter a valid email and password.</p>}
            {formState.errors.root && <p className="text-sm text-red-600">{formState.errors.root.message}</p>}
            <Button className="w-full" size="lg">Continue <ArrowRight size={18} /></Button>
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => {
                setValue("email", "demo@rentflow.com");
                setValue("password", "demo123");
              }}
            >
              Use demo credentials
            </Button>
          </form>
          <p className="mt-6 text-sm text-zinc-600">New owner? <Link to="/signup" className="font-medium text-black underline underline-offset-4">Create account</Link></p>
        </motion.div>
      </section>
      <section className="hidden border-l border-border bg-zinc-50 p-8 lg:block">
        <div className="flex h-full flex-col justify-end rounded-xl border border-border bg-white p-8">
          <div className="grid gap-3">
            {["Today due: 12 tenants", "Occupancy: 91%", "Pending revenue: ₹86,500", "Vacant beds: 8"].map((text) => (
              <div key={text} className="rounded-full border border-border px-5 py-4 text-sm font-medium">{text}</div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
