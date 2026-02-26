package com.example.minilibrary.auth.dto;

import jakarta.validation.constraints.Email;
import com.example.minilibrary.books.dto.BookDto;
import jakarta.validation.constraints.NotBlank;
import com.example.minilibrary.books.dto.BookDto;
import java.util.Set;
import com.example.minilibrary.books.dto.BookDto;

public record UserDto(
        Long id,
        @NotBlank String username,
        @NotBlank @Email String email,
        String role,
        Set<BookDto> favoriteBooks) {
}
