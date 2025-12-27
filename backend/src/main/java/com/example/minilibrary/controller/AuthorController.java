package com.example.minilibrary.controller;

import com.example.minilibrary.dto.AuthorDto;
import com.example.minilibrary.model.Author;
import com.example.minilibrary.service.AuthorService;
import com.example.minilibrary.exception.ResourceNotFoundException;
import com.example.minilibrary.mapper.AuthorMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/authors")
@RequiredArgsConstructor
public class AuthorController {

    private final AuthorService authorService;
    private final AuthorMapper authorMapper;

    @GetMapping
    public List<AuthorDto> getAllAuthors() {
        return authorService.findAll().stream()
                .map(authorMapper::toDto)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuthorDto> getAuthorById(@PathVariable Long id) {
        Author author = authorService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Author not found with id: " + id));
        return ResponseEntity.ok(authorMapper.toDto(author));
    }

    @PostMapping
    public ResponseEntity<AuthorDto> createAuthor(@RequestBody @jakarta.validation.Valid AuthorDto authorDto) {
        Author author = authorMapper.toEntity(authorDto);
        Author savedAuthor = authorService.save(author);
        return ResponseEntity.ok(authorMapper.toDto(savedAuthor));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAuthor(@PathVariable Long id) {
        authorService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
