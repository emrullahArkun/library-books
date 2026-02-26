package com.example.minilibrary.sessions.dto;

import com.example.minilibrary.sessions.SessionStatus;
import java.time.Instant;

public record ReadingSessionDto(
                Long id,
                Long bookId,
                @com.fasterxml.jackson.annotation.JsonFormat(shape = com.fasterxml.jackson.annotation.JsonFormat.Shape.STRING) Instant startTime,
                @com.fasterxml.jackson.annotation.JsonFormat(shape = com.fasterxml.jackson.annotation.JsonFormat.Shape.STRING) Instant endTime,
                SessionStatus status,
                Integer endPage,
                Long pausedMillis,
                @com.fasterxml.jackson.annotation.JsonFormat(shape = com.fasterxml.jackson.annotation.JsonFormat.Shape.STRING) Instant pausedAt) {
}
