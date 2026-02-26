package com.example.minilibrary.sessions;

import com.example.minilibrary.sessions.ReadingSession;
import com.example.minilibrary.sessions.SessionStatus;
import com.example.minilibrary.auth.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReadingSessionRepository extends JpaRepository<ReadingSession, Long> {
    java.util.List<ReadingSession> findByUserAndStatus(User user, SessionStatus status);

    java.util.Optional<ReadingSession> findFirstByUserAndStatusInOrderByStartTimeDesc(User user,
            java.util.Collection<SessionStatus> statuses);

    java.util.List<ReadingSession> findByUserAndBook(User user, com.example.minilibrary.books.Book book);

    void deleteByUserAndBook(User user, com.example.minilibrary.books.Book book);
}
