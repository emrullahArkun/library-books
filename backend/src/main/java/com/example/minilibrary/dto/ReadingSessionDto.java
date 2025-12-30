package com.example.minilibrary.dto;

import com.example.minilibrary.model.SessionStatus;
import java.time.Instant;

public record ReadingSessionDto(
        Long id,
        Long bookId,
        Instant startTime,
        Instant endTime,
        SessionStatus status,
        Integer endPage) {
}
