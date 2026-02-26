package com.example.minilibrary.auth;

import com.example.minilibrary.auth.User;
import com.example.minilibrary.auth.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.minilibrary.auth.dto.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final com.example.minilibrary.shared.security.JwtTokenService jwtTokenService;

    public AuthController(AuthService authService,
            com.example.minilibrary.shared.security.JwtTokenService jwtTokenService) {
        this.authService = authService;
        this.jwtTokenService = jwtTokenService;
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(
            @RequestBody @jakarta.validation.Valid com.example.minilibrary.auth.dto.RegisterRequest request) {
        User user = authService.registerUser(request.email(), request.password());
        UserDto userDto = new UserDto(user.getId(), user.getEmail(), user.getEmail(), user.getRole().name(), null);
        return ResponseEntity.ok(new RegisterResponse("Registration successful. Please login.", userDto));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @RequestBody @jakarta.validation.Valid com.example.minilibrary.auth.dto.LoginRequest request) {
        User user = authService.login(request.email(), request.password());

        String jwt = jwtTokenService.createToken(user);
        UserDto userDto = new UserDto(user.getId(), user.getEmail(), user.getEmail(), user.getRole().name(), null);

        return ResponseEntity.ok(new AuthResponse(jwt, userDto));
    }

    @GetMapping("/session")
    public ResponseEntity<SessionResponse> getSession(java.security.Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        User user = authService.getUserByEmail(principal.getName());
        UserDto userDto = new UserDto(user.getId(), user.getEmail(), user.getEmail(), user.getRole().name(), null);
        return ResponseEntity.ok(new SessionResponse(userDto));
    }
}
