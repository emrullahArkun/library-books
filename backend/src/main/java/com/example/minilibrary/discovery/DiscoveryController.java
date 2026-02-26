package com.example.minilibrary.discovery;

import com.example.minilibrary.auth.User;
import com.example.minilibrary.shared.security.CurrentUser;
import com.example.minilibrary.discovery.DiscoveryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/discovery")
@RequiredArgsConstructor
public class DiscoveryController {

    private final DiscoveryService discoveryService;

    private static final int DEFAULT_LIMIT = 5;
    private static final int MAX_RESULTS = 10;

    /**
     * Log a search query for recommendation purposes
     */
    @PostMapping("/search-log")
    public ResponseEntity<Void> logSearch(@RequestParam String query, @CurrentUser User user) {
        discoveryService.logSearch(query, user);
        return ResponseEntity.ok().build();
    }

    /**
     * Get recommendations based on top authors in user's collection
     */
    /**
     * Get recommendations based on top authors in user's collection
     */
    @GetMapping("/authors")
    public ResponseEntity<com.example.minilibrary.discovery.dto.DiscoveryResponse.AuthorSection> getAuthorRecommendations(
            @CurrentUser User user) {
        List<String> topAuthors = discoveryService.getTopAuthors(user, 3);
        List<com.example.minilibrary.discovery.dto.RecommendedBookDto> books = topAuthors.isEmpty()
                ? java.util.Collections.emptyList()
                : discoveryService.getRecommendationsByAuthor(topAuthors.get(0), user, MAX_RESULTS);

        return ResponseEntity.ok(new com.example.minilibrary.discovery.dto.DiscoveryResponse.AuthorSection(topAuthors, books));
    }

    /**
     * Get recommendations based on top categories/genres in user's collection
     */
    @GetMapping("/categories")
    public ResponseEntity<com.example.minilibrary.discovery.dto.DiscoveryResponse.CategorySection> getCategoryRecommendations(
            @CurrentUser User user) {
        List<String> topCategories = discoveryService.getTopCategories(user, 3);
        List<com.example.minilibrary.discovery.dto.RecommendedBookDto> books = topCategories.isEmpty()
                ? java.util.Collections.emptyList()
                : discoveryService.getRecommendationsByCategory(topCategories.get(0), user, MAX_RESULTS);

        return ResponseEntity
                .ok(new com.example.minilibrary.discovery.dto.DiscoveryResponse.CategorySection(topCategories, books));
    }

    /**
     * Get recommendations based on recent search queries
     */
    @GetMapping("/recent-searches")
    public ResponseEntity<com.example.minilibrary.discovery.dto.DiscoveryResponse.SearchSection> getRecentSearchRecommendations(
            @CurrentUser User user) {
        List<String> recentSearches = discoveryService.getRecentSearches(user, DEFAULT_LIMIT);
        List<com.example.minilibrary.discovery.dto.RecommendedBookDto> books = recentSearches.isEmpty()
                ? java.util.Collections.emptyList()
                : discoveryService.getRecommendationsByQuery(recentSearches.get(0), user, MAX_RESULTS);

        return ResponseEntity
                .ok(new com.example.minilibrary.discovery.dto.DiscoveryResponse.SearchSection(recentSearches, books));
    }

    /**
     * Get all discovery data in one call (for Discovery page)
     */
    @GetMapping
    public ResponseEntity<com.example.minilibrary.discovery.dto.DiscoveryResponse> getDiscoveryData(@CurrentUser User user) {
        // Authors section
        List<String> topAuthors = discoveryService.getTopAuthors(user, 3);
        List<com.example.minilibrary.discovery.dto.RecommendedBookDto> authorBooks = topAuthors.isEmpty()
                ? java.util.Collections.emptyList()
                : discoveryService.getRecommendationsByAuthor(topAuthors.get(0), user, MAX_RESULTS);
        var authorSection = new com.example.minilibrary.discovery.dto.DiscoveryResponse.AuthorSection(topAuthors, authorBooks);

        // Categories section
        List<String> topCategories = discoveryService.getTopCategories(user, 3);
        List<com.example.minilibrary.discovery.dto.RecommendedBookDto> categoryBooks = topCategories.isEmpty()
                ? java.util.Collections.emptyList()
                : discoveryService.getRecommendationsByCategory(topCategories.get(0), user, MAX_RESULTS);
        var categorySection = new com.example.minilibrary.discovery.dto.DiscoveryResponse.CategorySection(topCategories,
                categoryBooks);

        // Recent searches section
        List<String> recentSearches = discoveryService.getRecentSearches(user, 3);
        List<com.example.minilibrary.discovery.dto.RecommendedBookDto> searchBooks = recentSearches.isEmpty()
                ? java.util.Collections.emptyList()
                : discoveryService.getRecommendationsByQuery(recentSearches.get(0), user, MAX_RESULTS);
        var searchSection = new com.example.minilibrary.discovery.dto.DiscoveryResponse.SearchSection(recentSearches,
                searchBooks);

        return ResponseEntity
                .ok(new com.example.minilibrary.discovery.dto.DiscoveryResponse(authorSection, categorySection, searchSection));
    }
}
