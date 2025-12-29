package com.example.minilibrary.repository;

import com.example.minilibrary.model.ReadingSession;
import com.example.minilibrary.model.SessionStatus;
import com.example.minilibrary.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ReadingSessionRepository extends JpaRepository<ReadingSession, Long> {
    Optional<ReadingSession> findByUserAndStatus(User user, SessionStatus status);
}
