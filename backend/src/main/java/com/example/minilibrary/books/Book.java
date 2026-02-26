package com.example.minilibrary.books;

import jakarta.persistence.Entity;
import com.example.minilibrary.auth.User;
import com.example.minilibrary.sessions.ReadingSession;
import jakarta.persistence.GeneratedValue;
import com.example.minilibrary.auth.User;
import com.example.minilibrary.sessions.ReadingSession;
import jakarta.persistence.GenerationType;
import com.example.minilibrary.auth.User;
import com.example.minilibrary.sessions.ReadingSession;
import jakarta.persistence.Id;
import com.example.minilibrary.auth.User;
import com.example.minilibrary.sessions.ReadingSession;
import jakarta.persistence.ManyToOne;
import com.example.minilibrary.auth.User;
import com.example.minilibrary.sessions.ReadingSession;
import jakarta.persistence.JoinColumn;
import com.example.minilibrary.auth.User;
import com.example.minilibrary.sessions.ReadingSession;
import jakarta.persistence.OneToMany;
import com.example.minilibrary.auth.User;
import com.example.minilibrary.sessions.ReadingSession;
import jakarta.persistence.CascadeType;
import com.example.minilibrary.auth.User;
import com.example.minilibrary.sessions.ReadingSession;
import java.util.List;
import com.example.minilibrary.auth.User;
import com.example.minilibrary.sessions.ReadingSession;
import java.util.ArrayList;
import com.example.minilibrary.auth.User;
import com.example.minilibrary.sessions.ReadingSession;
import lombok.Getter;
import com.example.minilibrary.auth.User;
import com.example.minilibrary.sessions.ReadingSession;
import lombok.Setter;
import com.example.minilibrary.auth.User;
import com.example.minilibrary.sessions.ReadingSession;
import lombok.NoArgsConstructor;
import com.example.minilibrary.auth.User;
import com.example.minilibrary.sessions.ReadingSession;
import lombok.AllArgsConstructor;
import com.example.minilibrary.auth.User;
import com.example.minilibrary.sessions.ReadingSession;

@Entity
@jakarta.persistence.Table(name = "books", indexes = {
        @jakarta.persistence.Index(name = "idx_book_user", columnList = "user_id"),
        @jakarta.persistence.Index(name = "idx_book_isbn", columnList = "isbn")
}, uniqueConstraints = {
        @jakarta.persistence.UniqueConstraint(columnNames = { "user_id", "isbn" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@lombok.EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @lombok.EqualsAndHashCode.Include
    private Long id;

    private String isbn;
    private String title;

    private String author;

    @ManyToOne(optional = false, fetch = jakarta.persistence.FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String publishDate;
    private String coverUrl;

    private Integer pageCount;
    private Integer currentPage;
    private java.time.LocalDate startDate;
    private Boolean completed;

    // Reading Goal
    @jakarta.persistence.Enumerated(jakarta.persistence.EnumType.STRING)
    private ReadingGoalType readingGoalType; // WEEKLY or MONTHLY
    private Integer readingGoalPages;

    // Discovery: Categories/Genres (comma-separated, e.g. "Thriller, Krimi")
    @jakarta.persistence.Column(length = 500)
    private String categories;

    @OneToMany(mappedBy = "book", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ReadingSession> readingSessions = new ArrayList<>();

    @jakarta.persistence.PrePersist
    public void prePersist() {
        if (currentPage == null) {
            currentPage = 0;
        }
        if (startDate == null) {
            startDate = java.time.LocalDate.now();
        }
        if (completed == null) {
            completed = false;
        }
    }
}
