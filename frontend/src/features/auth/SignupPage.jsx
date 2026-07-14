import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "../../components/ui/Button.jsx";
import { Input, Select } from "../../components/ui/Input.jsx";
import { api } from "../../lib/api.js";

export default function SignupPage() {
  const navigate = useNavigate();
  const [floors, setFloors] = useState([{ floor: 1, rooms: [{ number: "101", capacity: 4 }] }]);
  const [form, setForm] = useState({
    pgName: "",
    ownerName: "",
    phoneNumber: "",
    email: "",
    password: "",
    address: ""
  });

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function finishSetup() {
    const session = await api.registerOwner({ ...form, floors });
    localStorage.setItem("rentflow.session", JSON.stringify(session));
    navigate("/dashboard");
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-orange-brand">Owner setup</p>
          <h1 className="mt-2 text-4xl font-semibold">Create your PG structure</h1>
        </div>
        <Link className="text-sm underline underline-offset-4" to="/login">Back to login</Link>
      </div>
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <section className="rounded-xl border border-border p-5">
          <div className="space-y-4">
            <Input placeholder="PG Name" value={form.pgName} onChange={(event) => updateForm("pgName", event.target.value)} />
            <Input placeholder="Owner Name" value={form.ownerName} onChange={(event) => updateForm("ownerName", event.target.value)} />
            <Input placeholder="Phone Number" value={form.phoneNumber} onChange={(event) => updateForm("phoneNumber", event.target.value)} />
            <Input placeholder="Email" value={form.email} onChange={(event) => updateForm("email", event.target.value)} />
            <Input placeholder="Password" type="password" value={form.password} onChange={(event) => updateForm("password", event.target.value)} />
            <Input placeholder="Address" value={form.address} onChange={(event) => updateForm("address", event.target.value)} />
          </div>
        </section>
        <section className="rounded-xl border border-border p-5">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Building wizard</h2>
            <Button variant="secondary" size="sm" onClick={() => setFloors([...floors, { floor: floors.length + 1, rooms: [] }])}><Plus size={16} /> Floor</Button>
          </div>
          <div className="space-y-4">
            {floors.map((floor, floorIndex) => (
              <div key={floor.floor} className="rounded-xl border border-border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-medium">Floor {floor.floor}</p>
                  <Button variant="ghost" size="sm" onClick={() => {
                    const next = [...floors];
                    next[floorIndex].rooms.push({ number: `${floor.floor}${String(next[floorIndex].rooms.length + 1).padStart(2, "0")}`, capacity: 3 });
                    setFloors(next);
                  }}><Plus size={16} /> Room</Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {floor.rooms.map((room, roomIndex) => (
                    <div key={`${floor.floor}-${roomIndex}`} className="flex gap-2">
                      <Input value={room.number} onChange={(event) => {
                        const next = [...floors];
                        next[floorIndex].rooms[roomIndex].number = event.target.value;
                        setFloors(next);
                      }} />
                      <Select value={room.capacity} onChange={(event) => {
                        const next = [...floors];
                        next[floorIndex].rooms[roomIndex].capacity = Number(event.target.value);
                        setFloors(next);
                      }}>
                        <option value="2">2 Sharing</option>
                        <option value="3">3 Sharing</option>
                        <option value="4">4 Sharing</option>
                      </Select>
                      <Button variant="ghost" size="sm" aria-label="Remove room"><Trash2 size={16} /></Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <Button className="mt-5 w-full" size="lg" onClick={finishSetup}>Finish setup</Button>
        </section>
      </div>
    </main>
  );
}
