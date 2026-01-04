package com.example.minilibrary.controller;

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
    private final com.example.minilibrary.service.AuthService authService;

    private User getCurrentUser(java.security.Principal principal) {
        if (principal == null)
            throw new RuntimeException("User not authenticated");
        return authService.getUserByEmail(principal.getName());
    }

    @PostMapping("/start")
    public ResponseEntity<ReadingSessionDto> startSession(
            @RequestBody @jakarta.validation.Valid com.example.minilibrary.dto.StartSessionRequest request,
            java.security.Principal principal) {
        User user = getCurrentUser(principal);
        ReadingSession session = sessionService.startSession(user, request.bookId());
        return ResponseEntity.ok(mapToDto(session));
    }

    @PostMapping("/stop")
    public ResponseEntity<ReadingSessionDto> stopSession(
            @RequestBody(required = false) @jakarta.validation.Valid com.example.minilibrary.dto.StopSessionRequest request,
            java.security.Principal principal) {
        User user = getCurrentUser(principal);
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
    public ResponseEntity<ReadingSessionDto> getActiveSession(java.security.Principal principal) {
        User user = getCurrentUser(principal);
        return sessionService.getActiveSession(user)
                .map(this::mapToDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PostMapping("/active/exclude-time")
    public ResponseEntity<ReadingSessionDto> excludeTime(
            @RequestBody @jakarta.validation.Valid com.example.minilibrary.dto.ExcludeTimeRequest request,
            java.security.Principal principal) {
        User user = getCurrentUser(principal);
        ReadingSession session = sessionService.excludeTime(user, request.millis());
        return ResponseEntity.ok(mapToDto(session));
    }

    @PostMapping("/active/pause")
    public ResponseEntity<ReadingSessionDto> pauseSession(java.security.Principal principal) {
        User user = getCurrentUser(principal);
        ReadingSession session = sessionService.pauseSession(user);
        return ResponseEntity.ok(mapToDto(session));
    }

    @PostMapping("/active/resume")
    public ResponseEntity<ReadingSessionDto> resumeSession(java.security.Principal principal) {
        User user = getCurrentUser(principal);
        ReadingSession session = sessionService.resumeSession(user);
        return ResponseEntity.ok(mapToDto(session));
    }

    @GetMapping("/book/{bookId}")
    public ResponseEntity<java.util.List<ReadingSessionDto>> getSessionsByBook(@PathVariable Long bookId,
            java.security.Principal principal) {
        User user = getCurrentUser(principal);
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
