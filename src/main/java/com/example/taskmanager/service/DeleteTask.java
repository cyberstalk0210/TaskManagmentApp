package com.example.taskmanager.service;

import com.example.taskmanager.handler.ForbiddenException;
import com.example.taskmanager.handler.ResourceNotFoundException;
import com.example.taskmanager.repo.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DeleteTask {

    private final TaskRepository taskRepository;
    private final CurrentUserService currentUserService;

    public void delete(Long id) {
        if (!taskRepository.existsById(id)) {
            if (taskRepository.findById(id).get().getCreator().equals(currentUserService.getCurrentUser())) {
                throw new ForbiddenException("You are not allowed to delete this task");
            }
            throw new ResourceNotFoundException("Task not found");
        }
        taskRepository.deleteById(id);
    }
}
