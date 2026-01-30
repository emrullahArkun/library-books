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
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReadingSessionService {

    private final ReadingSessionRepository sessionRepository;
    private final BookRepository bookRepository;
    private final BookProgressService bookProgressService;

    @Transactional
    public ReadingSession startSession(User user, Long bookId) {
        // Enforce Invariant: Max 1 Active/Paused session
        Optional<ReadingSession> existingOpt = sessionRepository.findFirstByUserAndStatusInOrderByStartTimeDesc(user,
                List.of(SessionStatus.ACTIVE, SessionStatus.PAUSED));

        if (existingOpt.isPresent()) {
            ReadingSession existing = existingOpt.get();
            // If already reading this book, return it (resume if paused)
            if (existing.getBook().getId().equals(bookId)) {
                if (existing.getStatus() == SessionStatus.PAUSED) {
                    return resumeSession(user);
                }
                return existing;
            }
            // If reading another book, auto-stop the previous one
            stopSession(user, Instant.now(), null);
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
        // Find THE active or paused session
        ReadingSession session = sessionRepository.findFirstByUserAndStatusInOrderByStartTimeDesc(user,
                List.of(SessionStatus.ACTIVE, SessionStatus.PAUSED))
                .orElseThrow(() -> new ResourceNotFoundException("No active reading session found"));

        Instant safeEndTime = endTime != null ? endTime : Instant.now();

        if (session.getStatus() == SessionStatus.PAUSED && session.getPausedAt() != null) {
            long gap = java.time.Duration.between(session.getPausedAt(), safeEndTime).toMillis();
            if (gap > 0) {
                long currentPaused = session.getPausedMillis() != null ? session.getPausedMillis() : 0;
                session.setPausedMillis(currentPaused + gap);
            }
        }

        session.setPausedAt(null); // Clear paused state
        session.setEndTime(safeEndTime);
        session.setEndPage(endPage);
        session.setStatus(SessionStatus.COMPLETED);

        if (endPage != null) {
            Book book = session.getBook();

            // Calculate pages read
            int startPage = book.getCurrentPage() != null ? book.getCurrentPage() : 0;
            int pagesRead = endPage - startPage;
            // Ensure non-negative (handling corrections/edge cases)
            if (pagesRead < 0)
                pagesRead = 0;

            session.setPagesRead(pagesRead);
            session.setStatus(SessionStatus.COMPLETED); // Ensuring this is set

            // Delegate book progress update to BookProgressService
            bookProgressService.updateProgress(book, endPage);
        }

        return sessionRepository.save(session);
    }

    // Now returns Optional directly from DB query
    public Optional<ReadingSession> getActiveSession(User user) {
        return sessionRepository.findFirstByUserAndStatusInOrderByStartTimeDesc(user,
                List.of(SessionStatus.ACTIVE, SessionStatus.PAUSED));
    }

    @Transactional
    public ReadingSession pauseSession(User user) {
        ReadingSession session = sessionRepository.findFirstByUserAndStatusInOrderByStartTimeDesc(user,
                List.of(SessionStatus.ACTIVE))
                .orElseThrow(() -> new com.example.minilibrary.exception.IllegalSessionStateException(
                        "No active session found to pause"));

        session.setStatus(SessionStatus.PAUSED);
        session.setPausedAt(Instant.now());
        return sessionRepository.save(session);
    }

    @Transactional
    public ReadingSession resumeSession(User user) {
        ReadingSession session = sessionRepository.findFirstByUserAndStatusInOrderByStartTimeDesc(user,
                List.of(SessionStatus.PAUSED))
                .orElseThrow(() -> new com.example.minilibrary.exception.IllegalSessionStateException(
                        "No paused session found to resume"));

        Instant now = Instant.now();
        if (session.getPausedAt() != null) {
            long diff = java.time.Duration.between(session.getPausedAt(), now).toMillis();
            if (diff > 0) {
                long currentPaused = session.getPausedMillis() != null ? session.getPausedMillis() : 0;
                session.setPausedMillis(currentPaused + diff);
            }
        }
        session.setStatus(SessionStatus.ACTIVE);
        session.setPausedAt(null);
        return sessionRepository.save(session);
    }

    @Transactional
    public ReadingSession excludeTime(User user, Long millis) {
        if (millis == null || millis < 0) {
            throw new IllegalArgumentException("Invalid millis");
        }
        ReadingSession session = sessionRepository.findFirstByUserAndStatusInOrderByStartTimeDesc(user,
                List.of(SessionStatus.ACTIVE))
                .orElseThrow(() -> new com.example.minilibrary.exception.IllegalSessionStateException(
                        "No active session found"));

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

    @Transactional
    public void deleteSessionsByBook(User user, Book book) {
        sessionRepository.deleteByUserAndBook(user, book);
    }
}
