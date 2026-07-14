package com.rentflow.tenant;

import com.rentflow.common.Enums.TenantStatus;
import com.rentflow.payment.Payment;
import com.rentflow.property.Bed;
import com.rentflow.property.Property;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
public class Tenant {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  private Property property;

  @OneToOne(mappedBy = "tenant", fetch = FetchType.LAZY)
  private Bed bed;

  private String profilePhotoUrl;
  private String name;
  private String phone;
  private String alternatePhone;
  private String aadharNumber;
  private String occupation;
  private String address;
  private String emergencyContact;
  private LocalDate joiningDate;
  private BigDecimal advanceAmount;
  private BigDecimal monthlyRent;
  private Integer sharingType;

  @Enumerated(EnumType.STRING)
  private TenantStatus status = TenantStatus.ACTIVE;

  @Column(length = 1000)
  private String notes;

  @OneToMany(mappedBy = "tenant", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<Payment> payments = new ArrayList<>();
}
