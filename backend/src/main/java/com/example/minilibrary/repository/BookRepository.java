package com.example.minilibrary.repository;

import com.example.minilibrary.model.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
        boolean existsByIsbn(String isbn);

        boolean existsByIsbnAndUser(String isbn, com.example.minilibrary.model.User user);

        java.util.List<Book> findByUser(com.example.minilibrary.model.User user);

        @org.springframework.data.jpa.repository.EntityGraph(attributePaths = "readingSessions")
        org.springframework.data.domain.Page<Book> findByUserOrderByCompletedAsc(
                        com.example.minilibrary.model.User user,
                        org.springframework.data.domain.Pageable pageable);

        void deleteByIdAndUser(Long id, com.example.minilibrary.model.User user);

        void deleteByUser(com.example.minilibrary.model.User user);

        java.util.Optional<Book> findByIdAndUser(Long id, com.example.minilibrary.model.User user);

        java.util.Optional<Book> findByIdAndUserId(Long id, Long userId);

        // Discovery: Top authors by book count
        @org.springframework.data.jpa.repository.Query("SELECT b.author FROM Book b WHERE b.user = :user AND b.author IS NOT NULL GROUP BY b.author ORDER BY COUNT(b) DESC")
        java.util.List<String> findTopAuthorsByUser(
                        @org.springframework.data.repository.query.Param("user") com.example.minilibrary.model.User user);

        // Discovery: All categories for a user (will parse in service)
        @org.springframework.data.jpa.repository.Query("SELECT b.categories FROM Book b WHERE b.user = :user AND b.categories IS NOT NULL")
        java.util.List<String> findAllCategoriesByUser(
                        @org.springframework.data.repository.query.Param("user") com.example.minilibrary.model.User user);

        // Discovery: Get all ISBNs owned by user (for exclusion)
        @org.springframework.data.jpa.repository.Query("SELECT b.isbn FROM Book b WHERE b.user = :user")
        java.util.List<String> findAllIsbnsByUser(
                        @org.springframework.data.repository.query.Param("user") com.example.minilibrary.model.User user);
}
