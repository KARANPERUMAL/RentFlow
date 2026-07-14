package com.rentflow.property;

import com.rentflow.common.Enums.BedStatus;
import com.rentflow.tenant.Tenant;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class Bed {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  private Room room;

  @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
  private Tenant tenant;

  private String label;

  @Enumerated(EnumType.STRING)
  private BedStatus status = BedStatus.EMPTY;
}
