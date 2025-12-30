package com.example.minilibrary.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.util.Set;

public record UserDto(
        Long id,
        @NotBlank String username,
        @NotBlank @Email String email,
        Set<BookDto> favoriteBooks,
        Set<AuthorDto> favoriteAuthors) {
}
