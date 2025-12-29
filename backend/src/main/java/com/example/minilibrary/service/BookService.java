package com.example.minilibrary.service;

import com.example.minilibrary.model.Book;
import com.example.minilibrary.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;

    public List<Book> findAllByUser(com.example.minilibrary.model.User user) {
        return bookRepository.findByUser(user);
    }

    public Optional<Book> findByIdAndUser(Long id, com.example.minilibrary.model.User user) {
        if (id == null) {
            throw new IllegalArgumentException("ID cannot be null");
        }
        // Ensuring the user can only access their own book
        return bookRepository.findById(id).filter(book -> book.getUser().equals(user));
    }

    public boolean existsByIsbnAndUser(String isbn, com.example.minilibrary.model.User user) {
        return bookRepository.existsByIsbnAndUser(isbn, user);
    }

    @Transactional
    public Book save(Book book) {
        if (book == null) {
            throw new IllegalArgumentException("Book cannot be null");
        }
        return bookRepository.save(book);
    }

    @Transactional
    public void deleteByIdAndUser(Long id, com.example.minilibrary.model.User user) {
        if (id == null) {
            throw new IllegalArgumentException("ID cannot be null");
        }
        bookRepository.deleteByIdAndUser(id, user);
    }

    @Transactional
    public void deleteAllByUser(com.example.minilibrary.model.User user) {
        bookRepository.deleteByUser(user);
    }

    @Transactional
    public Book updateBookProgress(Long id, Integer currentPage, com.example.minilibrary.model.User user) {
        Book book = findByIdAndUser(id, user)
                .orElseThrow(() -> new com.example.minilibrary.exception.ResourceNotFoundException("Book not found"));

        if (currentPage < 0) {
            throw new IllegalArgumentException("Current page cannot be negative");
        }
        if (book.getPageCount() != null && currentPage > book.getPageCount()) {
            throw new IllegalArgumentException("Current page cannot exceed total page count");
        }

        book.setCurrentPage(currentPage);
        return bookRepository.save(book);
    }
}
