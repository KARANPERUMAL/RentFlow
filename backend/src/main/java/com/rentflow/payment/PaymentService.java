package com.rentflow.payment;

import com.rentflow.common.Enums.PaymentMethod;
import com.rentflow.common.Enums.PaymentStatus;
import com.rentflow.payment.PaymentDtos.MarkPaidRequest;
import com.rentflow.payment.PaymentDtos.PaymentResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class PaymentService {
  private final PaymentRepository payments;

  @Transactional
  public PaymentResponse markPaid(Long paymentId, MarkPaidRequest request) {
    Payment payment = payments.findById(paymentId).orElseThrow();
    payment.setPaidAmount(request.amountReceived());
    payment.setPaymentMethod(PaymentMethod.valueOf(request.paymentMethod()));
    payment.setRemarks(request.remarks());
    payment.setTransactionId(request.transactionId());
    payment.setPaymentDate(LocalDate.now());
    if (request.amountReceived().compareTo(payment.getExpectedAmount()) < 0) {
      payment.setStatus(PaymentStatus.PARTIAL);
    } else if (payment.getPaymentDate().isBefore(payment.getDueDate())) {
      payment.setStatus(PaymentStatus.PAID_EARLY);
    } else if (payment.getPaymentDate().isEqual(payment.getDueDate())) {
      payment.setStatus(PaymentStatus.PAID_ON_TIME);
    } else {
      payment.setStatus(PaymentStatus.LATE);
    }
    return new PaymentResponse(payment.getId(), payment.getTenant().getId(), payment.getExpectedAmount(), payment.getPaidAmount(), payment.getStatus().name(), payment.getPaymentMethod().name());
  }
}
