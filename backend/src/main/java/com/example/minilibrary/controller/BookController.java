package com.example.minilibrary.controller;

import com.example.minilibrary.dto.BookDto;
import com.example.minilibrary.model.Book;
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
    private final BookMapper bookMapper;
    private final com.example.minilibrary.service.AuthService authService;

    private com.example.minilibrary.model.User getCurrentUser(java.security.Principal principal) {
        if (principal == null)
            throw new com.example.minilibrary.exception.ResourceNotFoundException("User not authenticated");
        return authService.getUserByEmail(principal.getName());
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
        Book savedBook = bookService.createBook(request, getCurrentUser(principal));
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

    @PatchMapping("/{id}/status")
    public ResponseEntity<BookDto> updateBookStatus(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, Boolean> updateRequest,
            java.security.Principal principal) {
        Boolean completed = updateRequest.get("completed");
        if (completed == null) {
            throw new IllegalArgumentException("completed status is required");
        }
        Book updatedBook = bookService.updateBookStatus(id, completed, getCurrentUser(principal));
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
