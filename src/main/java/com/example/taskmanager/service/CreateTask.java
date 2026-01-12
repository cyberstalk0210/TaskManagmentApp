package com.example.taskmanager.service;

import com.example.taskmanager.dto.TaskCreateDTO;
import com.example.taskmanager.dto.TaskResponseDTO;
import com.example.taskmanager.entity.Task;
import com.example.taskmanager.mapper.TaskMapper;
import com.example.taskmanager.repo.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class CreateTask {
    private final TaskRepository taskRepository;
    private final TaskMapper taskMapper;
    private final CurrentUserService currentUserService;

    public TaskResponseDTO create(TaskCreateDTO dto){
        Task task = taskMapper.toEntity(dto);
        task.setCreator(currentUserService.getCurrentUser());
        Task savedTask = taskRepository.save(task);
        log.info("Task saved");
        return taskMapper.toResponseDto(savedTask);
    }
}
