package com.rentflow.auth;

import com.rentflow.auth.AuthDtos.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
  private final AuthService authService;

  @PostMapping("/login")
  AuthResponse login(@RequestBody @Valid LoginRequest request) {
    return authService.login(request);
  }

  @PostMapping("/register")
  AuthResponse register(@RequestBody @Valid RegisterRequest request) {
    return authService.register(request);
  }
}
