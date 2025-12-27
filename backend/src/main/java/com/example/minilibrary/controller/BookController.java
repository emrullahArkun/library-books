package com.example.minilibrary.controller;

import com.example.minilibrary.dto.BookDto;
import com.example.minilibrary.model.Author;
import com.example.minilibrary.model.Book;
import com.example.minilibrary.service.AuthorService;
import com.example.minilibrary.service.BookService;
import com.example.minilibrary.exception.ResourceNotFoundException;
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

    @GetMapping
    public List<BookDto> getAllBooks() {
        return bookService.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookDto> getBookById(@PathVariable Long id) {
        Book book = bookService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));
        return ResponseEntity.ok(convertToDto(book));
    }

    @PostMapping
    public ResponseEntity<BookDto> createBook(
            @RequestBody @jakarta.validation.Valid com.example.minilibrary.dto.CreateBookRequest request) {
        Author author;
        if (request.authorId() != null) {
            author = authorService.findById(request.authorId())
                    .orElseThrow(
                            () -> new ResourceNotFoundException("Author not found with id: " + request.authorId()));
        } else if (request.authorName() != null && !request.authorName().isBlank()) {
            author = authorService.findByName(request.authorName()) // Need to add findByName to Service first? Or Use
                                                                    // Repo directly? Better add to Service.
                    .orElseGet(() -> {
                        Author newAuthor = new Author();
                        newAuthor.setName(request.authorName());
                        return authorService.save(newAuthor);
                    });
        } else {
            throw new IllegalArgumentException("Either authorId or authorName must be provided");
        }

        Book book = new Book();
        book.setIsbn(request.isbn());
        book.setTitle(request.title());
        book.setAuthor(author);

        Book savedBook = bookService.save(book);
        return ResponseEntity.ok(convertToDto(savedBook));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        bookService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private BookDto convertToDto(Book book) {
        return new BookDto(book.getId(), book.getIsbn(), book.getTitle(), book.getAuthor().getId());
    }

}
