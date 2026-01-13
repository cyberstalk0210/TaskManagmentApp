package com.example.taskmanager.mapper;

import com.example.taskmanager.dto.UserDTO;
import com.example.taskmanager.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {

    User toEntity(UserDTO userDTO);

    UserDTO toDto(User user);

    List<UserDTO> toDto(List<User> users);

    @Mapping(target = "id", ignore = true)
    void update(@MappingTarget User user, UserDTO userDTO);
}
