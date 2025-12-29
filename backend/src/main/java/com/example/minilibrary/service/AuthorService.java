package com.example.minilibrary.service;

import com.example.minilibrary.model.Author;
import com.example.minilibrary.repository.AuthorRepository;
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
public class AuthorService {

    private final AuthorRepository authorRepository;

    public List<Author> findAll() {
        return authorRepository.findAll();
    }

    public Optional<Author> findById(@NotNull Long id) {
        return authorRepository.findById(id);
    }

    public Optional<Author> findByName(@NotNull String name) {
        return authorRepository.findByName(name);
    }

    @Transactional
    public Author save(@NotNull Author author) {
        return authorRepository.save(author);
    }

    @Transactional
    public void deleteById(@NotNull Long id) {
        authorRepository.deleteById(id);
    }
}
