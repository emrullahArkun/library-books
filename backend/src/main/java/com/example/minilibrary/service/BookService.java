package com.example.minilibrary.service;

import com.example.minilibrary.model.Book;
import com.example.minilibrary.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;

    public List<Book> findAll() {
        return bookRepository.findAll();
    }

    public Optional<Book> findById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("ID cannot be null");
        }
        return bookRepository.findById(id);
    }

    @Transactional
    public Book save(Book book) {
        if (book == null) {
            throw new IllegalArgumentException("Book cannot be null");
        }
        return bookRepository.save(book);
    }

    @Transactional
    public void deleteById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("ID cannot be null");
        }
        bookRepository.deleteById(id);
    }
}
