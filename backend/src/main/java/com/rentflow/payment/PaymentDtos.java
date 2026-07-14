package com.rentflow.payment;

import java.math.BigDecimal;

public final class PaymentDtos {
  private PaymentDtos() {}

  public record MarkPaidRequest(BigDecimal amountReceived, String paymentMethod, String remarks, String transactionId) {}
  public record PaymentResponse(Long id, Long tenantId, BigDecimal expectedAmount, BigDecimal paidAmount, String status, String paymentMethod) {}
}
