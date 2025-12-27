package com.example.minilibrary.mapper;

import com.example.minilibrary.dto.AuthorDto;
import com.example.minilibrary.model.Author;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AuthorMapper {
    AuthorDto toDto(Author author);

    @org.mapstruct.Mapping(target = "books", ignore = true)
    Author toEntity(AuthorDto authorDto);
}
