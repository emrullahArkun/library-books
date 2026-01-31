package com.example.minilibrary.controller;

import com.example.minilibrary.model.User;
import com.example.minilibrary.security.CurrentUser;
import com.example.minilibrary.service.DiscoveryService;
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
    public ResponseEntity<com.example.minilibrary.dto.DiscoveryResponse.AuthorSection> getAuthorRecommendations(
            @CurrentUser User user) {
        List<String> topAuthors = discoveryService.getTopAuthors(user, 3);
        List<com.example.minilibrary.dto.RecommendedBookDto> books = topAuthors.isEmpty()
                ? java.util.Collections.emptyList()
                : discoveryService.getRecommendationsByAuthor(topAuthors.get(0), user, MAX_RESULTS);

        return ResponseEntity.ok(new com.example.minilibrary.dto.DiscoveryResponse.AuthorSection(topAuthors, books));
    }

    /**
     * Get recommendations based on top categories/genres in user's collection
     */
    @GetMapping("/categories")
    public ResponseEntity<com.example.minilibrary.dto.DiscoveryResponse.CategorySection> getCategoryRecommendations(
            @CurrentUser User user) {
        List<String> topCategories = discoveryService.getTopCategories(user, 3);
        List<com.example.minilibrary.dto.RecommendedBookDto> books = topCategories.isEmpty()
                ? java.util.Collections.emptyList()
                : discoveryService.getRecommendationsByCategory(topCategories.get(0), user, MAX_RESULTS);

        return ResponseEntity
                .ok(new com.example.minilibrary.dto.DiscoveryResponse.CategorySection(topCategories, books));
    }

    /**
     * Get recommendations based on recent search queries
     */
    @GetMapping("/recent-searches")
    public ResponseEntity<com.example.minilibrary.dto.DiscoveryResponse.SearchSection> getRecentSearchRecommendations(
            @CurrentUser User user) {
        List<String> recentSearches = discoveryService.getRecentSearches(user, DEFAULT_LIMIT);
        List<com.example.minilibrary.dto.RecommendedBookDto> books = recentSearches.isEmpty()
                ? java.util.Collections.emptyList()
                : discoveryService.getRecommendationsByQuery(recentSearches.get(0), user, MAX_RESULTS);

        return ResponseEntity
                .ok(new com.example.minilibrary.dto.DiscoveryResponse.SearchSection(recentSearches, books));
    }

    /**
     * Get all discovery data in one call (for Discovery page)
     */
    @GetMapping
    public ResponseEntity<com.example.minilibrary.dto.DiscoveryResponse> getDiscoveryData(@CurrentUser User user) {
        // Authors section
        List<String> topAuthors = discoveryService.getTopAuthors(user, 3);
        List<com.example.minilibrary.dto.RecommendedBookDto> authorBooks = topAuthors.isEmpty()
                ? java.util.Collections.emptyList()
                : discoveryService.getRecommendationsByAuthor(topAuthors.get(0), user, MAX_RESULTS);
        var authorSection = new com.example.minilibrary.dto.DiscoveryResponse.AuthorSection(topAuthors, authorBooks);

        // Categories section
        List<String> topCategories = discoveryService.getTopCategories(user, 3);
        List<com.example.minilibrary.dto.RecommendedBookDto> categoryBooks = topCategories.isEmpty()
                ? java.util.Collections.emptyList()
                : discoveryService.getRecommendationsByCategory(topCategories.get(0), user, MAX_RESULTS);
        var categorySection = new com.example.minilibrary.dto.DiscoveryResponse.CategorySection(topCategories,
                categoryBooks);

        // Recent searches section
        List<String> recentSearches = discoveryService.getRecentSearches(user, 3);
        List<com.example.minilibrary.dto.RecommendedBookDto> searchBooks = recentSearches.isEmpty()
                ? java.util.Collections.emptyList()
                : discoveryService.getRecommendationsByQuery(recentSearches.get(0), user, MAX_RESULTS);
        var searchSection = new com.example.minilibrary.dto.DiscoveryResponse.SearchSection(recentSearches,
                searchBooks);

        return ResponseEntity
                .ok(new com.example.minilibrary.dto.DiscoveryResponse(authorSection, categorySection, searchSection));
    }
}
