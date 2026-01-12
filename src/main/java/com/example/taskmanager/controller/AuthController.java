package com.example.taskmanager.controller;

import com.example.taskmanager.dto.ApiResponse;
import com.example.taskmanager.dto.LoginDTO;
import com.example.taskmanager.dto.TokenDTO;
import com.example.taskmanager.dto.UserDTO;
import com.example.taskmanager.service.AuthService;
import com.example.taskmanager.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserDTO userDTO) {
        return userService.createUser(userDTO);
    }

    @PostMapping("/login")
    public ResponseEntity<TokenDTO> login(@RequestBody LoginDTO userDTO) {
        return authService.login(userDTO);
    }

    @GetMapping("/me")
    public ApiResponse<?> me() {
        return userService.me();
    }
}
