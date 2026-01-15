package com.example.minilibrary.config;

import com.example.minilibrary.model.User;
import com.example.minilibrary.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@org.springframework.context.annotation.Profile("dev")
@RequiredArgsConstructor
public class DataInitializer {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner initData() {
        return args -> {
            // Create default admin user if not exists
            if (userRepository.findByEmail("admin@example.com").isEmpty()) {
                User admin = new User();
                admin.setEmail("admin@example.com");
                admin.setPassword(passwordEncoder.encode("password")); // Hardcoded for simplified demo
                admin.setRole(com.example.minilibrary.model.Role.ADMIN);
                admin.setEnabled(true); // Auto-enable admin
                userRepository.save(admin);
                System.out.println("Default admin user created: admin@example.com / password");
            }
        };
    }
}
