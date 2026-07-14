package com.rentflow.dashboard;

import com.rentflow.dashboard.DashboardDtos.*;
import com.rentflow.payment.Payment;
import com.rentflow.payment.PaymentRepository;
import com.rentflow.property.RoomRepository;
import com.rentflow.tenant.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static com.rentflow.common.Enums.PaymentStatus.*;

@Service
@RequiredArgsConstructor
public class DashboardService {
  private final TenantRepository tenants;
  private final RoomRepository rooms;
  private final PaymentRepository payments;

  @Transactional(readOnly = true)
  public DashboardResponse demoDashboard() {
    Long propertyId = 1L;
    LocalDate today = LocalDate.now();
    List<Payment> ledger = payments.findByTenantPropertyId(propertyId);
    long totalBeds = rooms.findByFloorPropertyId(propertyId).stream().mapToLong(room -> room.getBeds().size()).sum();
    long occupiedBeds = rooms.findByFloorPropertyId(propertyId).stream().flatMap(room -> room.getBeds().stream()).filter(bed -> bed.getTenant() != null).count();
    BigDecimal monthly = ledger.stream().map(Payment::getExpectedAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
    BigDecimal collected = ledger.stream().map(payment -> payment.getPaidAmount() == null ? BigDecimal.ZERO : payment.getPaidAmount()).reduce(BigDecimal.ZERO, BigDecimal::add);
    BigDecimal pending = monthly.subtract(collected);
    Metrics metrics = new Metrics(
        payments.countByTenantPropertyIdAndDueDate(propertyId, today),
        payments.countByTenantPropertyIdAndDueDate(propertyId, today.plusDays(1)),
        ledger.stream().filter(payment -> !payment.getDueDate().isBefore(today) && !payment.getDueDate().isAfter(today.plusDays(7))).count(),
        ledger.stream().filter(payment -> payment.getStatus() == OVERDUE).count(),
        tenants.count(),
        occupiedBeds,
        totalBeds - occupiedBeds,
        monthly,
        collected,
        pending,
        totalBeds == 0 ? 0 : (int) Math.round((occupiedBeds * 100.0) / totalBeds)
    );
    return new DashboardResponse("Good Morning", "Karan Perumal", "RentFlow Residency", today, metrics, List.of(
        "Payment received by UPI for Room 204",
        "Room 305 Bed C is vacant",
        "Partial payment recorded for a tenant",
        "Monthly due cycle generated"
    ));
  }
}
