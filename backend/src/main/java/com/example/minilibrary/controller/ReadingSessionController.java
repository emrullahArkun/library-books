package com.example.minilibrary.controller;

import com.example.minilibrary.dto.ReadingSessionDto;
import com.example.minilibrary.model.ReadingSession;
import com.example.minilibrary.model.User;
import com.example.minilibrary.service.ReadingSessionService;
import com.example.minilibrary.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class ReadingSessionController {

    private final ReadingSessionService sessionService;
    private final UserRepository userRepository;

    private User getCurrentUser(java.security.Principal principal) {
        if (principal == null)
            return null;
        return userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PostMapping("/start")
    public ResponseEntity<ReadingSessionDto> startSession(@RequestBody Map<String, Long> request,
            java.security.Principal principal) {
        User user = getCurrentUser(principal);
        Long bookId = request.get("bookId");
        if (bookId == null) {
            throw new IllegalArgumentException("bookId is required");
        }

        ReadingSession session = sessionService.startSession(user, bookId);
        return ResponseEntity.ok(mapToDto(session));
    }

    @PostMapping("/stop")
    public ResponseEntity<ReadingSessionDto> stopSession(@RequestBody(required = false) Map<String, Object> request,
            java.security.Principal principal) {
        User user = getCurrentUser(principal);
        java.time.Instant endTime = null;
        Integer endPage = null;

        if (request != null) {
            if (request.containsKey("endTime")) {
                endTime = java.time.Instant.parse((String) request.get("endTime"));
            }
            if (request.containsKey("endPage")) {
                endPage = (Integer) request.get("endPage");
            }
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
    public ResponseEntity<ReadingSessionDto> excludeTime(@RequestBody Map<String, Long> request,
            java.security.Principal principal) {
        User user = getCurrentUser(principal);
        Long millis = request.get("millis");
        if (millis == null) {
            throw new IllegalArgumentException("millis is required");
        }
        ReadingSession session = sessionService.excludeTime(user, millis);
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
                session.getEndPage());
    }
}
