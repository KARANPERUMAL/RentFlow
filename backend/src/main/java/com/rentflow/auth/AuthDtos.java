package com.rentflow.auth;

import java.util.List;

public final class AuthDtos {
  private AuthDtos() {}

  public record LoginRequest(String email, String password) {}
  public record AuthResponse(String token, UserResponse user) {}
  public record UserResponse(Long id, String ownerName, String pgName, String email, String role, boolean readOnly) {}
  public record RegisterRequest(String pgName, String ownerName, String phoneNumber, String email, String password, String address, List<FloorSetup> floors) {}
  public record FloorSetup(Integer floorNumber, List<RoomSetup> rooms) {}
  public record RoomSetup(String roomNumber, Integer capacity) {}
}
