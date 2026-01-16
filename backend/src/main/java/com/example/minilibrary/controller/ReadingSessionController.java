package com.example.minilibrary.controller;

import com.example.minilibrary.security.CurrentUser;

import com.example.minilibrary.dto.ReadingSessionDto;
import com.example.minilibrary.model.ReadingSession;
import com.example.minilibrary.model.User;
import com.example.minilibrary.service.ReadingSessionService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class ReadingSessionController {

    private final ReadingSessionService sessionService;

    @PostMapping("/start")
    public ResponseEntity<ReadingSessionDto> startSession(
            @RequestBody @jakarta.validation.Valid com.example.minilibrary.dto.StartSessionRequest request,
            @CurrentUser User user) {
        ReadingSession session = sessionService.startSession(user, request.bookId());
        return ResponseEntity.ok(mapToDto(session));
    }

    @PostMapping("/stop")
    public ResponseEntity<ReadingSessionDto> stopSession(
            @RequestBody(required = false) @jakarta.validation.Valid com.example.minilibrary.dto.StopSessionRequest request,
            @CurrentUser User user) {
        java.time.Instant endTime = null;
        Integer endPage = null;

        if (request != null) {
            endTime = request.endTime();
            endPage = request.endPage();
        }
        ReadingSession session = sessionService.stopSession(user, endTime, endPage);
        return ResponseEntity.ok(mapToDto(session));
    }

    @GetMapping("/active")
    public ResponseEntity<ReadingSessionDto> getActiveSession(@CurrentUser User user) {
        return sessionService.getActiveSession(user)
                .map(this::mapToDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PostMapping("/active/exclude-time")
    public ResponseEntity<ReadingSessionDto> excludeTime(
            @RequestBody @jakarta.validation.Valid com.example.minilibrary.dto.ExcludeTimeRequest request,
            @CurrentUser User user) {
        ReadingSession session = sessionService.excludeTime(user, request.millis());
        return ResponseEntity.ok(mapToDto(session));
    }

    @PostMapping("/active/pause")
    public ResponseEntity<ReadingSessionDto> pauseSession(@CurrentUser User user) {
        ReadingSession session = sessionService.pauseSession(user);
        return ResponseEntity.ok(mapToDto(session));
    }

    @PostMapping("/active/resume")
    public ResponseEntity<ReadingSessionDto> resumeSession(@CurrentUser User user) {
        ReadingSession session = sessionService.resumeSession(user);
        return ResponseEntity.ok(mapToDto(session));
    }

    @GetMapping("/book/{bookId}")
    public ResponseEntity<java.util.List<ReadingSessionDto>> getSessionsByBook(@PathVariable Long bookId,
            @CurrentUser User user) {
        java.util.List<ReadingSessionDto> sessions = sessionService.getSessionsByBook(user, bookId)
                .stream()
                .map(this::mapToDto)
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(sessions);
    }

    private ReadingSessionDto mapToDto(ReadingSession session) {
        return new ReadingSessionDto(
                session.getId(),
                session.getBook().getId(),
                session.getStartTime(),
                session.getEndTime(),
                session.getStatus(),
                session.getEndPage(),
                session.getPausedMillis(),
                session.getPausedAt());
    }
}
