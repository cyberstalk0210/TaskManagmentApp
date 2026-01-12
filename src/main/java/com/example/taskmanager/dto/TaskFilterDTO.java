package com.example.taskmanager.dto;

import com.example.taskmanager.entity.enumration.Status;
import lombok.Data;

@Data
public class TaskFilterDTO {
    private PriorityDTO priority;
    private Status status;
    private Boolean overdue;
}
