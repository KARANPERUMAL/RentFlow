package com.rentflow.property;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
public class Floor {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  private Property property;

  private Integer floorNumber;

  @OneToMany(mappedBy = "floor", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<Room> rooms = new ArrayList<>();
}
