package com.example.minilibrary.dto;

import jakarta.validation.constraints.Min;

public record SetGoalRequest(
                @jakarta.validation.constraints.NotNull(message = "Type must not be null") com.example.minilibrary.model.ReadingGoalType type,

                @Min(value = 1, message = "Pages must be at least 1") Integer pages) {
}
