package com.example.minilibrary.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users") // 'user' is a reserved keyword in Postgres
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role;

    @ManyToMany
    @JoinTable(name = "user_favorite_books", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "book_id"))
    private Set<Book> favoriteBooks = new HashSet<>();

    @ManyToMany
    @JoinTable(name = "user_favorite_authors", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "author_id"))
    private Set<Author> favoriteAuthors = new HashSet<>();
}
