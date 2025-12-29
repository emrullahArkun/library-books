package com.example.minilibrary.controller;

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
@org.springframework.security.test.context.support.WithMockUser(username = "admin", roles = { "USER" })
public class BookControllerIntegrationTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private BookRepository bookRepository;

        @Autowired
        private AuthorRepository authorRepository;

        @Autowired
        private com.example.minilibrary.repository.UserRepository userRepository;

        @org.springframework.boot.test.mock.mockito.MockBean
        private org.springframework.mail.javamail.JavaMailSender mailSender;

        @Autowired
        private ObjectMapper objectMapper;

        @BeforeEach
        void setUp() {
                bookRepository.deleteAll();
                authorRepository.deleteAll();
                userRepository.deleteAll();

                // Create the user that matches @WithMockUser
                com.example.minilibrary.model.User user = new com.example.minilibrary.model.User();
                user.setEmail("admin");
                user.setPassword("password");
                user.setRole(com.example.minilibrary.model.Role.USER); // Assuming Role enum exists or string
                user.setEnabled(true);
                userRepository.save(user);
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
        void shouldGetMyBooks() throws Exception {
                // Given: A book belonging to the user
                com.example.minilibrary.model.User user = userRepository.findByEmail("admin").orElseThrow();
                Author author = new Author();
                author.setName("Test Author");
                authorRepository.save(author);

                com.example.minilibrary.model.Book book = new com.example.minilibrary.model.Book();
                book.setTitle("My Book");
                book.setIsbn("111-111");
                book.setAuthor(author);
                book.setUser(user);
                bookRepository.save(book);

                // When: GET /api/books
                mockMvc.perform(get("/api/books"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$", hasSize(1)))
                                .andExpect(jsonPath("$[0].title", is("My Book")));
        }

        @Test
        void shouldUpdateBookStatus() throws Exception {
                // Given: A book
                com.example.minilibrary.model.User user = userRepository.findByEmail("admin").orElseThrow();
                Author author = new Author();
                author.setName("Status Author");
                authorRepository.save(author);

                com.example.minilibrary.model.Book book = new com.example.minilibrary.model.Book();
                book.setTitle("Status Book");
                book.setIsbn("222-222");
                book.setAuthor(author);
                book.setUser(user);
                book.setCompleted(false);
                com.example.minilibrary.model.Book savedBook = bookRepository.save(book);

                // When: PATCH /status
                mockMvc.perform(patch("/api/books/" + savedBook.getId() + "/status")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"completed\": true}")) // Sending as raw map/json
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.completed", is(true)));
        }

        @Test
        void shouldUpdateBookProgress() throws Exception {
                // Given: A book
                com.example.minilibrary.model.User user = userRepository.findByEmail("admin").orElseThrow();
                Author author = new Author();
                author.setName("Progress Author");
                authorRepository.save(author);

                com.example.minilibrary.model.Book book = new com.example.minilibrary.model.Book();
                book.setTitle("Progress Book");
                book.setIsbn("333-333");
                book.setAuthor(author);
                book.setUser(user);
                book.setPageCount(100);
                book.setCurrentPage(0);
                com.example.minilibrary.model.Book savedBook = bookRepository.save(book);

                // When: PATCH /progress
                mockMvc.perform(patch("/api/books/" + savedBook.getId() + "/progress")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"currentPage\": 50}"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.currentPage", is(50)));
        }

        @Test
        void shouldDeleteBook() throws Exception {
                // Given: A book
                com.example.minilibrary.model.User user = userRepository.findByEmail("admin").orElseThrow();
                Author author = new Author();
                author.setName("Delete Author");
                authorRepository.save(author);

                com.example.minilibrary.model.Book book = new com.example.minilibrary.model.Book();
                book.setTitle("Delete Book");
                book.setIsbn("444-444");
                book.setAuthor(author);
                book.setUser(user);
                com.example.minilibrary.model.Book savedBook = bookRepository.save(book);

                // When: DELETE
                mockMvc.perform(delete("/api/books/" + savedBook.getId()))
                                .andExpect(status().isNoContent()); // Correct status for DELETE is often 204

                // Then: Book should be gone
                mockMvc.perform(get("/api/books/" + savedBook.getId()))
                                .andExpect(status().isNotFound()); // Assuming individual get returns 404 or list is
                                                                   // empty
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
