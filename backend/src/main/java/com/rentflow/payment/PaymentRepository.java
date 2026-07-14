package com.rentflow.payment;

import com.rentflow.common.Enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
  List<Payment> findByTenantPropertyId(Long propertyId);

  @Query("select p from Payment p where p.tenant.property.id = :propertyId and p.status in :statuses")
  List<Payment> byStatuses(@Param("propertyId") Long propertyId, @Param("statuses") List<PaymentStatus> statuses);

  long countByTenantPropertyIdAndDueDate(Long propertyId, LocalDate dueDate);
}
