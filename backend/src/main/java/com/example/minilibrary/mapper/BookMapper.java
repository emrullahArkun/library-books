package com.example.minilibrary.mapper;

import com.example.minilibrary.dto.BookDto;
import com.example.minilibrary.dto.CreateBookRequest;
import com.example.minilibrary.model.Book;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface BookMapper {

    @Mapping(target = "authorId", source = "author.id")
    @Mapping(target = "authorName", source = "author.name")
    @Mapping(target = "startDate", source = "startDate")
    BookDto toDto(Book book);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "author", ignore = true) // Author is handled manually in service/controller
    @Mapping(target = "currentPage", ignore = true)
    @Mapping(target = "startDate", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "completed", ignore = true)
    @Mapping(target = "readingSessions", ignore = true)
    Book toEntity(CreateBookRequest request);
}
