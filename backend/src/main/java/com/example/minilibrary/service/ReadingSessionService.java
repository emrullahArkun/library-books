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

        if (!activeSessions.isEmpty()) {
            Instant now = Instant.now();
            for (ReadingSession s : activeSessions) {
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
        // Also find PAUSED sessions (they are technically active but paused)
        sessions.addAll(sessionRepository.findByUserAndStatus(user, SessionStatus.PAUSED));

        if (sessions.isEmpty()) {
            throw new ResourceNotFoundException("No active reading session found");
        }

        Instant safeEndTime = endTime != null ? endTime : Instant.now();
        ReadingSession lastSaved = null;

        // Close ALL active/paused sessions to ensure clean state
        for (ReadingSession session : sessions) {
            // Check if paused, need to account for time since pausedAt?
            // Actually if it was PAUSED, the duration doesn't increase anymore.
            // But we might want to set endTime = pausedAt? Or safeEndTime?
            // If user stops while paused, the real end time was effectively pausedAt.
            // But usually stop is an explicit action.
            // Let's assume stopped time is NOW (or passed time).

            // If session was PAUSED, we need to add the duration from pausedAt to now to
            // pausedMillis?
            // NO. If it is paused, the "clock" stopped at pausedAt.
            // So effective active duration is: (endTime - startTime) - pausedMillis
            // But if we stop NOW, and we were paused since 10 mins ago.
            // The "gap" between pausedAt and NOW is technically part of pausedMillis.
            if (session.getStatus() == SessionStatus.PAUSED && session.getPausedAt() != null) {
                long additionalPause = java.time.Duration.between(session.getPausedAt(), safeEndTime).toMillis();
                if (additionalPause > 0) {
                    session.setPausedMillis(
                            (session.getPausedMillis() != null ? session.getPausedMillis() : 0) + additionalPause);
                }
                session.setPausedAt(null);
            }

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
        // Return ACTIVE or PAUSED session
        return sessionRepository.findByUserAndStatus(user, SessionStatus.ACTIVE).stream().findFirst()
                .or(() -> sessionRepository.findByUserAndStatus(user, SessionStatus.PAUSED).stream().findFirst());
    }

    @Transactional
    public ReadingSession pauseSession(User user) {
        java.util.List<ReadingSession> sessions = sessionRepository.findByUserAndStatus(user, SessionStatus.ACTIVE);
        if (sessions.isEmpty()) {
            // check if already paused?
            if (!sessionRepository.findByUserAndStatus(user, SessionStatus.PAUSED).isEmpty()) {
                throw new RuntimeException("Session already paused");
            }
            throw new RuntimeException("No active session found to pause");
        }

        ReadingSession session = sessions.get(0);
        session.setStatus(SessionStatus.PAUSED);
        session.setPausedAt(Instant.now());

        return sessionRepository.save(session);
    }

    @Transactional
    public ReadingSession resumeSession(User user) {
        java.util.List<ReadingSession> sessions = sessionRepository.findByUserAndStatus(user, SessionStatus.PAUSED);
        if (sessions.isEmpty()) {
            if (!sessionRepository.findByUserAndStatus(user, SessionStatus.ACTIVE).isEmpty()) {
                throw new RuntimeException("Session already active");
            }
            throw new RuntimeException("No paused session found to resume");
        }

        ReadingSession session = sessions.get(0);
        Instant now = Instant.now();

        if (session.getPausedAt() != null) {
            long diff = java.time.Duration.between(session.getPausedAt(), now).toMillis();
            if (diff > 0) {
                session.setPausedMillis((session.getPausedMillis() != null ? session.getPausedMillis() : 0) + diff);
            }
        }

        session.setStatus(SessionStatus.ACTIVE);
        session.setPausedAt(null);

        return sessionRepository.save(session);
    }

    // Deprecated/Legacy support or removed? Keeping generic excludeTime if needed,
    // but pause/resume should replace it.
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
