package com.example.minilibrary.service;

import com.example.minilibrary.model.Author;
import com.example.minilibrary.repository.AuthorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthorService {

    private final AuthorRepository authorRepository;

    public List<Author> findAll() {
        return authorRepository.findAll();
    }

    public Optional<Author> findById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("ID cannot be null");
        }
        return authorRepository.findById(id);
    }

    @Transactional
    public Author save(Author author) {
        if (author == null) {
            throw new IllegalArgumentException("Author cannot be null");
        }
        return authorRepository.save(author);
    }

    @Transactional
    public void deleteById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("ID cannot be null");
        }
        authorRepository.deleteById(id);
    }
}
