package com.rentflow.auth;

import com.rentflow.auth.AuthDtos.*;
import com.rentflow.common.Enums.Role;
import com.rentflow.config.JwtService;
import com.rentflow.property.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.rentflow.common.Enums.BedStatus.EMPTY;

@Service
@RequiredArgsConstructor
public class AuthService {
  private final AppUserRepository users;
  private final PropertyRepository properties;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;

  public AuthResponse login(LoginRequest request) {
    AppUser user = users.findByEmail(request.email()).orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));
    if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
      throw new IllegalArgumentException("Invalid credentials");
    }
    return new AuthResponse(jwtService.issue(user), toUser(user));
  }

  @Transactional
  public AuthResponse register(RegisterRequest request) {
    AppUser user = new AppUser();
    user.setPgName(request.pgName());
    user.setOwnerName(request.ownerName());
    user.setPhoneNumber(request.phoneNumber());
    user.setEmail(request.email());
    user.setPasswordHash(passwordEncoder.encode(request.password()));
    user.setAddress(request.address());
    user.setRole(Role.OWNER);
    users.save(user);

    Property property = new Property();
    property.setOwner(user);
    property.setName(request.pgName());
    property.setAddress(request.address());
    request.floors().forEach(floorSetup -> {
      Floor floor = new Floor();
      floor.setProperty(property);
      floor.setFloorNumber(floorSetup.floorNumber());
      floorSetup.rooms().forEach(roomSetup -> {
        Room room = new Room();
        room.setFloor(floor);
        room.setRoomNumber(roomSetup.roomNumber());
        room.setCapacity(roomSetup.capacity());
        for (int i = 0; i < roomSetup.capacity(); i++) {
          Bed bed = new Bed();
          bed.setRoom(room);
          bed.setLabel("Bed " + (char) ('A' + i));
          bed.setStatus(EMPTY);
          room.getBeds().add(bed);
        }
        floor.getRooms().add(room);
      });
      property.getFloors().add(floor);
    });
    properties.save(property);
    return new AuthResponse(jwtService.issue(user), toUser(user));
  }

  private UserResponse toUser(AppUser user) {
    return new UserResponse(user.getId(), user.getOwnerName(), user.getPgName(), user.getEmail(), user.getRole().name(), user.isReadOnly());
  }
}
