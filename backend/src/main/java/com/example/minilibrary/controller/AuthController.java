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
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        try {
            User user = authService.registerUser(email, password);
            return ResponseEntity.ok(Map.of("message",
                    "Registration successful. Please check server console for verification link (Simulated Email)."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verify(@RequestParam String token) {
        boolean success = authService.verifyUser(token);
        if (success) {
            return ResponseEntity.ok("Account verified successfully! You can now login.");
        } else {
            return ResponseEntity.badRequest().body("Invalid verification token.");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        try {
            User user = authService.login(email, password);
            // In a real JWT app, we would generate a token here.
            // For this basic setup, we return the user details and let the frontend store
            // "logged in" state (Basic Auth style or simplified).
            // To make it proper "Basic Auth", the frontend needs to send Authorization:
            // Basic base64(email:password) on every request.
            // Here we just validate credentials to say "OK".

            // returning a simple "token" which is just the credentials base64 encoded for
            // the frontend to use
            String basicToken = java.util.Base64.getEncoder().encodeToString((email + ":" + password).getBytes());

            return ResponseEntity.ok(Map.of(
                    "token", basicToken,
                    "role", user.getRole(),
                    "email", user.getEmail()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
    }
}
