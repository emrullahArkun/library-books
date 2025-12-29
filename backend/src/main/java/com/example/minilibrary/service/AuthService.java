package com.example.minilibrary.service;

import com.example.minilibrary.model.Role;
import com.example.minilibrary.model.User;
import com.example.minilibrary.repository.UserRepository;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JavaMailSender mailSender) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.mailSender = mailSender;
    }

    public User registerUser(String email, String password) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email already taken");
        }

        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(Role.USER); // Default role
        user.setEnabled(false); // Validated via email later
        user.setVerificationToken(UUID.randomUUID().toString());

        userRepository.save(user);

        sendVerificationEmail(user);

        return user;
    }

    private void sendVerificationEmail(User user) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("noreply@library.local");
        message.setTo(user.getEmail());
        message.setSubject("Library Email Verification");
        message.setText("Click here to verify your account:\nhttp://localhost:8080/api/auth/verify?token="
                + user.getVerificationToken());

        mailSender.send(message);
        System.out.println(">>> EMAIL SENT TO " + user.getEmail() + " (Check MailHog at localhost:8025)");
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
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.isEnabled()) {
            throw new RuntimeException("Account not verified. Please check your email.");
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        return user;
    }
}
