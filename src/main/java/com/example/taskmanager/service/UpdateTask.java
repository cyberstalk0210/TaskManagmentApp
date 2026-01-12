package com.example.taskmanager.service;

import com.example.taskmanager.dto.TaskResponseDTO;
import com.example.taskmanager.dto.TaskUpdateDTO;
import com.example.taskmanager.entity.Task;
import com.example.taskmanager.mapper.TaskMapper;
import com.example.taskmanager.repo.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UpdateTask {
    private final TaskRepository taskRepository;
    private final TaskMapper taskMapper;

    public TaskResponseDTO update(Long id, TaskUpdateDTO dto){
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        taskMapper.updateFromDto(dto, task);
        Task updatedTask = taskRepository.save(task);

        return taskMapper.toResponseDto(updatedTask);
    }
}
