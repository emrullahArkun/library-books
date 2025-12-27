package com.example.minilibrary.controller;

import com.example.minilibrary.dto.BookDto;
import com.example.minilibrary.model.Author;
import com.example.minilibrary.repository.AuthorRepository;
import com.example.minilibrary.repository.BookRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@SuppressWarnings("null")
public class BookControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private AuthorRepository authorRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        bookRepository.deleteAll();
        authorRepository.deleteAll();
    }

    @Test
    void shouldCreateBook() throws Exception {
        // Given: An existing author
        Author author = new Author();
        author.setName("J.K. Rowling");
        Author savedAuthor = authorRepository.save(author);

        // When: Creating a book for this author
        BookDto bookDto = new BookDto(null, "978-1234567890", "Harry Potter", savedAuthor.getId());

        mockMvc.perform(post("/api/books")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(bookDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.title", is("Harry Potter")))
                .andExpect(jsonPath("$.authorId", is(savedAuthor.getId().intValue())));
    }

    @Test
    void shouldFailToCreateBookCheckingAuthorExistence() throws Exception {
        // When: Creating a book for a non-existent author
        BookDto bookDto = new BookDto(null, "123", "Unknown Book", 999L);

        mockMvc.perform(post("/api/books")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(bookDto)))
                .andExpect(status().isNotFound()); // Should execute global exception handler
    }
}
