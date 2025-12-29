package com.example.minilibrary.controller;

import com.example.minilibrary.dto.BookDto;
import com.example.minilibrary.model.Author;
import com.example.minilibrary.model.Book;
import com.example.minilibrary.service.AuthorService;
import com.example.minilibrary.service.BookService;
import com.example.minilibrary.exception.ResourceNotFoundException;
import com.example.minilibrary.mapper.BookMapper;
import com.example.minilibrary.dto.CreateBookRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;
    private final AuthorService authorService;
    private final BookMapper bookMapper;
    private final com.example.minilibrary.repository.UserRepository userRepository;

    private com.example.minilibrary.model.User getCurrentUser(java.security.Principal principal) {
        return userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @GetMapping
    public List<BookDto> getAllBooks(java.security.Principal principal) {
        return bookService.findAllByUser(getCurrentUser(principal)).stream()
                .map(bookMapper::toDto)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookDto> getBookById(@PathVariable Long id, java.security.Principal principal) {
        Book book = bookService.findByIdAndUser(id, getCurrentUser(principal))
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));
        return ResponseEntity.ok(bookMapper.toDto(book));
    }

    @PostMapping
    public ResponseEntity<BookDto> createBook(
            @RequestBody @jakarta.validation.Valid CreateBookRequest request,
            java.security.Principal principal) {
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

        com.example.minilibrary.model.User user = getCurrentUser(principal);
        Book book = bookMapper.toEntity(request);
        book.setAuthor(author);
        book.setUser(user);

        if (bookService.existsByIsbnAndUser(book.getIsbn(), user)) {
            throw new com.example.minilibrary.exception.DuplicateResourceException(
                    "Book with ISBN " + book.getIsbn() + " already exists in your collection.");
        }

        if (book.getStartDate() == null) {
            book.setStartDate(java.time.LocalDate.now());
        }
        Book savedBook = bookService.save(book);
        return ResponseEntity.ok(bookMapper.toDto(savedBook));
    }

    @PatchMapping("/{id}/progress")
    public ResponseEntity<BookDto> updateBookProgress(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, Integer> updateRequest,
            java.security.Principal principal) {
        Integer currentPage = updateRequest.get("currentPage");
        if (currentPage == null) {
            throw new IllegalArgumentException("currentPage is required");
        }
        Book updatedBook = bookService.updateBookProgress(id, currentPage, getCurrentUser(principal));
        return ResponseEntity.ok(bookMapper.toDto(updatedBook));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id, java.security.Principal principal) {
        bookService.deleteByIdAndUser(id, getCurrentUser(principal));
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteAllBooks(java.security.Principal principal) {
        bookService.deleteAllByUser(getCurrentUser(principal));
        return ResponseEntity.noContent().build();
    }
}
