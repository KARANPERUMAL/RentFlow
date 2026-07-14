package com.rentflow.tenant;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public final class TenantDtos {
  private TenantDtos() {}

  public record TenantResponse(Long id, String profilePhotoUrl, String name, String phone, String alternatePhone, String aadharNumber, String occupation, String address, String emergencyContact, LocalDate joiningDate, BigDecimal advanceAmount, BigDecimal monthlyRent, Integer sharingType, Integer floor, String room, String bed, String status, String notes, List<PaymentSummary> paymentHistory) {}
  public record PaymentSummary(String month, BigDecimal amount, String status) {}
}
