package com.example.taskmanager.dto;

public record ApiResponse<T>(
        boolean success,
        String message,
        T data
) {
    public static ApiResponse<?> success(UserDTO dto) {
        return new ApiResponse<>(true, "Operation successful", dto);
    }

    public ApiResponse(T data, boolean success) {
        this(success, "", data);
    }

    public ApiResponse(boolean success) {
        this(success, "", null);
    }

    public ApiResponse(T data) {
        this(false, "", data);
    }
}
