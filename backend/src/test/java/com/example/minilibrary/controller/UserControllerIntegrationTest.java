package com.example.minilibrary.controller;

import com.example.minilibrary.dto.UserDto;
import com.example.minilibrary.model.Author;
import com.example.minilibrary.model.Book;
import com.example.minilibrary.repository.AuthorRepository;
import com.example.minilibrary.repository.BookRepository;
import com.example.minilibrary.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@SuppressWarnings("null")
@org.springframework.security.test.context.support.WithMockUser(username = "admin", roles = { "USER" })
public class UserControllerIntegrationTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private BookRepository bookRepository;

        @Autowired
        private AuthorRepository authorRepository;

        @Autowired
        private ObjectMapper objectMapper;

        @BeforeEach
        void setUp() {
                userRepository.deleteAll();
                bookRepository.deleteAll();
                authorRepository.deleteAll();
        }

        @Test
        void shouldCreateUser() throws Exception {
                UserDto userDto = new UserDto(null, "johndoe", "john@example.com", "password", Collections.emptySet(),
                                Collections.emptySet());

                mockMvc.perform(post("/api/users")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(userDto)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.id").exists())
                                .andExpect(jsonPath("$.username", is("johndoe")));
        }

        @Test
        void shouldAddBookToFavorites() throws Exception {
                // Given: User, Author, Book
                UserDto userDto = new UserDto(null, "booklover", "lover@example.com", "secret", Collections.emptySet(),
                                Collections.emptySet());
                String userJson = mockMvc.perform(post("/api/users")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(userDto)))
                                .andReturn().getResponse().getContentAsString();
                UserDto createdUser = objectMapper.readValue(userJson, UserDto.class);

                Author author = new Author();
                author.setName("J.K. Rowling");
                Author savedAuthor = authorRepository.save(author);

                Book book = new Book();
                book.setTitle("Harry Potter");
                book.setIsbn("12345");
                book.setAuthor(savedAuthor);
                book.setUser(userRepository.findById(createdUser.id()).orElseThrow());
                Book savedBook = bookRepository.save(book);

                // When: Adding book to favorites
                mockMvc.perform(post("/api/users/" + createdUser.id() + "/favorites/books/" + savedBook.getId()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.favoriteBooks", hasSize(1)))
                                .andExpect(jsonPath("$.favoriteBooks[0].title", is("Harry Potter")));
        }
}
