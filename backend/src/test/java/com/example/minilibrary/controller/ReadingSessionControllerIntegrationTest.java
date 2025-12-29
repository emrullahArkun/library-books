package com.example.minilibrary.controller;

import com.example.minilibrary.model.Author;
import com.example.minilibrary.model.Book;
import com.example.minilibrary.model.Role;
import com.example.minilibrary.model.SessionStatus;
import com.example.minilibrary.model.User;
import com.example.minilibrary.repository.AuthorRepository;
import com.example.minilibrary.repository.BookRepository;
import com.example.minilibrary.repository.ReadingSessionRepository;
import com.example.minilibrary.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.Map;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test") // Uses H2 database
class ReadingSessionControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private AuthorRepository authorRepository;

    @Autowired
    private ReadingSessionRepository sessionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private JavaMailSender javaMailSender;

    private User testUser;
    private Book testBook;

    @BeforeEach
    void setUp() {
        sessionRepository.deleteAll();
        bookRepository.deleteAll();
        authorRepository.deleteAll();
        userRepository.deleteAll();

        // Create User
        testUser = new User();
        testUser.setEmail("reader@example.com");
        testUser.setPassword(passwordEncoder.encode("password"));
        testUser.setRole(Role.USER);
        testUser.setEnabled(true);
        testUser = userRepository.save(testUser);

        // Create Author
        Author author = new Author();
        author.setName("Timer Author");
        author = authorRepository.save(author);

        // Create Book
        testBook = new Book();
        testBook.setTitle("Reading Timer Test");
        testBook.setAuthor(author);
        testBook.setIsbn("9999999999");
        testBook.setUser(testUser);
        testBook.setStartDate(LocalDate.now());
        testBook = bookRepository.save(testBook);
    }

    @Test
    @WithMockUser(username = "reader@example.com")
    void testStartSession_Success() throws Exception {
        mockMvc.perform(post("/api/sessions/start")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("bookId", testBook.getId()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("ACTIVE")))
                .andExpect(jsonPath("$.bookId", is(testBook.getId().intValue())))
                .andExpect(jsonPath("$.startTime", notNullValue()));
    }

    @Test
    @WithMockUser(username = "reader@example.com")
    void testStartSession_AlreadyActive_ShouldFail() throws Exception {
        // Start first session
        mockMvc.perform(post("/api/sessions/start")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("bookId", testBook.getId()))))
                .andExpect(status().isOk());

        // Try start second session
        mockMvc.perform(post("/api/sessions/start")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("bookId", testBook.getId()))))
                .andExpect(status().isInternalServerError()); // Or 409 Conflict if handled globally, but ISE/500 is
                                                              // default for IllegalStateException unless handled.
        // Note: In GlobalExceptionHandler we map
        // DuplicateResourceException/ConstraintViolation.
        // IllegalStateException might be 500. Let's assume 500 for now or map it.
    }

    @Test
    @WithMockUser(username = "reader@example.com")
    void testStopSession_Success() throws Exception {
        // Start session
        mockMvc.perform(post("/api/sessions/start")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("bookId", testBook.getId()))))
                .andExpect(status().isOk());

        // Stop session
        mockMvc.perform(post("/api/sessions/stop"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("COMPLETED")))
                .andExpect(jsonPath("$.endTime", notNullValue()));

        // Check DB
        assertEquals(0, sessionRepository.findByUserAndStatus(testUser, SessionStatus.ACTIVE).stream().count());
    }

    @Test
    @WithMockUser(username = "reader@example.com")
    void testGetActiveSession_Found() throws Exception {
        // Start session
        mockMvc.perform(post("/api/sessions/start")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("bookId", testBook.getId()))))
                .andExpect(status().isOk());

        // Get Active
        mockMvc.perform(get("/api/sessions/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("ACTIVE")));
    }

    @Test
    @WithMockUser(username = "reader@example.com")
    void testGetActiveSession_None() throws Exception {
        mockMvc.perform(get("/api/sessions/active"))
                .andExpect(status().isNoContent());
    }
}
