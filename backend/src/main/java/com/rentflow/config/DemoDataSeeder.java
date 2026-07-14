package com.rentflow.config;

import com.rentflow.auth.AppUser;
import com.rentflow.auth.AppUserRepository;
import com.rentflow.common.Enums.*;
import com.rentflow.payment.Payment;
import com.rentflow.property.*;
import com.rentflow.tenant.Tenant;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DemoDataSeeder implements CommandLineRunner {
  private final AppUserRepository users;
  private final PropertyRepository properties;
  private final PasswordEncoder passwordEncoder;

  private final List<String> firstNames = List.of("Rahul", "Karan", "Ajay", "Vikram", "Arjun", "Rohan", "Sahil", "Mohit", "Amit", "Nikhil", "Deepak", "Ritesh", "Manish", "Pranav", "Sameer", "Irfan", "Yash", "Harsh", "Sandeep", "Naveen");
  private final List<String> lastNames = List.of("Kumar", "Sharma", "Verma", "Patel", "Singh", "Gupta", "Mehta", "Reddy", "Nair", "Joshi");
  private final List<String> occupations = List.of("Software Engineer", "Student", "Designer", "Sales Executive", "Accountant", "Intern", "Bank Officer", "Teacher", "Analyst");

  @Override
  @Transactional
  public void run(String... args) {
    if (users.findByEmail("demo@rentflow.com").isPresent()) {
      return;
    }

    AppUser demo = new AppUser();
    demo.setOwnerName("Karan Perumal");
    demo.setPgName("RentFlow Residency");
    demo.setPhoneNumber("9876543210");
    demo.setEmail("demo@rentflow.com");
    demo.setPasswordHash(passwordEncoder.encode("demo123"));
    demo.setAddress("Bengaluru, India");
    demo.setRole(Role.DEMO);
    demo.setDemoAccount(true);
    demo.setReadOnly(true);
    users.save(demo);

    Property property = new Property();
    property.setOwner(demo);
    property.setName("RentFlow Residency");
    property.setAddress("Bengaluru, India");

    int tenantCounter = 1;
    for (int floorNumber = 1; floorNumber <= 5; floorNumber++) {
      Floor floor = new Floor();
      floor.setProperty(property);
      floor.setFloorNumber(floorNumber);
      int roomsOnFloor = floorNumber % 2 == 0 ? 4 : 5;
      for (int roomIndex = 1; roomIndex <= roomsOnFloor; roomIndex++) {
        Room room = new Room();
        room.setFloor(floor);
        room.setRoomNumber("%d%02d".formatted(floorNumber, roomIndex));
        int capacity = List.of(2, 3, 4).get((floorNumber + roomIndex) % 3);
        room.setCapacity(capacity);
        int occupied = Math.max(1, capacity - ((floorNumber + roomIndex) % 5 == 0 ? 1 : 0));
        for (int bedIndex = 0; bedIndex < capacity; bedIndex++) {
          Bed bed = new Bed();
          bed.setRoom(room);
          bed.setLabel("Bed " + (char) ('A' + bedIndex));
          if (bedIndex < occupied && tenantCounter <= 96) {
            Tenant tenant = tenant(property, room, tenantCounter);
            bed.setTenant(tenant);
            bed.setStatus(BedStatus.OCCUPIED);
            tenant.setBed(bed);
            room.getBeds().add(bed);
            tenantCounter++;
          } else {
            bed.setStatus(BedStatus.EMPTY);
            room.getBeds().add(bed);
          }
        }
        floor.getRooms().add(room);
      }
      property.getFloors().add(floor);
    }
    properties.save(property);
  }

  private Tenant tenant(Property property, Room room, int id) {
    Tenant tenant = new Tenant();
    String name = firstNames.get(id % firstNames.size()) + " " + lastNames.get((id + 3) % lastNames.size());
    tenant.setProperty(property);
    tenant.setName(name);
    tenant.setProfilePhotoUrl("https://api.dicebear.com/9.x/initials/svg?seed=" + name.replace(" ", "%20"));
    tenant.setPhone("9" + String.format("%09d", 100000000 + id * 27183 % 899999999));
    tenant.setAlternatePhone("8" + String.format("%09d", 100000000 + id * 31417 % 899999999));
    tenant.setAadharNumber("%04d %04d %04d".formatted(1000 + id * 7 % 8999, 1000 + id * 11 % 8999, 1000 + id * 13 % 8999));
    tenant.setOccupation(occupations.get(id % occupations.size()));
    tenant.setAddress((10 + id % 80) + ", " + List.of("Indiranagar", "Koramangala", "HSR Layout", "Wakad", "Kothrud").get(id % 5) + ", India");
    tenant.setEmergencyContact("+91 " + (7000000000L + id * 9973L));
    tenant.setJoiningDate(LocalDate.of(2025, (id % 12) + 1, (id % 26) + 1));
    BigDecimal rent = room.getCapacity() == 2 ? BigDecimal.valueOf(9500) : room.getCapacity() == 3 ? BigDecimal.valueOf(7600) : BigDecimal.valueOf(6500);
    tenant.setMonthlyRent(rent);
    tenant.setAdvanceAmount(rent.multiply(BigDecimal.valueOf(2)));
    tenant.setSharingType(room.getCapacity());
    tenant.setStatus(id % 19 == 0 ? TenantStatus.BLOCKED : TenantStatus.ACTIVE);
    tenant.setNotes(id % 6 == 0 ? "Prefers UPI receipt on WhatsApp." : "No special notes.");
    tenant.getPayments().add(payment(tenant, id, rent));
    return tenant;
  }

  private Payment payment(Tenant tenant, int id, BigDecimal rent) {
    Payment payment = new Payment();
    payment.setTenant(tenant);
    payment.setBillingMonth(LocalDate.now().getMonthValue());
    payment.setBillingYear(LocalDate.now().getYear());
    payment.setDueDate(LocalDate.now().withDayOfMonth(Math.min(tenant.getJoiningDate().getDayOfMonth(), 28)));
    payment.setExpectedAmount(rent);
    PaymentStatus status = List.of(PaymentStatus.PAID_ON_TIME, PaymentStatus.PENDING, PaymentStatus.OVERDUE, PaymentStatus.PARTIAL).get(id % 4);
    payment.setStatus(status);
    if (status == PaymentStatus.PAID_ON_TIME) {
      payment.setPaidAmount(rent);
      payment.setPaymentDate(payment.getDueDate());
      payment.setPaymentMethod(PaymentMethod.UPI);
      payment.setTransactionId("UPI-RF-" + id);
    } else if (status == PaymentStatus.PARTIAL) {
      payment.setPaidAmount(rent.divide(BigDecimal.valueOf(2)));
      payment.setPaymentDate(LocalDate.now());
      payment.setPaymentMethod(PaymentMethod.CASH);
    }
    return payment;
  }
}
