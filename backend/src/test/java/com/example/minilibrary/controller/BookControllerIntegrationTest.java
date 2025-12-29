package com.example.minilibrary.controller;

import com.example.minilibrary.model.Author;
import com.example.minilibrary.model.User;
import com.example.minilibrary.model.Role;
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
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mail.javamail.JavaMailSender;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@SuppressWarnings("null")
@org.springframework.security.test.context.support.WithMockUser(username = "admin", roles = { "USER" })
public class BookControllerIntegrationTest {

        @Autowired
        private MockMvc mockMvc;

        @MockBean
        private JavaMailSender mailSender;

        @Autowired
        private BookRepository bookRepository;

        @Autowired
        private AuthorRepository authorRepository;

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private ObjectMapper objectMapper;

        @BeforeEach
        void setUp() {
                bookRepository.deleteAll();
                authorRepository.deleteAll();
                userRepository.deleteAll();

                User admin = new User();
                admin.setEmail("admin");
                admin.setPassword("password");
                admin.setRole(Role.USER);
                admin.setEnabled(true);
                userRepository.save(admin);
        }

        @Test
        void shouldCreateBook() throws Exception {
                // Given: An existing author
                Author author = new Author();
                author.setName("J.K. Rowling");
                Author savedAuthor = authorRepository.save(author);

                // When: Creating a book for this author
                com.example.minilibrary.dto.CreateBookRequest request = new com.example.minilibrary.dto.CreateBookRequest(
                                "978-1234567890", "Harry Potter", savedAuthor.getId(), null, "2001",
                                "http://cover.url", 250);

                mockMvc.perform(post("/api/books")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.id").exists())
                                .andExpect(jsonPath("$.title", is("Harry Potter")))
                                .andExpect(jsonPath("$.authorId", is(savedAuthor.getId().intValue())));
        }

        @Test
        void shouldCreateBookWithAuthorName() throws Exception {
                // When: Creating a book with ONLY author name (Find or Create logic)
                com.example.minilibrary.dto.CreateBookRequest request = new com.example.minilibrary.dto.CreateBookRequest(
                                "978-9876543210", "New Book", null, "New Author", null, null, null);

                mockMvc.perform(post("/api/books")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.id").exists())
                                .andExpect(jsonPath("$.title", is("New Book")));
        }

        @Test
        void shouldFailToCreateBookCheckingAuthorExistence() throws Exception {
                // When: Creating a book for a non-existent author ID
                com.example.minilibrary.dto.CreateBookRequest request = new com.example.minilibrary.dto.CreateBookRequest(
                                "123",
                                "Unknown Book", 999L, null, null, null, null);

                mockMvc.perform(post("/api/books")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isNotFound()); // Should execute global exception handler
        }
}
