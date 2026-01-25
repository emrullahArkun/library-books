package com.example.minilibrary.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;

public record SetGoalRequest(
        @Pattern(regexp = "WEEKLY|MONTHLY", message = "Type must be WEEKLY or MONTHLY") String type,

        @Min(value = 1, message = "Pages must be at least 1") Integer pages) {
}
