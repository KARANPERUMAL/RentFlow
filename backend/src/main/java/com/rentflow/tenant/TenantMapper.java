package com.rentflow.tenant;

import com.rentflow.payment.Payment;
import com.rentflow.tenant.TenantDtos.PaymentSummary;
import com.rentflow.tenant.TenantDtos.TenantResponse;
import org.springframework.stereotype.Component;

import java.time.Month;

@Component
public class TenantMapper {
  public TenantResponse toResponse(Tenant tenant) {
    var bed = tenant.getBed();
    var room = bed == null ? null : bed.getRoom();
    var floor = room == null ? null : room.getFloor();
    return new TenantResponse(
        tenant.getId(),
        tenant.getProfilePhotoUrl(),
        tenant.getName(),
        tenant.getPhone(),
        tenant.getAlternatePhone(),
        tenant.getAadharNumber(),
        tenant.getOccupation(),
        tenant.getAddress(),
        tenant.getEmergencyContact(),
        tenant.getJoiningDate(),
        tenant.getAdvanceAmount(),
        tenant.getMonthlyRent(),
        tenant.getSharingType(),
        floor == null ? null : floor.getFloorNumber(),
        room == null ? null : room.getRoomNumber(),
        bed == null ? null : bed.getLabel(),
        tenant.getStatus().name(),
        tenant.getNotes(),
        tenant.getPayments().stream().map(this::paymentSummary).toList()
    );
  }

  private PaymentSummary paymentSummary(Payment payment) {
    return new PaymentSummary(Month.of(payment.getBillingMonth()).name() + " " + payment.getBillingYear(), payment.getPaidAmount() == null ? payment.getExpectedAmount() : payment.getPaidAmount(), payment.getStatus().name());
  }
}
