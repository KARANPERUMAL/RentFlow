const firstNames = ["Rahul", "Karan", "Ajay", "Vikram", "Arjun", "Rohan", "Sahil", "Mohit", "Amit", "Nikhil", "Deepak", "Ritesh", "Manish", "Pranav", "Sameer", "Irfan", "Yash", "Harsh", "Sandeep", "Naveen"];
const lastNames = ["Kumar", "Sharma", "Verma", "Patel", "Singh", "Gupta", "Mehta", "Reddy", "Nair", "Joshi"];
const occupationts = ["Software Engineer", "Student", "Designer", "Sales Executive", "Accountant", "Intern", "Bank Officer", "Teacher", "Analyst"];
const statuses = ["Paid", "Pending", "Overdue", "Partial"];

function rand(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function pick(list, seed) {
  return list[Math.floor(rand(seed) * list.length)];
}

export function createDemoData() {
  let tenantId = 1;
  const floors = Array.from({ length: 5 }, (_, floorIndex) => {
    const floorNumber = floorIndex + 1;
    const rooms = Array.from({ length: floorIndex % 2 === 0 ? 5 : 4 }, (_, roomIndex) => {
      const roomNumber = `${floorNumber}${String(roomIndex + 1).padStart(2, "0")}`;
      const capacity = [2, 3, 4][(floorIndex + roomIndex) % 3];
      const occupied = Math.max(1, capacity - ((floorIndex + roomIndex) % 5 === 0 ? 1 : 0));
      const beds = Array.from({ length: capacity }, (_, bedIndex) => {
        if (bedIndex >= occupied) return { id: `${roomNumber}-${bedIndex}`, label: `Bed ${String.fromCharCode(65 + bedIndex)}`, tenantId: null };
        const id = tenantId++;
        return { id: `${roomNumber}-${bedIndex}`, label: `Bed ${String.fromCharCode(65 + bedIndex)}`, tenantId: id };
      });
      return { id: `room-${roomNumber}`, roomNumber, capacity, occupied, available: capacity - occupied, floorNumber, beds };
    });
    return { id: `floor-${floorNumber}`, floorNumber, rooms };
  });

  const tenants = floors.flatMap((floor) =>
    floor.rooms.flatMap((room) =>
      room.beds.filter((bed) => bed.tenantId).map((bed) => {
        const id = bed.tenantId;
        const name = `${pick(firstNames, id)} ${pick(lastNames, id + 41)}`;
        const day = ((id * 7) % 26) + 1;
        const status = statuses[id % statuses.length];
        const rent = room.capacity === 2 ? 9500 : room.capacity === 3 ? 7600 : 6500;
        return {
          id,
          avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}`,
          name,
          phone: `9${Math.floor(100000000 + rand(id + 3) * 899999999)}`,
          alternatePhone: `8${Math.floor(100000000 + rand(id + 9) * 899999999)}`,
          aadhar: `${Math.floor(1000 + rand(id) * 8999)} ${Math.floor(1000 + rand(id + 1) * 8999)} ${Math.floor(1000 + rand(id + 2) * 8999)}`,
          occupation: pick(occupations, id + 8),
          address: `${Math.floor(10 + rand(id + 12) * 90)}, ${pick(["Indiranagar", "Koramangala", "HSR Layout", "Wakad", "Kothrud", "Velachery"], id)}, India`,
          emergencyContact: `+91 ${Math.floor(7000000000 + rand(id + 15) * 999999999)}`,
          joiningDate: `2025-${String(((id + 2) % 12) + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
          advanceAmount: rent * 2,
          monthlyRent: rent,
          sharingType: `${room.capacity} Sharing`,
          floor: floor.floorNumber,
          room: room.roomNumber,
          bed: bed.label,
          status: id % 19 === 0 ? "Blocked" : "Active",
          paymentStatus: status,
          dueLabel: status === "Overdue" ? "Overdue" : id % 5 === 0 ? "Due Today" : id % 7 === 0 ? "Tomorrow" : "Upcoming",
          notes: id % 6 === 0 ? "Prefers UPI receipt on WhatsApp." : "No special notes.",
          paymentHistory: [
            { month: "May 2026", date: "20 May 2026", amount: rent, status: "Paid On Time" },
            { month: "June 2026", date: "20 June 2026", amount: status === "Partial" ? rent / 2 : rent, status }
          ]
        };
      })
    )
  );

  return {
    user: {
      ownerName: "Karan Perumal",
      pgName: "RentFlow Residency",
      email: "demo@rentflow.com",
      role: "Demo Owner",
      readOnly: true
    },
    floors,
    tenants,
    activities: [
      "Rahul Kumar marked June rent paid by UPI",
      "Room 305 Bed C became vacant",
      "Partial payment recorded for Ajay Patel",
      "New tenant profile added to Room 204"
    ]
  };
}
