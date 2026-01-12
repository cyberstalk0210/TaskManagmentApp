package com.example.taskmanager.service;

import com.example.taskmanager.dto.TaskResponseDTO;
import com.example.taskmanager.mapper.TaskMapper;
import com.example.taskmanager.repo.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class GetTaskList {

    private final TaskRepository taskRepository;
    private final TaskMapper taskMapper;

    public List<TaskResponseDTO> getAll() {
        log.info("Task pulled");
        return taskRepository.findAll()
                .stream()
                .map(taskMapper::toResponseDto)
                .toList();
    }
}
