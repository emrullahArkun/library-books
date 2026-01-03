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
        // Idempotency: If active session exists, return it.
        // We should check if it's for the same book. If not, maybe we should stop it?
        // For simplicity and user friendliness: if active session exists, return it
        // regardless of bookId requested?
        // Or better: valid active session means user is reading.
        java.util.List<ReadingSession> activeSessions = sessionRepository.findByUserAndStatus(user,
                SessionStatus.ACTIVE);

        // Enforce Single Active Session: Close any existing sessions
        if (!activeSessions.isEmpty()) {
            Instant now = Instant.now();
            for (ReadingSession s : activeSessions) {
                // If it's already the requested book, maybe we could just return it?
                // But better to restart or just return it ONLY if it matches?
                // User requirement: "Lesen starten" always starts new.
                // So if I click Start, I probably want a fresh start or at least to switch to
                // this book.
                // If I am already reading THIS book, arguably I should just continue.
                // But if I am reading ANOTHER book, I must close that one.

                // Let's go with: Close EVERYTHING to be strict and simple?
                // Or: If same book, return valid session?
                // User said "Lesen starten always starts new session from 0".
                // So we should CLOSE even if it is the same book (effectively a restart).
                s.setEndTime(now);
                s.setStatus(SessionStatus.COMPLETED);
                sessionRepository.save(s);
            }
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
    public ReadingSession stopSession(User user, Instant endTime, Integer endPage) {
        java.util.List<ReadingSession> sessions = sessionRepository.findByUserAndStatus(user, SessionStatus.ACTIVE);
        if (sessions.isEmpty()) {
            throw new ResourceNotFoundException("No active reading session found");
        }

        Instant safeEndTime = endTime != null ? endTime : Instant.now();
        ReadingSession lastSaved = null;

        // Close ALL active sessions to ensure clean state
        for (ReadingSession session : sessions) {
            session.setEndTime(safeEndTime);
            session.setEndPage(endPage);
            session.setStatus(SessionStatus.COMPLETED);

            // Transactional update of Book
            if (endPage != null) {
                Book book = session.getBook();
                book.setCurrentPage(endPage);
                // Auto-complete if endPage reaches pageCount
                if (book.getPageCount() != null && endPage >= book.getPageCount()) {
                    book.setCompleted(true);
                }
                bookRepository.save(book);
            }

            lastSaved = sessionRepository.save(session);
        }

        return lastSaved;
    }

    public Optional<ReadingSession> getActiveSession(User user) {
        return sessionRepository.findByUserAndStatus(user, SessionStatus.ACTIVE).stream().findFirst();
    }

    @Transactional
    public ReadingSession excludeTime(User user, Long millis) {
        if (millis == null) {
            throw new IllegalArgumentException("millis must not be null");
        }
        if (millis < 0) {
            throw new IllegalArgumentException("millis must be >= 0");
        }
        java.util.List<ReadingSession> sessions = sessionRepository.findByUserAndStatus(user, SessionStatus.ACTIVE);
        if (sessions.isEmpty()) {
            throw new RuntimeException("No active session found");
        }
        ReadingSession session = sessions.get(0);

        // Update pausedMillis instead of modifying startTime
        long currentPaused = session.getPausedMillis() != null ? session.getPausedMillis() : 0L;
        session.setPausedMillis(currentPaused + millis);
        return sessionRepository.save(session);
    }

    public java.util.List<ReadingSession> getSessionsByBook(User user, Long bookId) {
        Book book = bookRepository.findById(bookId)
                .filter(b -> b.getUser().equals(user))
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));
        return sessionRepository.findByUserAndBook(user, book);
    }
}
