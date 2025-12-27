package com.example.minilibrary.dto;

import jakarta.validation.constraints.NotBlank;

public record AuthorDto(Long id, @NotBlank String name) {
}
