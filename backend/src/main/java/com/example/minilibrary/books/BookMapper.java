package com.example.minilibrary.books;

import com.example.minilibrary.books.dto.BookDto;
import com.example.minilibrary.auth.User;
import com.example.minilibrary.books.dto.CreateBookRequest;
import com.example.minilibrary.auth.User;
import com.example.minilibrary.books.Book;
import com.example.minilibrary.auth.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public abstract class BookMapper {

    @Autowired
    protected ReadingGoalProgressCalculator calculator;

    @Mapping(target = "authorName", source = "author")
    @Mapping(target = "readingGoalProgress", expression = "java(calculator.calculateProgress(book))")
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

}
