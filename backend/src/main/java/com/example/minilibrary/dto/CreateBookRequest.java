package com.example.minilibrary.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateBookRequest(
        @NotBlank String isbn,
        @NotBlank String title,
        Long authorId,
        String authorName,
        String publishDate,
        String coverUrl,
        Integer pageCount) {
}
