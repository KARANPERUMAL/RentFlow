import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { BedDouble, DoorOpen, Plus } from "lucide-react";
import { Page } from "../../components/ui/Page.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { api } from "../../lib/api.js";

export default function RoomsPage({ view = "rooms" }) {
  const { data = [] } = useQuery({ queryKey: ["floors"], queryFn: api.floors });
  const [selected, setSelected] = useState("floor-1");
  const floor = data.find((item) => item.id === selected) || data[0];

  return (
    <Page>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-sm font-medium text-orange-brand">{view === "vacancies" ? "Vacancy map" : "Building structure"}</p>
          <h1 className="mt-2 text-4xl font-semibold">{view === "floors" ? "Floors" : view === "vacancies" ? "Vacancies" : "Rooms"}</h1>
        </div>
        <Button><Plus size={16} /> Add Room</Button>
      </div>
      <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
        <aside className="space-y-2">
          {data.map((item) => (
            <button key={item.id} onClick={() => setSelected(item.id)} className={`w-full rounded-full border px-4 py-3 text-left text-sm font-medium transition ${selected === item.id ? "border-black bg-black text-white" : "border-border hover:border-black"}`}>
              Floor {item.floorNumber}
            </button>
          ))}
        </aside>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {floor?.rooms.map((room) => (
            <Card key={room.id} hover={false}>
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <p className="text-sm text-zinc-500">Room</p>
                  <h2 className="mt-1 text-2xl font-semibold">{room.roomNumber}</h2>
                </div>
                <DoorOpen className="text-orange-brand" size={20} />
              </div>
              <div className="mb-4 grid grid-cols-3 gap-2 text-center text-sm">
                <div className="rounded-xl border border-border p-3"><p className="text-zinc-500">Capacity</p><p className="font-semibold">{room.capacity}</p></div>
                <div className="rounded-xl border border-border p-3"><p className="text-zinc-500">Occupied</p><p className="font-semibold">{room.occupied}</p></div>
                <div className="rounded-xl border border-border p-3"><p className="text-zinc-500">Available</p><p className="font-semibold">{room.available}</p></div>
              </div>
              <div className="space-y-2">
                <AnimatePresence>
                  {room.beds.map((bed) => (
                    <motion.div layout key={bed.id} className="flex items-center justify-between rounded-xl border border-border px-3 py-2 text-sm">
                      <span className="flex items-center gap-2"><BedDouble size={15} /> {bed.label}</span>
                      {bed.tenantId ? <Badge>Active</Badge> : <Badge tone="border-orange-200 bg-orange-50 text-orange-700">Empty</Badge>}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </Card>
          ))}
        </section>
      </div>
    </Page>
  );
}
