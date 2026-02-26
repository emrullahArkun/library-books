package com.example.minilibrary.sessions;

import jakarta.persistence.*;
import com.example.minilibrary.auth.User;
import com.example.minilibrary.books.Book;
import lombok.Getter;
import com.example.minilibrary.auth.User;
import com.example.minilibrary.books.Book;
import lombok.Setter;
import com.example.minilibrary.auth.User;
import com.example.minilibrary.books.Book;
import lombok.NoArgsConstructor;
import com.example.minilibrary.auth.User;
import com.example.minilibrary.books.Book;
import lombok.AllArgsConstructor;
import com.example.minilibrary.auth.User;
import com.example.minilibrary.books.Book;
import java.time.Instant;
import com.example.minilibrary.auth.User;
import com.example.minilibrary.books.Book;

@Getter
@Setter
@Entity
@Table(name = "reading_session", indexes = {
        @Index(name = "idx_session_user", columnList = "user_id"),
        @Index(name = "idx_session_book", columnList = "book_id"),
        @Index(name = "idx_session_user_status", columnList = "user_id, status")
})
public class ReadingSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @Column(nullable = false)
    private Instant startTime;

    private Instant endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SessionStatus status;

    private Integer endPage;

    private Integer pagesRead;

    @Column(name = "paused_millis", columnDefinition = "bigint default 0")
    private Long pausedMillis = 0L;

    @Column(name = "paused_at")
    private Instant pausedAt;

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (!(o instanceof ReadingSession))
            return false;
        ReadingSession that = (ReadingSession) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
