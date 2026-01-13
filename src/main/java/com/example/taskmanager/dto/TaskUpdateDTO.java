package com.example.taskmanager.dto;

import com.example.taskmanager.entity.User;
import com.example.taskmanager.entity.enumration.Priority;
import com.example.taskmanager.entity.enumration.Status;
import lombok.Data;

@Data
public class TaskUpdateDTO {
    private Long id;
    private String title;
    private String description;
    private Priority priority;
    private Status status;
    private int progress;
    private User currentUser;
}
