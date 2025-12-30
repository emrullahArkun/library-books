package com.example.minilibrary.service;

import com.example.minilibrary.dto.CreateBookRequest;
import com.example.minilibrary.exception.DuplicateResourceException;
import com.example.minilibrary.exception.ResourceNotFoundException;
import com.example.minilibrary.mapper.BookMapper;
import com.example.minilibrary.model.Author;
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
    private final AuthorService authorService;
    private final BookMapper bookMapper;

    public List<Book> findAllByUser(com.example.minilibrary.model.User user) {
        return bookRepository.findByUserOrderByCompletedAsc(user);
    }

    public Optional<Book> findByIdAndUser(@NotNull Long id, com.example.minilibrary.model.User user) {
        // Ensuring the user can only access their own book
        return bookRepository.findById(id).filter(book -> book.getUser().equals(user));
    }

    public boolean existsByIsbnAndUser(String isbn, com.example.minilibrary.model.User user) {
        return bookRepository.existsByIsbnAndUser(isbn, user);
    }

    @Transactional
    public Book createBook(CreateBookRequest request, com.example.minilibrary.model.User user) {
        Author author;
        if (request.authorId() != null) {
            author = authorService.findById(request.authorId())
                    .orElseThrow(
                            () -> new ResourceNotFoundException("Author not found with id: " + request.authorId()));
        } else if (request.authorName() != null && !request.authorName().isBlank()) {
            author = authorService.findByName(request.authorName())
                    .orElseGet(() -> {
                        Author newAuthor = new Author();
                        newAuthor.setName(request.authorName());
                        return authorService.save(newAuthor);
                    });
        } else {
            throw new IllegalArgumentException("Either authorId or authorName must be provided");
        }

        if (existsByIsbnAndUser(request.isbn(), user)) {
            throw new DuplicateResourceException(
                    "Book with ISBN " + request.isbn() + " already exists in your collection.");
        }

        Book book = bookMapper.toEntity(request);
        book.setAuthor(author);
        book.setUser(user);

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
        Book book = bookRepository.findById(id)
                .filter(b -> b.getUser().equals(user))
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));
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

        // Auto-complete logic
        if (book.getPageCount() != null && currentPage >= book.getPageCount()) {
            book.setCompleted(true);
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
}
