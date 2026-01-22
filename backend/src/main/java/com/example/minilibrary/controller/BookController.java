package com.example.minilibrary.controller;

import com.example.minilibrary.security.CurrentUser;
import com.example.minilibrary.model.User;

import com.example.minilibrary.dto.BookDto;
import com.example.minilibrary.model.Book;
import com.example.minilibrary.service.BookService;
import com.example.minilibrary.exception.ResourceNotFoundException;
import com.example.minilibrary.mapper.BookMapper;
import com.example.minilibrary.dto.CreateBookRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;
    private final BookMapper bookMapper;

    @GetMapping
    public org.springframework.data.domain.Page<BookDto> getAllBooks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @CurrentUser User user) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        return bookService.findAllByUser(user, pageable)
                .map(bookMapper::toDto);
    }

    @GetMapping("/owned")
    public java.util.List<String> getAllOwnedIsbns(@CurrentUser User user) {
        return bookService.getAllOwnedIsbns(user);
    }

    @GetMapping("/{id:\\d+}")
    public ResponseEntity<BookDto> getBookById(@PathVariable Long id, @CurrentUser User user) {
        Book book = bookService.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));
        return ResponseEntity.ok(bookMapper.toDto(book));
    }

    @PostMapping
    public ResponseEntity<BookDto> createBook(
            @RequestBody @jakarta.validation.Valid CreateBookRequest request,
            @CurrentUser User user) {
        Book savedBook = bookService.createBook(request, user);
        return ResponseEntity.ok(bookMapper.toDto(savedBook));
    }

    @PatchMapping("/{id}/progress")
    public ResponseEntity<BookDto> updateBookProgress(
            @PathVariable Long id,
            @RequestBody @jakarta.validation.Valid com.example.minilibrary.dto.UpdateProgressRequest request,
            @CurrentUser User user) {
        Book updatedBook = bookService.updateBookProgress(id, request.currentPage(), user);
        return ResponseEntity.ok(bookMapper.toDto(updatedBook));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<BookDto> updateBookStatus(
            @PathVariable Long id,
            @RequestBody @jakarta.validation.Valid com.example.minilibrary.dto.UpdateStatusRequest request,
            @CurrentUser User user) {
        Book updatedBook = bookService.updateBookStatus(id, request.completed(), user);
        return ResponseEntity.ok(bookMapper.toDto(updatedBook));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id, @CurrentUser User user) {
        bookService.deleteByIdAndUser(id, user);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteAllBooks(@CurrentUser User user) {
        bookService.deleteAllByUser(user);
        return ResponseEntity.noContent().build();
    }
}
