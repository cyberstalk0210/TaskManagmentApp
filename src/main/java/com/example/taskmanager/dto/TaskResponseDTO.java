package com.example.taskmanager.dto;

import com.example.taskmanager.entity.Priority;
import com.example.taskmanager.entity.Status;
import lombok.Data;

import java.time.LocalDate;

@Data
public class TaskResponseDTO {
    private Long id;
    private String title;
    private String description;
    private LocalDate deadline;
    private Priority priority;
    private Status status;
    private int progress;
    private boolean overdue;

}
