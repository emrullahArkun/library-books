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

    @GetMapping
    public List<BookDto> getAllBooks() {
        return bookService.findAll().stream()
                .map(bookMapper::toDto)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookDto> getBookById(@PathVariable Long id) {
        Book book = bookService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));
        return ResponseEntity.ok(bookMapper.toDto(book));
    }

    @PostMapping
    public ResponseEntity<BookDto> createBook(
            @RequestBody @jakarta.validation.Valid CreateBookRequest request) {
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

        Book book = bookMapper.toEntity(request);
        book.setAuthor(author); // Set resolved author manually

        Book savedBook = bookService.save(book);
        return ResponseEntity.ok(bookMapper.toDto(savedBook));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        bookService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
