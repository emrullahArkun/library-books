package com.example.minilibrary.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.CascadeType;
import java.util.List;
import java.util.ArrayList;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

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
    private String readingGoalType; // "WEEKLY" or "MONTHLY"
    private Integer readingGoalPages;

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
