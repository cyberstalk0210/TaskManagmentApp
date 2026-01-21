package com.example.taskmanager.controller;

import com.example.taskmanager.dto.TaskCreateDTO;
import com.example.taskmanager.dto.TaskResponseDTO;
import com.example.taskmanager.dto.TaskUpdateDTO;
import com.example.taskmanager.service.CreateTask;
import com.example.taskmanager.service.DeleteTask;
import com.example.taskmanager.service.GetTaskList;
import com.example.taskmanager.service.UpdateTask;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class TaskController {

    private final CreateTask createTask;
    private final UpdateTask updateTask;
    private final DeleteTask deleteTask;
    private final GetTaskList getTaskList;

    @PostMapping
    public TaskResponseDTO create(@RequestBody TaskCreateDTO dto) {
        log.info("Task Created");
        return createTask.create(dto);
    }

    @PutMapping("{id}")
    public TaskResponseDTO update(@PathVariable(name = "id") Long id, @RequestBody TaskUpdateDTO dto) {
        return updateTask.update(id,dto);
    }

    @GetMapping
    public List<TaskResponseDTO> getAll()
    {
        log.info("Get All Task");
        return getTaskList.getAll();
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        deleteTask.delete(id);
    }
}
