package com.rentflow.payment;

import com.rentflow.common.Enums.PaymentMethod;
import com.rentflow.common.Enums.PaymentStatus;
import com.rentflow.tenant.Tenant;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@Entity
public class Payment {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  private Tenant tenant;

  private Integer billingMonth;
  private Integer billingYear;
  private LocalDate dueDate;
  private BigDecimal expectedAmount;
  private BigDecimal paidAmount;
  private LocalDate paymentDate;

  @Enumerated(EnumType.STRING)
  private PaymentStatus status = PaymentStatus.PENDING;

  @Enumerated(EnumType.STRING)
  private PaymentMethod paymentMethod;

  private String remarks;
  private String paymentGatewayReference;
  private String transactionId;
}
