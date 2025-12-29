package com.example.minilibrary.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record BookDto(
        Long id,
        @NotBlank String isbn,
        @NotBlank String title,
        @NotNull Long authorId,
        String authorName,
        String publishDate,
        String coverUrl,
        Integer pageCount,
        Integer currentPage,
        String startDate,
        Boolean completed) {
}
