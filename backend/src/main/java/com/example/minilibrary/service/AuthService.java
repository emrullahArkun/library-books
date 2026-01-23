package com.example.minilibrary.service;

import com.example.minilibrary.model.Role;
import com.example.minilibrary.model.User;
import com.example.minilibrary.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    @org.springframework.beans.factory.annotation.Value("${app.auth.require-verification:false}")
    private boolean requireVerification;

    public User registerUser(String email, String password) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new com.example.minilibrary.exception.DuplicateResourceException("Email already taken");
        }

        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(Role.USER); // Default role

        // If verification is required, disable account initially
        user.setEnabled(!requireVerification);
        user.setVerificationToken(UUID.randomUUID().toString());

        userRepository.save(user);

        if (requireVerification) {
            emailService.sendVerificationEmail(user);
        }

        return user;
    }

    public boolean verifyUser(String token) {
        Optional<User> userOpt = userRepository.findByVerificationToken(token);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setEnabled(true);
            user.setVerificationToken(null); // Clear token
            userRepository.save(user);
            return true;
        }
        return false;
    }

    public User login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(
                        () -> new com.example.minilibrary.exception.InvalidCredentialsException("Invalid credentials"));

        if (!user.isEnabled()) {
            throw new com.example.minilibrary.exception.AccountNotVerifiedException(
                    "Account not verified. Please check your email.");
        }

        log.debug("Login attempt for: {}", email);
        if (!passwordEncoder.matches(password, user.getPassword())) {
            log.warn("Password mismatch for: {}", email);
            throw new com.example.minilibrary.exception.InvalidCredentialsException("Invalid credentials");
        }
        log.info("Login successful for: {}", email);

        return user;
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
