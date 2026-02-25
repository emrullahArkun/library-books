package com.example.minilibrary.mapper;

import com.example.minilibrary.dto.BookDto;
import com.example.minilibrary.dto.CreateBookRequest;
import com.example.minilibrary.model.Book;
import com.example.minilibrary.model.ReadingGoalType;
import com.example.minilibrary.model.ReadingSession;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class BookMapperTest {

    private BookMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = Mappers.getMapper(BookMapper.class);
    }

    // --- toDto tests ---

    @Test
    void toDto_ShouldMapAllFields() {
        Book book = createBook();
        book.setAuthor("John Doe");
        book.setCategories("Fiction, Thriller");

        BookDto dto = mapper.toDto(book);

        assertEquals(1L, dto.id());
        assertEquals("isbn123", dto.isbn());
        assertEquals("Test Book", dto.title());
        assertEquals("John Doe", dto.authorName());
        assertEquals("2023", dto.publishDate());
        assertEquals("http://cover.jpg", dto.coverUrl());
        assertEquals(300, dto.pageCount());
        assertEquals(50, dto.currentPage());
        assertEquals("Fiction, Thriller", dto.categories());
    }

    @Test
    void toDto_ShouldHandleNullFields() {
        Book book = new Book();
        book.setId(1L);
        book.setIsbn("isbn");
        book.setTitle("title");

        BookDto dto = mapper.toDto(book);

        assertEquals(1L, dto.id());
        assertNull(dto.authorName());
        assertNull(dto.coverUrl());
        assertNull(dto.categories());
        assertNull(dto.readingGoalType());
        assertNull(dto.readingGoalProgress());
    }

    // --- toEntity tests ---

    @Test
    void toEntity_ShouldMapRequestToBook() {
        CreateBookRequest request = new CreateBookRequest(
                "isbn123", "Test Book", "John Doe", "2023", "http://cover.jpg", 300, "Thriller");

        Book book = mapper.toEntity(request);

        assertEquals("isbn123", book.getIsbn());
        assertEquals("Test Book", book.getTitle());
        assertEquals("John Doe", book.getAuthor());
        assertEquals("2023", book.getPublishDate());
        assertEquals("http://cover.jpg", book.getCoverUrl());
        assertEquals(300, book.getPageCount());
        assertEquals("Thriller", book.getCategories());
        // Ignored fields
        assertNull(book.getId());
        assertNull(book.getCurrentPage());
        assertNull(book.getUser());
    }

    // --- calculateProgress tests ---

    @Test
    void calculateProgress_ShouldReturnNull_WhenGoalTypeIsNull() {
        Book book = createBook();
        book.setReadingGoalType(null);
        book.setReadingGoalPages(100);

        BookDto dto = mapper.toDto(book);
        assertNull(dto.readingGoalProgress());
    }

    @Test
    void calculateProgress_ShouldReturnNull_WhenGoalPagesIsNull() {
        Book book = createBook();
        book.setReadingGoalType(ReadingGoalType.WEEKLY);
        book.setReadingGoalPages(null);

        BookDto dto = mapper.toDto(book);
        assertNull(dto.readingGoalProgress());
    }

    @Test
    void calculateProgress_ShouldReturnZero_WhenSessionsAreNull() {
        Book book = createBook();
        book.setReadingGoalType(ReadingGoalType.WEEKLY);
        book.setReadingGoalPages(100);
        book.setReadingSessions(null);

        BookDto dto = mapper.toDto(book);
        assertEquals(0, dto.readingGoalProgress());
    }

    @Test
    void calculateProgress_ShouldReturnZero_WhenNoSessionsInPeriod() {
        Book book = createBook();
        book.setReadingGoalType(ReadingGoalType.WEEKLY);
        book.setReadingGoalPages(100);

        // Session with endTime way in the past
        ReadingSession session = new ReadingSession();
        session.setEndTime(Instant.parse("2020-01-01T00:00:00Z"));
        session.setPagesRead(50);
        book.setReadingSessions(List.of(session));

        BookDto dto = mapper.toDto(book);
        assertEquals(0, dto.readingGoalProgress());
    }

    @Test
    void calculateProgress_Weekly_ShouldSumPagesRead() {
        Book book = createBook();
        book.setReadingGoalType(ReadingGoalType.WEEKLY);
        book.setReadingGoalPages(100);

        // Session in the current period (now)
        ReadingSession session = new ReadingSession();
        session.setEndTime(Instant.now());
        session.setPagesRead(25);

        book.setReadingSessions(List.of(session));

        BookDto dto = mapper.toDto(book);
        assertEquals(25, dto.readingGoalProgress());
    }

    @Test
    void calculateProgress_Monthly_ShouldSumPagesRead() {
        Book book = createBook();
        book.setReadingGoalType(ReadingGoalType.MONTHLY);
        book.setReadingGoalPages(200);

        ReadingSession s1 = new ReadingSession();
        s1.setEndTime(Instant.now());
        s1.setPagesRead(30);

        ReadingSession s2 = new ReadingSession();
        s2.setEndTime(Instant.now());
        s2.setPagesRead(20);

        book.setReadingSessions(List.of(s1, s2));

        BookDto dto = mapper.toDto(book);
        assertEquals(50, dto.readingGoalProgress());
    }

    @Test
    void calculateProgress_ShouldFilterOutSessionsWithNullEndTime() {
        Book book = createBook();
        book.setReadingGoalType(ReadingGoalType.WEEKLY);
        book.setReadingGoalPages(100);

        ReadingSession activeSession = new ReadingSession();
        activeSession.setEndTime(null); // still active, no end time
        activeSession.setPagesRead(99);

        ReadingSession completedSession = new ReadingSession();
        completedSession.setEndTime(Instant.now());
        completedSession.setPagesRead(10);

        book.setReadingSessions(List.of(activeSession, completedSession));

        BookDto dto = mapper.toDto(book);
        assertEquals(10, dto.readingGoalProgress());
    }

    @Test
    void calculateProgress_ShouldReturnZero_WhenPagesReadIsNullAndEndPageExists() {
        Book book = createBook();
        book.setReadingGoalType(ReadingGoalType.WEEKLY);
        book.setReadingGoalPages(100);

        ReadingSession session = new ReadingSession();
        session.setEndTime(Instant.now());
        session.setPagesRead(null);
        session.setEndPage(50); // endPage > 0 but pagesRead is null

        book.setReadingSessions(List.of(session));

        BookDto dto = mapper.toDto(book);
        assertEquals(0, dto.readingGoalProgress()); // fallback returns 0
    }

    @Test
    void calculateProgress_ShouldReturnZero_WhenPagesReadAndEndPageAreNull() {
        Book book = createBook();
        book.setReadingGoalType(ReadingGoalType.WEEKLY);
        book.setReadingGoalPages(100);

        ReadingSession session = new ReadingSession();
        session.setEndTime(Instant.now());
        session.setPagesRead(null);
        session.setEndPage(null);

        book.setReadingSessions(List.of(session));

        BookDto dto = mapper.toDto(book);
        assertEquals(0, dto.readingGoalProgress());
    }

    @Test
    void calculateProgress_ShouldReturnZero_WhenEndPageIsZero() {
        Book book = createBook();
        book.setReadingGoalType(ReadingGoalType.WEEKLY);
        book.setReadingGoalPages(100);

        ReadingSession session = new ReadingSession();
        session.setEndTime(Instant.now());
        session.setPagesRead(null);
        session.setEndPage(0); // endPage == 0, not > 0

        book.setReadingSessions(List.of(session));

        BookDto dto = mapper.toDto(book);
        assertEquals(0, dto.readingGoalProgress());
    }

    // --- Helper ---

    private Book createBook() {
        Book book = new Book();
        book.setId(1L);
        book.setIsbn("isbn123");
        book.setTitle("Test Book");
        book.setPublishDate("2023");
        book.setCoverUrl("http://cover.jpg");
        book.setPageCount(300);
        book.setCurrentPage(50);
        return book;
    }
}
