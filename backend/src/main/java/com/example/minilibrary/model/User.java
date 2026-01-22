package com.example.minilibrary.model;

import jakarta.persistence.*;

@Entity
@Table(name = "users", indexes = {
        @Index(name = "idx_user_verification_token", columnList = "verificationToken", unique = true)
})
@lombok.Getter
@lombok.Setter
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    private boolean enabled = false;

    private String verificationToken;

    public User(String email, String password, Role role) {
        this.email = email;
        this.password = password;
        this.role = role;
    }
}
