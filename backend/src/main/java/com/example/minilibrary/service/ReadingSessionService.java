package com.example.minilibrary.service;

import com.example.minilibrary.model.Book;
import com.example.minilibrary.model.ReadingSession;
import com.example.minilibrary.model.SessionStatus;
import com.example.minilibrary.model.User;
import com.example.minilibrary.repository.BookRepository;
import com.example.minilibrary.repository.ReadingSessionRepository;
import com.example.minilibrary.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReadingSessionService {

    private final ReadingSessionRepository sessionRepository;
    private final BookRepository bookRepository;

    @Transactional
    public ReadingSession startSession(User user, Long bookId) {
        // Ensure no other active session exists for this user
        if (sessionRepository.findByUserAndStatus(user, SessionStatus.ACTIVE).isPresent()) {
            throw new IllegalStateException("You already have an active reading session.");
        }

        Book book = bookRepository.findById(bookId)
                .filter(b -> b.getUser().equals(user))
                .orElseThrow(() -> new ResourceNotFoundException("Book not found or access denied"));

        ReadingSession session = new ReadingSession();
        session.setUser(user);
        session.setBook(book);
        session.setStartTime(Instant.now());
        session.setStatus(SessionStatus.ACTIVE);

        return sessionRepository.save(session);
    }

    @Transactional
    public ReadingSession stopSession(User user, Instant endTime) {
        ReadingSession session = sessionRepository.findByUserAndStatus(user, SessionStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("No active reading session found"));

        session.setEndTime(endTime != null ? endTime : Instant.now());
        session.setStatus(SessionStatus.COMPLETED);

        return sessionRepository.save(session);
    }

    public Optional<ReadingSession> getActiveSession(User user) {
        return sessionRepository.findByUserAndStatus(user, SessionStatus.ACTIVE);
    }

    @Transactional
    public ReadingSession excludeTime(User user, long millis) {
        ReadingSession session = sessionRepository.findByUserAndStatus(user, SessionStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("No active reading session found"));

        session.setStartTime(session.getStartTime().plusMillis(millis));
        return sessionRepository.save(session);
    }
}
