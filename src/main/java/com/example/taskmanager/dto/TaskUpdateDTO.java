package com.example.taskmanager.dto;

import com.example.taskmanager.entity.Priority;
import com.example.taskmanager.entity.Status;
import lombok.Data;

@Data
public class TaskUpdateDTO {
    private Long id;
    private String title;
    private String description;
    private Priority priority;
    private Status status;
    private int progress;
}
