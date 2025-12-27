package com.example.minilibrary.controller;

import com.example.minilibrary.dto.UserDto;
import com.example.minilibrary.model.User;
import com.example.minilibrary.service.UserService;
import com.example.minilibrary.mapper.UserMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserMapper userMapper;

    @PostMapping
    public ResponseEntity<UserDto> createUser(@RequestBody @Valid UserDto userDto) {
        User user = userMapper.toEntity(userDto);
        User savedUser = userService.createUser(user);
        return ResponseEntity.ok(userMapper.toDto(savedUser));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(userMapper.toDto(user));
    }

    @PostMapping("/{userId}/favorites/books/{bookId}")
    public ResponseEntity<UserDto> addBookToFavorites(@PathVariable Long userId, @PathVariable Long bookId) {
        User updatedUser = userService.addBookToFavorites(userId, bookId);
        return ResponseEntity.ok(userMapper.toDto(updatedUser));
    }

    @DeleteMapping("/{userId}/favorites/books/{bookId}")
    public ResponseEntity<UserDto> removeBookFromFavorites(@PathVariable Long userId, @PathVariable Long bookId) {
        User updatedUser = userService.removeBookFromFavorites(userId, bookId);
        return ResponseEntity.ok(userMapper.toDto(updatedUser));
    }

    @PostMapping("/{userId}/favorites/authors/{authorId}")
    public ResponseEntity<UserDto> addAuthorToFavorites(@PathVariable Long userId, @PathVariable Long authorId) {
        User updatedUser = userService.addAuthorToFavorites(userId, authorId);
        return ResponseEntity.ok(userMapper.toDto(updatedUser));
    }

    @DeleteMapping("/{userId}/favorites/authors/{authorId}")
    public ResponseEntity<UserDto> removeAuthorFromFavorites(@PathVariable Long userId, @PathVariable Long authorId) {
        User updatedUser = userService.removeAuthorFromFavorites(userId, authorId);
        return ResponseEntity.ok(userMapper.toDto(updatedUser));
    }
}
