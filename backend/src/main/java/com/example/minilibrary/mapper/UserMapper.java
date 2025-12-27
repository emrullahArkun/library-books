package com.example.minilibrary.mapper;

import com.example.minilibrary.dto.UserDto;
import com.example.minilibrary.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = { BookMapper.class, AuthorMapper.class })
public interface UserMapper {

    @Mapping(target = "password", ignore = true) // Don't return password in DTO
    @Mapping(target = "favoriteBooks", source = "favoriteBooks")
    @Mapping(target = "favoriteAuthors", source = "favoriteAuthors")
    UserDto toDto(User user);

    @Mapping(target = "favoriteBooks", ignore = true)
    @Mapping(target = "favoriteAuthors", ignore = true)
    @Mapping(target = "role", ignore = true)
    User toEntity(UserDto userDto);
}
