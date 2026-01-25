package com.example.minilibrary.service;

import com.example.minilibrary.dto.CreateBookRequest;
import com.example.minilibrary.exception.DuplicateResourceException;
import com.example.minilibrary.exception.ResourceNotFoundException;
import com.example.minilibrary.mapper.BookMapper;
import com.example.minilibrary.model.Book;
import com.example.minilibrary.repository.BookRepository;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Validated
public class BookService {

    private final BookRepository bookRepository;
    private final BookMapper bookMapper;
    private final ReadingSessionService readingSessionService;

    public org.springframework.data.domain.Page<Book> findAllByUser(com.example.minilibrary.model.User user,
            org.springframework.data.domain.Pageable pageable) {
        return bookRepository.findByUserOrderByCompletedAsc(user, pageable);
    }

    public Optional<Book> findByIdAndUser(@NotNull Long id, com.example.minilibrary.model.User user) {
        return bookRepository.findByIdAndUser(id, user);
    }

    public boolean existsByIsbnAndUser(String isbn, com.example.minilibrary.model.User user) {
        return bookRepository.existsByIsbnAndUser(isbn, user);
    }

    public List<String> getAllOwnedIsbns(com.example.minilibrary.model.User user) {
        return bookRepository.findByUser(user).stream()
                .map(Book::getIsbn)
                .collect(java.util.stream.Collectors.toList());
    }

    @Transactional
    public Book createBook(CreateBookRequest request, com.example.minilibrary.model.User user) {
        if (existsByIsbnAndUser(request.isbn(), user)) {
            throw new DuplicateResourceException(
                    "Book with ISBN " + request.isbn() + " already exists in your collection.");
        }

        Book book = bookMapper.toEntity(request);
        // Author is already mapped from authorName to author string by Mapper
        book.setUser(user);

        // Fallback if mapper didn't handle it (redundant if mapper is correct, but
        // safe)
        if (book.getAuthor() == null && request.authorName() != null) {
            book.setAuthor(request.authorName());
        }

        if (book.getStartDate() == null) {
            book.setStartDate(java.time.LocalDate.now());
        }

        return bookRepository.save(book);
    }

    @Transactional
    public Book save(@NotNull Book book) {
        return bookRepository.save(book);
    }

    @Transactional
    public void deleteByIdAndUser(@NotNull Long id, com.example.minilibrary.model.User user) {
        Book book = bookRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));

        // Explicitly delete sessions to avoid FK violation
        readingSessionService.deleteSessionsByBook(user, book);

        bookRepository.delete(book);
    }

    @Transactional
    public void deleteAllByUser(com.example.minilibrary.model.User user) {
        List<Book> books = bookRepository.findByUser(user);
        bookRepository.deleteAll(books);
    }

    @Transactional
    public Book updateBookProgress(@NotNull Long id, @NotNull Integer currentPage,
            com.example.minilibrary.model.User user) {
        Book book = findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));

        if (currentPage < 0) {
            throw new IllegalArgumentException("Current page cannot be negative");
        }
        if (book.getPageCount() != null && currentPage > book.getPageCount()) {
            throw new IllegalArgumentException("Current page cannot exceed total page count");
        }

        book.setCurrentPage(currentPage);

        // Auto-complete/un-complete logic
        if (book.getPageCount() != null) {
            if (currentPage >= book.getPageCount()) {
                book.setCompleted(true);
            } else {
                book.setCompleted(false);
            }
        }

        return bookRepository.save(book);
    }

    @Transactional
    public Book updateBookStatus(@NotNull Long id, @NotNull Boolean completed,
            com.example.minilibrary.model.User user) {
        Book book = findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));

        book.setCompleted(completed);
        return bookRepository.save(book);
    }

    @Transactional
    public Book updateReadingGoal(@NotNull Long id, String type, Integer pages,
            com.example.minilibrary.model.User user) {
        Book book = findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));

        book.setReadingGoalType(type);
        book.setReadingGoalPages(pages);
        return bookRepository.save(book);
    }
}
