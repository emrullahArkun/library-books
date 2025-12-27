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
    BookDto toDto(Book book);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "author", ignore = true) // Author is handled manually in service/controller
    Book toEntity(CreateBookRequest request);
}
