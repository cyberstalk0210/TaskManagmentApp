package com.example.taskmanager.dto;

import com.example.taskmanager.entity.Priority;
import lombok.Data;
import java.time.LocalDate;

@Data
public class TaskCreateDTO {
    private String title;
    private String description;
    private LocalDate deadline;
    private Priority priority;
}
