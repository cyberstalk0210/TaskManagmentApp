package com.example.taskmanager.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;


@Data
public class UserDTO {

    @NotBlank(message = "Name field should not be empty or null")
    private String username;

    private String password;

    private String prePassword;
}
