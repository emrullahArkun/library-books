package com.example.minilibrary.repository;

import com.example.minilibrary.model.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    boolean existsByIsbn(String isbn);

    boolean existsByIsbnAndUser(String isbn, com.example.minilibrary.model.User user);

    java.util.List<Book> findByUser(com.example.minilibrary.model.User user);

    java.util.List<Book> findByUserOrderByCompletedAsc(com.example.minilibrary.model.User user);

    void deleteByIdAndUser(Long id, com.example.minilibrary.model.User user);

    void deleteByUser(com.example.minilibrary.model.User user);

    java.util.Optional<Book> findByIdAndUser(Long id, com.example.minilibrary.model.User user);
}
