package com.example.minilibrary.auth;

import com.example.minilibrary.auth.Role;
import com.example.minilibrary.auth.User;
import com.example.minilibrary.auth.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User registerUser(String email, String password) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new com.example.minilibrary.shared.exception.DuplicateResourceException("Email already taken");
        }

        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(Role.USER); // Default role
        user.setEnabled(true); // Always enable

        return userRepository.save(user);
    }

    public User login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(
                        () -> new com.example.minilibrary.shared.exception.InvalidCredentialsException("Invalid credentials"));

        log.debug("Login attempt for: {}", email);
        if (!passwordEncoder.matches(password, user.getPassword())) {
            log.warn("Password mismatch for: {}", email);
            throw new com.example.minilibrary.shared.exception.InvalidCredentialsException("Invalid credentials");
        }
        log.info("Login successful for: {}", email);

        // Auto-enable if not enabled (legacy support or safety) - optional but good
        // practice if we remove verification
        if (!user.isEnabled()) {
            user.setEnabled(true);
            userRepository.save(user);
        }

        return user;
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new com.example.minilibrary.shared.exception.ResourceNotFoundException("User not found"));
    }
}
