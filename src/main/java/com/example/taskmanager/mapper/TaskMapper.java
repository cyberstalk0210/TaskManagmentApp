package com.example.taskmanager.mapper;


import com.example.taskmanager.dto.TaskCreateDTO;
import com.example.taskmanager.dto.TaskResponseDTO;
import com.example.taskmanager.dto.TaskUpdateDTO;
import com.example.taskmanager.entity.enumration.Priority;
import com.example.taskmanager.entity.enumration.Status;
import com.example.taskmanager.entity.Task;
import org.mapstruct.*;


@Mapper(componentModel = "spring", imports = {Status.class, Priority.class})
public interface TaskMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", expression = "java(Status.TO_DO)")
    @Mapping(target = "priority", expression = "java(Priority.MEDIUM)")
    @Mapping(target = "progress", constant = "0")
    Task toEntity(TaskCreateDTO dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateFromDto(TaskUpdateDTO dto, @MappingTarget Task task);

    @Mapping(target = "overdue", expression = "java(task.isOverdue())")
    TaskResponseDTO toResponseDto(Task task);
}

