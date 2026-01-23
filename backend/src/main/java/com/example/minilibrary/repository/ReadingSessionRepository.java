package com.example.minilibrary.repository;

import com.example.minilibrary.model.ReadingSession;
import com.example.minilibrary.model.SessionStatus;
import com.example.minilibrary.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReadingSessionRepository extends JpaRepository<ReadingSession, Long> {
    java.util.List<ReadingSession> findByUserAndStatus(User user, SessionStatus status);

    java.util.Optional<ReadingSession> findFirstByUserAndStatusInOrderByStartTimeDesc(User user,
            java.util.Collection<SessionStatus> statuses);

    java.util.List<ReadingSession> findByUserAndBook(User user, com.example.minilibrary.model.Book book);

    void deleteByUserAndBook(User user, com.example.minilibrary.model.Book book);
}
