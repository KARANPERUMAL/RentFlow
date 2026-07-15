import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { BedDouble, DoorOpen, Plus } from "lucide-react";
import { Page } from "../../components/ui/Page.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { api } from "../../lib/api.js";

export default function RoomsPage({ view = "rooms" }) {
  const queryClient = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["floors"], queryFn: api.floors });
  const [selected, setSelected] = useState("floor-1");
  const floor = data.find((item) => item.id === selected) || data[0];
  const addFloorMutation = useMutation({
    mutationFn: api.addFloor,
    onSuccess: (newFloor) => {
      setSelected(newFloor.id);
      queryClient.invalidateQueries({ queryKey: ["floors"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    }
  });
  const addRoomMutation = useMutation({
    mutationFn: ({ floorId, payload }) => api.addRoom(floorId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["floors"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    }
  });

  function addRoom() {
    if (!floor) return;
    const roomNumber = window.prompt("Room number", `${floor.floorNumber}${String(floor.rooms.length + 1).padStart(2, "0")}`);
    if (!roomNumber) return;
    const capacity = Number(window.prompt("Capacity: 2, 3 or 4 sharing", "3"));
    if (![2, 3, 4].includes(capacity)) return;
    addRoomMutation.mutate({ floorId: floor.id, payload: { roomNumber, capacity } });
  }

  return (
    <Page>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-orange-brand">{view === "vacancies" ? "Vacancy map" : "Building structure"}</p>
          <h1 className="mt-2 text-4xl font-semibold">{view === "vacancies" ? "Vacancies" : "Rooms"}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => addFloorMutation.mutate()}><Plus size={16} /> Floor</Button>
          <Button onClick={addRoom}><Plus size={16} /> Add Room</Button>
        </div>
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
            <Card key={room.id} hover={false} className="min-w-0">
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <p className="text-sm text-zinc-500">Room</p>
                  <h2 className="mt-1 text-2xl font-semibold">{room.roomNumber}</h2>
                </div>
                <DoorOpen className="text-orange-brand" size={20} />
              </div>
              <div className="mb-4 grid grid-cols-3 gap-2 text-center">
                <div className="min-w-0 rounded-xl border border-border px-2 py-3"><p className="truncate text-xs text-zinc-500">Capacity</p><p className="mt-1 text-sm font-semibold">{room.capacity}</p></div>
                <div className="min-w-0 rounded-xl border border-border px-2 py-3"><p className="truncate text-xs text-zinc-500">Occupied</p><p className="mt-1 text-sm font-semibold">{room.occupied}</p></div>
                <div className="min-w-0 rounded-xl border border-border px-2 py-3"><p className="truncate text-xs text-zinc-500">Available</p><p className="mt-1 text-sm font-semibold">{room.available}</p></div>
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
          {!floor?.rooms.length && <div className="rounded-xl border border-border p-8 text-sm text-zinc-500">No rooms on this floor yet. Use Add Room to create one.</div>}
        </section>
      </div>
    </Page>
  );
}
