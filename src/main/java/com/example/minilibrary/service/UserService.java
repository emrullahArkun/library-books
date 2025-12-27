package com.example.minilibrary.service;

import com.example.minilibrary.exception.ResourceNotFoundException;
import com.example.minilibrary.model.Author;
import com.example.minilibrary.model.Book;
import com.example.minilibrary.model.User;
import com.example.minilibrary.repository.AuthorRepository;
import com.example.minilibrary.repository.BookRepository;
import com.example.minilibrary.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final AuthorRepository authorRepository;
    private final PasswordEncoder passwordEncoder;

    public User createUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole("USER"); // Default role
        return userRepository.save(user);
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    @Transactional
    public User addBookToFavorites(Long userId, Long bookId) {
        User user = getUserById(userId);
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + bookId));

        user.getFavoriteBooks().add(book);
        return userRepository.save(user);
    }

    @Transactional
    public User removeBookFromFavorites(Long userId, Long bookId) {
        User user = getUserById(userId);
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + bookId));

        user.getFavoriteBooks().remove(book);
        return userRepository.save(user);
    }

    @Transactional
    public User addAuthorToFavorites(Long userId, Long authorId) {
        User user = getUserById(userId);
        Author author = authorRepository.findById(authorId)
                .orElseThrow(() -> new ResourceNotFoundException("Author not found with id: " + authorId));

        user.getFavoriteAuthors().add(author);
        return userRepository.save(user);
    }

    @Transactional
    public User removeAuthorFromFavorites(Long userId, Long authorId) {
        User user = getUserById(userId);
        Author author = authorRepository.findById(authorId)
                .orElseThrow(() -> new ResourceNotFoundException("Author not found with id: " + authorId));

        user.getFavoriteAuthors().remove(author);
        return userRepository.save(user);
    }
}
