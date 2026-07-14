package com.rentflow.auth;

import com.rentflow.common.Enums.Role;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "app_users")
public class AppUser {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String pgName;
  private String ownerName;
  private String phoneNumber;

  @Column(nullable = false, unique = true)
  private String email;

  @Column(nullable = false)
  private String passwordHash;

  private String address;

  @Enumerated(EnumType.STRING)
  private Role role = Role.OWNER;

  private boolean demoAccount;
  private boolean readOnly;
}
