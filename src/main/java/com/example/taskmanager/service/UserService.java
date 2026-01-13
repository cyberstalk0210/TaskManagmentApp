package com.example.taskmanager.service;

import com.example.taskmanager.dto.ApiResponse;
import com.example.taskmanager.dto.UserDTO;
import com.example.taskmanager.entity.User;
import com.example.taskmanager.entity.enumration.Roles;
import com.example.taskmanager.mapper.UserMapper;
import com.example.taskmanager.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;


@RequiredArgsConstructor
@Service
public class UserService {

   private final UserRepository userRepository;
   private final PasswordEncoder passwordEncoder;
   private final UserMapper userMapper;

    public ResponseEntity<ApiResponse<UserDTO>> createUser(UserDTO userDTO) {
        if (userRepository.existsUserByUsername(userDTO.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }

        String encodedPassword = passwordEncoder.encode(userDTO.getPassword());

        User user = userMapper.toEntity(userDTO);
        user.setPassword(encodedPassword);
        user.setUsername(userDTO.getUsername());
        user.setRoles(Set.of(Roles.ROLE_USER));

        userRepository.save(user);

        UserDTO savedUserDTO = userMapper.toDto(user);

        ApiResponse<UserDTO> response = new ApiResponse<>(
                true,
                "User successfully registered",
                savedUserDTO
        );

        return ResponseEntity.ok(response);
    }

    public ResponseEntity<User> updateUser(Long id, User userDTO) {
        User user = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setUsername(userDTO.getUsername());
        user.setRoles(userDTO.getRoles());

        userRepository.saveAndFlush(user);
        return ResponseEntity.ok(user);
    }

    public ResponseEntity<String> deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.badRequest().body("User not found");
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok("Successfully deleted");
    }


    public ResponseEntity<List<User>> getUsersList() {
        return ResponseEntity.ok(userRepository.findAll());
    }


    public UserDTO getUsers(UserDTO userDTO) {
        return userRepository.findByUsername(userDTO.getUsername()).map(user -> userMapper.toDto(user)).orElse(null);
    }

    public ApiResponse<?> me() {

        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        return ApiResponse.success(userMapper.toDto(user));

    }

    public ResponseEntity<User> getUserByID(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return  ResponseEntity.ok(user);
    }
}

