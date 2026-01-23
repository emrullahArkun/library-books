package com.example.minilibrary.config;

import com.example.minilibrary.model.User;
import com.example.minilibrary.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Configuration
@org.springframework.context.annotation.Profile("dev")
@RequiredArgsConstructor
public class DataInitializer {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner initData() {
        return args -> {
            if (userRepository.findByEmail("admin@example.com").isEmpty()) {
                User admin = new User();
                admin.setEmail("admin@example.com");
                admin.setPassword(passwordEncoder.encode("password"));
                admin.setRole(com.example.minilibrary.model.Role.ADMIN);
                admin.setEnabled(true);
                userRepository.save(admin);
                log.info("Default admin user created: admin@example.com / password");
            }
        };
    }
}
