package com.example.minilibrary.mapper;

import com.example.minilibrary.dto.BookDto;
import com.example.minilibrary.dto.CreateBookRequest;
import com.example.minilibrary.model.Book;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public abstract class BookMapper {

    @Mapping(target = "authorName", source = "author")
    @Mapping(target = "readingGoalProgress", expression = "java(calculateProgress(book))")
    @Mapping(target = "categories", source = "categories")
    public abstract BookDto toDto(Book book);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "author", source = "authorName")
    @Mapping(target = "currentPage", ignore = true)
    @Mapping(target = "startDate", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "completed", ignore = true)
    @Mapping(target = "readingGoalType", ignore = true)
    @Mapping(target = "readingGoalPages", ignore = true)
    @Mapping(target = "readingSessions", ignore = true)
    @Mapping(target = "categories", source = "categories")
    public abstract Book toEntity(CreateBookRequest request);

    protected Integer calculateProgress(Book book) {
        if (book.getReadingGoalType() == null || book.getReadingGoalPages() == null) {
            return null;
        }

        java.time.LocalDate now = java.time.LocalDate.now();
        java.time.LocalDateTime startOfPeriod;

        if (com.example.minilibrary.model.ReadingGoalType.WEEKLY == book.getReadingGoalType()) {
            // Monday is 1. If Sunday(7), go back 6 days.
            java.time.LocalDate monday = now
                    .with(java.time.temporal.TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
            startOfPeriod = monday.atStartOfDay();
        } else {
            // Monthly
            startOfPeriod = now.withDayOfMonth(1).atStartOfDay();
        }

        // Convert to Instant for comparison if needed, but session uses Instant.
        // Let's assume system zone.
        java.time.ZoneId zone = java.time.ZoneId.systemDefault();
        java.time.Instant startInstant = startOfPeriod.atZone(zone).toInstant();

        if (book.getReadingSessions() == null)
            return 0;

        return book.getReadingSessions().stream()
                .filter(s -> s.getEndTime() != null && s.getEndTime().isAfter(startInstant))
                .mapToInt(s -> {
                    if (s.getPagesRead() != null)
                        return s.getPagesRead();
                    // Fallback
                    if (s.getEndPage() != null && s.getEndPage() > 0) {
                        // Very rough fallback for historical data if we can't look at prev session
                        // easily here.
                        // Maybe just return 0 to be safe or try to estimate?
                        // For now, return 0 to avoid massive spikes.
                        return 0;
                    }
                    return 0;
                })
                .sum();
    }
}
