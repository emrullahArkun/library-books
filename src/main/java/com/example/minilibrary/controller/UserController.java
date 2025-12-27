package com.example.minilibrary.controller;

import com.example.minilibrary.dto.AuthorDto;
import com.example.minilibrary.dto.BookDto;
import com.example.minilibrary.dto.UserDto;
import com.example.minilibrary.model.Author;
import com.example.minilibrary.model.Book;
import com.example.minilibrary.model.User;
import com.example.minilibrary.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping
    public ResponseEntity<UserDto> createUser(@RequestBody @Valid UserDto userDto) {
        User user = convertToEntity(userDto);
        User savedUser = userService.createUser(user);
        return ResponseEntity.ok(convertToDto(savedUser));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(convertToDto(user));
    }

    @PostMapping("/{userId}/favorites/books/{bookId}")
    public ResponseEntity<UserDto> addBookToFavorites(@PathVariable Long userId, @PathVariable Long bookId) {
        User updatedUser = userService.addBookToFavorites(userId, bookId);
        return ResponseEntity.ok(convertToDto(updatedUser));
    }

    @DeleteMapping("/{userId}/favorites/books/{bookId}")
    public ResponseEntity<UserDto> removeBookFromFavorites(@PathVariable Long userId, @PathVariable Long bookId) {
        User updatedUser = userService.removeBookFromFavorites(userId, bookId);
        return ResponseEntity.ok(convertToDto(updatedUser));
    }

    @PostMapping("/{userId}/favorites/authors/{authorId}")
    public ResponseEntity<UserDto> addAuthorToFavorites(@PathVariable Long userId, @PathVariable Long authorId) {
        User updatedUser = userService.addAuthorToFavorites(userId, authorId);
        return ResponseEntity.ok(convertToDto(updatedUser));
    }

    @DeleteMapping("/{userId}/favorites/authors/{authorId}")
    public ResponseEntity<UserDto> removeAuthorFromFavorites(@PathVariable Long userId, @PathVariable Long authorId) {
        User updatedUser = userService.removeAuthorFromFavorites(userId, authorId);
        return ResponseEntity.ok(convertToDto(updatedUser));
    }

    private UserDto convertToDto(User user) {
        return new UserDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                null, // Do not return password
                user.getFavoriteBooks().stream()
                        .map(this::convertBookToDto)
                        .collect(Collectors.toSet()),
                user.getFavoriteAuthors().stream()
                        .map(this::convertAuthorToDto)
                        .collect(Collectors.toSet()));
    }

    private User convertToEntity(UserDto userDto) {
        User user = new User();
        user.setId(userDto.id());
        user.setUsername(userDto.username());
        user.setEmail(userDto.email());
        user.setPassword(userDto.password());
        return user;
    }

    private BookDto convertBookToDto(Book book) {
        return new BookDto(
                book.getId(),
                book.getIsbn(),
                book.getTitle(),
                book.getAuthor().getId());
    }

    private AuthorDto convertAuthorToDto(Author author) {
        return new AuthorDto(
                author.getId(),
                author.getName());
    }
}
