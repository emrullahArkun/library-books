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
    public ResponseEntity<BookDto> createBook(@RequestBody BookDto bookDto) {
        Author author = authorService.findById(bookDto.authorId())
                .orElseThrow(() -> new ResourceNotFoundException("Author not found with id: " + bookDto.authorId()));

        Book book = convertToEntity(bookDto, author);
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

    private Book convertToEntity(BookDto bookDto, Author author) {
        Book book = new Book();
        book.setIsbn(bookDto.isbn());
        book.setTitle(bookDto.title());
        book.setAuthor(author);
        return book;
    }
}
