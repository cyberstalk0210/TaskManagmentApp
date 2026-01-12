package com.example.taskmanager.service;

import com.example.taskmanager.handler.ResourceNotFoundException;
import com.example.taskmanager.repo.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DeleteTask {

    private final TaskRepository taskRepository;

    public void delete(Long id) {
        if (!taskRepository.existsById(id)) {
            throw new ResourceNotFoundException("Task not found");
        }
        taskRepository.deleteById(id);
    }
}
