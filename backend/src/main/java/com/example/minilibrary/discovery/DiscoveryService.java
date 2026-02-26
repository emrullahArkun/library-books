package com.example.minilibrary.discovery;

import com.example.minilibrary.discovery.SearchHistory;
import com.example.minilibrary.auth.User;
import com.example.minilibrary.books.BookRepository;
import com.example.minilibrary.discovery.SearchHistoryRepository;
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
    private final GoogleBooksClient googleBooksClient;

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
    public List<com.example.minilibrary.discovery.dto.RecommendedBookDto> getRecommendationsByAuthor(String author,
            User user,
            int maxResults) {
        Set<String> ownedIsbns = new HashSet<>(bookRepository.findAllIsbnsByUser(user));
        return filterOwnedBooks(googleBooksClient.getBooksByAuthor(author, maxResults), ownedIsbns);
    }

    /**
     * Fetch book recommendations by category/subject
     */
    public List<com.example.minilibrary.discovery.dto.RecommendedBookDto> getRecommendationsByCategory(String category,
            User user,
            int maxResults) {
        Set<String> ownedIsbns = new HashSet<>(bookRepository.findAllIsbnsByUser(user));
        return filterOwnedBooks(googleBooksClient.getBooksByCategory(category, maxResults), ownedIsbns);
    }

    /**
     * Fetch book recommendations by search query
     */
    public List<com.example.minilibrary.discovery.dto.RecommendedBookDto> getRecommendationsByQuery(String query,
            User user,
            int maxResults) {
        Set<String> ownedIsbns = new HashSet<>(bookRepository.findAllIsbnsByUser(user));
        return filterOwnedBooks(googleBooksClient.getBooksByQuery(query, maxResults), ownedIsbns);
    }

    // ==================== HELPER METHODS ====================

    private List<com.example.minilibrary.discovery.dto.RecommendedBookDto> filterOwnedBooks(
            List<com.example.minilibrary.discovery.dto.RecommendedBookDto> books, Set<String> ownedIsbns) {
        return books.stream()
                .filter(book -> book.isbn() == null || !ownedIsbns.contains(book.isbn()))
                .collect(Collectors.toList());
    }
}
