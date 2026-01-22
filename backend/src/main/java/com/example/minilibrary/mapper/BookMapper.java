package com.example.minilibrary.mapper;

import com.example.minilibrary.dto.BookDto;
import com.example.minilibrary.dto.CreateBookRequest;
import com.example.minilibrary.model.Book;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface BookMapper {

    @Mapping(target = "authorName", source = "author")
    BookDto toDto(Book book);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "author", source = "authorName")
    @Mapping(target = "currentPage", ignore = true)
    @Mapping(target = "startDate", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "completed", ignore = true)
    @Mapping(target = "readingSessions", ignore = true)
    Book toEntity(CreateBookRequest request);
}
