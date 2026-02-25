package com.example.minilibrary.service;

import com.example.minilibrary.model.User;
import com.example.minilibrary.repository.BookRepository;
import com.example.minilibrary.repository.SearchHistoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DiscoveryServiceTest {

    @Mock
    private SearchHistoryRepository searchHistoryRepository;
    @Mock
    private BookRepository bookRepository;
    @Mock
    private RestTemplate restTemplate;
    @InjectMocks
    private DiscoveryService discoveryService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
    }

    // --- logSearch ---

    @Test
    void logSearch_ShouldSave_WhenQueryValid() {
        when(searchHistoryRepository.existsByUserAndQueryAndTimestampAfter(eq(user), eq("test"), any()))
                .thenReturn(false);
        when(searchHistoryRepository.countByUser(user)).thenReturn(0L);

        discoveryService.logSearch("test", user);
        verify(searchHistoryRepository).save(any());
    }

    @Test
    void logSearch_ShouldSkip_WhenQueryNull() {
        discoveryService.logSearch(null, user);
        verify(searchHistoryRepository, never()).save(any());
    }

    @Test
    void logSearch_ShouldSkip_WhenQueryEmpty() {
        discoveryService.logSearch("   ", user);
        verify(searchHistoryRepository, never()).save(any());
    }

    @Test
    void logSearch_ShouldSkip_WhenDuplicate() {
        when(searchHistoryRepository.existsByUserAndQueryAndTimestampAfter(eq(user), eq("test"), any()))
                .thenReturn(true);

        discoveryService.logSearch("test", user);
        verify(searchHistoryRepository, never()).save(any());
    }

    @Test
    void logSearch_ShouldDeleteOldest_WhenOverLimit() {
        when(searchHistoryRepository.existsByUserAndQueryAndTimestampAfter(eq(user), eq("test"), any()))
                .thenReturn(false);
        when(searchHistoryRepository.countByUser(user)).thenReturn(50L);

        discoveryService.logSearch("test", user);
        verify(searchHistoryRepository).deleteOldestByUserId(user.getId());
        verify(searchHistoryRepository).save(any());
    }

    // --- getTopAuthors ---

    @Test
    void getTopAuthors_ShouldReturnLimitedList() {
        when(bookRepository.findTopAuthorsByUser(user)).thenReturn(List.of("A", "B", "C", "D"));

        List<String> result = discoveryService.getTopAuthors(user, 2);
        assertEquals(2, result.size());
        assertEquals("A", result.get(0));
    }

    // --- getTopCategories ---

    @Test
    void getTopCategories_ShouldParseAndSort() {
        when(bookRepository.findAllCategoriesByUser(user))
                .thenReturn(List.of("Thriller, Krimi", "Thriller", "Sci-Fi"));

        List<String> result = discoveryService.getTopCategories(user, 2);
        assertEquals(2, result.size());
        assertEquals("Thriller", result.get(0)); // count 2
    }

    // --- getRecentSearches ---

    @Test
    void getRecentSearches_ShouldReturnLimitedList() {
        when(searchHistoryRepository.findDistinctQueriesByUserOrderByTimestampDesc(user))
                .thenReturn(List.of("q1", "q2", "q3"));

        List<String> result = discoveryService.getRecentSearches(user, 2);
        assertEquals(2, result.size());
    }

    // --- recommendations (fetchAndFilterBooks) ---

    @Test
    void getRecommendationsByAuthor_ShouldReturnBooks() throws Exception {
        when(bookRepository.findAllIsbnsByUser(user)).thenReturn(List.of("owned123"));

        Map<String, Object> volumeInfo = Map.of(
                "title", "Book Title",
                "authors", List.of("Author"),
                "pageCount", 200);
        Map<String, Object> item = Map.of("volumeInfo", volumeInfo);
        Map<String, Object> response = Map.of("items", List.of(item));

        when(restTemplate.getForObject(anyString(), eq(Map.class))).thenReturn(response);

        var result = discoveryService.getRecommendationsByAuthor("Author", user, 5);
        assertEquals(1, result.size());
        assertEquals("Book Title", result.get(0).title());
    }

    @Test
    void getRecommendationsByAuthor_ShouldExcludeOwnedBooks() {
        when(bookRepository.findAllIsbnsByUser(user)).thenReturn(List.of("isbn123"));

        Map<String, Object> volumeInfo = Map.of(
                "title", "Owned Book",
                "industryIdentifiers", List.of(Map.of("type", "ISBN_13", "identifier", "isbn123")));
        Map<String, Object> item = Map.of("volumeInfo", volumeInfo);
        Map<String, Object> response = Map.of("items", List.of(item));

        when(restTemplate.getForObject(anyString(), eq(Map.class))).thenReturn(response);

        var result = discoveryService.getRecommendationsByAuthor("Author", user, 5);
        assertEquals(0, result.size());
    }

    @Test
    void getRecommendationsByCategory_ShouldReturnBooks() {
        when(bookRepository.findAllIsbnsByUser(user)).thenReturn(List.of());

        Map<String, Object> volumeInfo = Map.of("title", "Cat Book");
        Map<String, Object> item = Map.of("volumeInfo", volumeInfo);
        when(restTemplate.getForObject(anyString(), eq(Map.class)))
                .thenReturn(Map.of("items", List.of(item)));

        var result = discoveryService.getRecommendationsByCategory("Fiction", user, 5);
        assertEquals(1, result.size());
    }

    @Test
    void getRecommendationsByQuery_ShouldReturnBooks() {
        when(bookRepository.findAllIsbnsByUser(user)).thenReturn(List.of());

        Map<String, Object> volumeInfo = Map.of("title", "Search Book");
        Map<String, Object> item = Map.of("volumeInfo", volumeInfo);
        when(restTemplate.getForObject(anyString(), eq(Map.class)))
                .thenReturn(Map.of("items", List.of(item)));

        var result = discoveryService.getRecommendationsByQuery("Java", user, 5);
        assertEquals(1, result.size());
    }

    @Test
    void fetchAndFilterBooks_ShouldReturnEmpty_WhenResponseNull() {
        when(bookRepository.findAllIsbnsByUser(user)).thenReturn(List.of());
        when(restTemplate.getForObject(anyString(), eq(Map.class))).thenReturn(null);

        var result = discoveryService.getRecommendationsByAuthor("Author", user, 5);
        assertTrue(result.isEmpty());
    }

    @Test
    void fetchAndFilterBooks_ShouldReturnEmpty_WhenNoItems() {
        when(bookRepository.findAllIsbnsByUser(user)).thenReturn(List.of());
        when(restTemplate.getForObject(anyString(), eq(Map.class))).thenReturn(Map.of("totalItems", 0));

        var result = discoveryService.getRecommendationsByAuthor("Author", user, 5);
        assertTrue(result.isEmpty());
    }

    @Test
    void fetchAndFilterBooks_ShouldReturnEmpty_WhenApiThrows() {
        when(bookRepository.findAllIsbnsByUser(user)).thenReturn(List.of());
        when(restTemplate.getForObject(anyString(), eq(Map.class)))
                .thenThrow(new RuntimeException("API error"));

        var result = discoveryService.getRecommendationsByAuthor("Author", user, 5);
        assertTrue(result.isEmpty());
    }

    @Test
    void mapToDto_ShouldExtractCoverUrl() {
        when(bookRepository.findAllIsbnsByUser(user)).thenReturn(List.of());

        Map<String, Object> volumeInfo = Map.of(
                "title", "Book",
                "imageLinks", Map.of("thumbnail", "http://thumb.jpg"));
        Map<String, Object> item = Map.of("volumeInfo", volumeInfo);
        when(restTemplate.getForObject(anyString(), eq(Map.class)))
                .thenReturn(Map.of("items", List.of(item)));

        var result = discoveryService.getRecommendationsByQuery("test", user, 5);
        assertEquals("http://thumb.jpg", result.get(0).coverUrl());
    }
}
