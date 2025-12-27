package com.example.minilibrary.controller;

import com.example.minilibrary.dto.AuthorDto;
import com.example.minilibrary.model.Author;
import com.example.minilibrary.repository.AuthorRepository;
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
public class AuthorControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AuthorRepository authorRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        authorRepository.deleteAll();
    }

    @Test
    void shouldCreateAuthor() throws Exception {
        AuthorDto authorDto = new AuthorDto(null, "J.R.R. Tolkien");

        mockMvc.perform(post("/api/authors")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(authorDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name", is("J.R.R. Tolkien")));
    }

    @Test
    void shouldGetAllAuthors() throws Exception {
        Author author = new Author();
        author.setName("George R.R. Martin");
        authorRepository.save(author);

        mockMvc.perform(get("/api/authors"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", is("George R.R. Martin")));
    }
}
