package com.rentflow.payment;

import com.rentflow.payment.PaymentDtos.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {
  private final PaymentService paymentService;

  @PostMapping("/{paymentId}/mark-paid")
  PaymentResponse markPaid(@PathVariable Long paymentId, @RequestBody MarkPaidRequest request) {
    return paymentService.markPaid(paymentId, request);
  }
}
