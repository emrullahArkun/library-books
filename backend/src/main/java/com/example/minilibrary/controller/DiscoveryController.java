package com.example.minilibrary.controller;

import com.example.minilibrary.model.User;
import com.example.minilibrary.security.CurrentUser;
import com.example.minilibrary.service.DiscoveryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
    @GetMapping("/authors")
    public ResponseEntity<Map<String, Object>> getAuthorRecommendations(@CurrentUser User user) {
        List<String> topAuthors = discoveryService.getTopAuthors(user, 3);

        Map<String, Object> response = new HashMap<>();
        response.put("authors", topAuthors);

        if (!topAuthors.isEmpty()) {
            // Get recommendations for the top author
            List<Map<String, Object>> books = discoveryService.getRecommendationsByAuthor(
                    topAuthors.get(0), user, MAX_RESULTS);
            response.put("books", books);
        }

        return ResponseEntity.ok(response);
    }

    /**
     * Get recommendations based on top categories/genres in user's collection
     */
    @GetMapping("/categories")
    public ResponseEntity<Map<String, Object>> getCategoryRecommendations(@CurrentUser User user) {
        List<String> topCategories = discoveryService.getTopCategories(user, 3);

        Map<String, Object> response = new HashMap<>();
        response.put("categories", topCategories);

        if (!topCategories.isEmpty()) {
            List<Map<String, Object>> books = discoveryService.getRecommendationsByCategory(
                    topCategories.get(0), user, MAX_RESULTS);
            response.put("books", books);
        }

        return ResponseEntity.ok(response);
    }

    /**
     * Get recommendations based on recent search queries
     */
    @GetMapping("/recent-searches")
    public ResponseEntity<Map<String, Object>> getRecentSearchRecommendations(@CurrentUser User user) {
        List<String> recentSearches = discoveryService.getRecentSearches(user, DEFAULT_LIMIT);

        Map<String, Object> response = new HashMap<>();
        response.put("queries", recentSearches);

        if (!recentSearches.isEmpty()) {
            List<Map<String, Object>> books = discoveryService.getRecommendationsByQuery(
                    recentSearches.get(0), user, MAX_RESULTS);
            response.put("books", books);
        }

        return ResponseEntity.ok(response);
    }

    /**
     * Get all discovery data in one call (for Discovery page)
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getDiscoveryData(@CurrentUser User user) {
        Map<String, Object> response = new HashMap<>();

        // Authors section
        List<String> topAuthors = discoveryService.getTopAuthors(user, 3);
        Map<String, Object> authorsSection = new HashMap<>();
        authorsSection.put("authors", topAuthors);
        if (!topAuthors.isEmpty()) {
            authorsSection.put("books", discoveryService.getRecommendationsByAuthor(
                    topAuthors.get(0), user, MAX_RESULTS));
        }
        response.put("byAuthor", authorsSection);

        // Categories section
        List<String> topCategories = discoveryService.getTopCategories(user, 3);
        Map<String, Object> categoriesSection = new HashMap<>();
        categoriesSection.put("categories", topCategories);
        if (!topCategories.isEmpty()) {
            categoriesSection.put("books", discoveryService.getRecommendationsByCategory(
                    topCategories.get(0), user, MAX_RESULTS));
        }
        response.put("byCategory", categoriesSection);

        // Recent searches section
        List<String> recentSearches = discoveryService.getRecentSearches(user, 3);
        Map<String, Object> searchesSection = new HashMap<>();
        searchesSection.put("queries", recentSearches);
        if (!recentSearches.isEmpty()) {
            searchesSection.put("books", discoveryService.getRecommendationsByQuery(
                    recentSearches.get(0), user, MAX_RESULTS));
        }
        response.put("bySearch", searchesSection);

        return ResponseEntity.ok(response);
    }
}
