package com.example.minilibrary.books.dto;

import jakarta.validation.constraints.Min;

public record SetGoalRequest(
                @jakarta.validation.constraints.NotNull(message = "Type must not be null") com.example.minilibrary.books.ReadingGoalType type,

                @Min(value = 1, message = "Pages must be at least 1") Integer pages) {
}
