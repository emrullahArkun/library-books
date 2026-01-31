package com.example.minilibrary.service;

import com.example.minilibrary.model.SearchHistory;
import com.example.minilibrary.model.User;
import com.example.minilibrary.repository.BookRepository;
import com.example.minilibrary.repository.SearchHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DiscoveryService {

    private static final int MAX_SEARCH_HISTORY_PER_USER = 50;
    private static final int DEDUPLICATION_MINUTES = 5;

    private final SearchHistoryRepository searchHistoryRepository;
    private final BookRepository bookRepository;
    private final RestTemplate restTemplate;

    @Value("${google.books.api.url:https://www.googleapis.com/books/v1/volumes}")
    private String googleBooksApiUrl;

    // ==================== SEARCH LOGGING ====================

    @Transactional
    public void logSearch(String query, User user) {
        if (query == null || query.trim().isEmpty()) {
            return;
        }

        String trimmedQuery = query.trim();

        // Deduplication: Check if same query in last 5 minutes
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(DEDUPLICATION_MINUTES);
        if (searchHistoryRepository.existsByUserAndQueryAndTimestampAfter(user, trimmedQuery, cutoff)) {
            log.debug("Skipping duplicate search log for query: {}", trimmedQuery);
            return;
        }

        // Limit check: Delete oldest if over limit
        if (searchHistoryRepository.countByUser(user) >= MAX_SEARCH_HISTORY_PER_USER) {
            searchHistoryRepository.deleteOldestByUserId(user.getId());
        }

        SearchHistory history = SearchHistory.builder()
                .query(trimmedQuery)
                .user(user)
                .build();
        searchHistoryRepository.save(history);
    }

    // ==================== HEURISTICS ====================

    /**
     * Get top authors from user's collection (sorted by count)
     */
    public List<String> getTopAuthors(User user, int limit) {
        List<String> authors = bookRepository.findTopAuthorsByUser(user);
        return authors.stream().limit(limit).collect(Collectors.toList());
    }

    /**
     * Get top categories from user's collection (aggregated and sorted by count)
     */
    public List<String> getTopCategories(User user, int limit) {
        List<String> allCategoriesRaw = bookRepository.findAllCategoriesByUser(user);

        // Parse comma-separated, count, sort
        Map<String, Long> categoryCount = allCategoriesRaw.stream()
                .flatMap(cats -> Arrays.stream(cats.split(",")))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.groupingBy(c -> c, Collectors.counting()));

        return categoryCount.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(limit)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }

    /**
     * Get recent distinct search queries
     */
    public List<String> getRecentSearches(User user, int limit) {
        return searchHistoryRepository.findDistinctQueriesByUserOrderByTimestampDesc(user)
                .stream()
                .limit(limit)
                .collect(Collectors.toList());
    }

    // ==================== GOOGLE BOOKS RECOMMENDATIONS ====================

    // ==================== GOOGLE BOOKS RECOMMENDATIONS ====================

    /**
     * Fetch book recommendations by author, excluding already owned books
     */
    public List<com.example.minilibrary.dto.RecommendedBookDto> getRecommendationsByAuthor(String author, User user,
            int maxResults) {
        Set<String> ownedIsbns = new HashSet<>(bookRepository.findAllIsbnsByUser(user));
        String url = googleBooksApiUrl + "?q=inauthor:" + encodeParam(author) + "&maxResults=" + maxResults;
        return fetchAndFilterBooks(url, ownedIsbns);
    }

    /**
     * Fetch book recommendations by category/subject
     */
    public List<com.example.minilibrary.dto.RecommendedBookDto> getRecommendationsByCategory(String category, User user,
            int maxResults) {
        Set<String> ownedIsbns = new HashSet<>(bookRepository.findAllIsbnsByUser(user));
        String url = googleBooksApiUrl + "?q=subject:" + encodeParam(category) + "&maxResults=" + maxResults;
        return fetchAndFilterBooks(url, ownedIsbns);
    }

    /**
     * Fetch book recommendations by search query
     */
    public List<com.example.minilibrary.dto.RecommendedBookDto> getRecommendationsByQuery(String query, User user,
            int maxResults) {
        Set<String> ownedIsbns = new HashSet<>(bookRepository.findAllIsbnsByUser(user));
        String url = googleBooksApiUrl + "?q=" + encodeParam(query) + "&maxResults=" + maxResults;
        return fetchAndFilterBooks(url, ownedIsbns);
    }

    // ==================== HELPER METHODS ====================

    @SuppressWarnings("unchecked")
    private List<com.example.minilibrary.dto.RecommendedBookDto> fetchAndFilterBooks(String url,
            Set<String> excludeIsbns) {
        try {
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response == null || !response.containsKey("items")) {
                return Collections.emptyList();
            }

            List<Map<String, Object>> items = (List<Map<String, Object>>) response.get("items");
            return items.stream()
                    .map(this::mapToDto)
                    .filter(book -> {
                        String isbn = book.isbn();
                        return isbn == null || !excludeIsbns.contains(isbn);
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Failed to fetch books from Google API: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    @SuppressWarnings("unchecked")
    private com.example.minilibrary.dto.RecommendedBookDto mapToDto(Map<String, Object> item) {
        Map<String, Object> volumeInfo = (Map<String, Object>) item.get("volumeInfo");

        String title = (String) volumeInfo.get("title");
        List<String> authors = (List<String>) volumeInfo.get("authors");
        List<String> categories = (List<String>) volumeInfo.get("categories");
        String publishedDate = (String) volumeInfo.get("publishedDate");
        Integer pageCount = (Integer) volumeInfo.get("pageCount");

        String isbn = null;
        List<Map<String, String>> identifiers = (List<Map<String, String>>) volumeInfo.get("industryIdentifiers");
        if (identifiers != null) {
            isbn = identifiers.stream()
                    .filter(id -> "ISBN_13".equals(id.get("type")) || "ISBN_10".equals(id.get("type")))
                    .map(id -> id.get("identifier"))
                    .findFirst()
                    .orElse(null);
        }

        String coverUrl = null;
        Map<String, String> imageLinks = (Map<String, String>) volumeInfo.get("imageLinks");
        if (imageLinks != null) {
            coverUrl = imageLinks.getOrDefault("thumbnail", imageLinks.get("smallThumbnail"));
        }

        return new com.example.minilibrary.dto.RecommendedBookDto(title, authors, categories, publishedDate, pageCount,
                isbn, coverUrl);
    }

    private String encodeParam(String param) {
        try {
            return java.net.URLEncoder.encode(param, "UTF-8");
        } catch (Exception e) {
            return param;
        }
    }
}
