package com.example.minilibrary.controller;

import com.example.minilibrary.model.User;
import com.example.minilibrary.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody @jakarta.validation.Valid com.example.minilibrary.dto.auth.RegisterRequest request) {
        authService.registerUser(request.email(), request.password());
        return ResponseEntity.ok(Map.of("message", "Registration successful. Please login."));
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verify(@RequestParam String token) {
        boolean success = authService.verifyUser(token);
        if (success) {
            return ResponseEntity.ok(Map.of("message", "Account verified successfully! You can now login."));
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid verification token."));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody @jakarta.validation.Valid com.example.minilibrary.dto.auth.LoginRequest request) {
        User user = authService.login(request.email(), request.password());
        // For Basic Auth, the token is base64(email:password)
        String basicToken = java.util.Base64.getEncoder()
                .encodeToString((request.email() + ":" + request.password()).getBytes());

        return ResponseEntity.ok(Map.of(
                "token", basicToken,
                "role", user.getRole(),
                "email", user.getEmail()));
    }

    @GetMapping("/session")
    public ResponseEntity<?> getSession(java.security.Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        User user = authService.getUserByEmail(principal.getName());
        return ResponseEntity.ok(Map.of(
                "email", user.getEmail(),
                "role", user.getRole(),
                "valid", true));
    }
}
