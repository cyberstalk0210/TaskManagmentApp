package com.example.taskmanager.service;

import com.example.taskmanager.dto.NotificationDTO;
import com.example.taskmanager.entity.Notification;
import com.example.taskmanager.repo.NotificationRepository;
import com.example.taskmanager.repo.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final TaskRepository taskRepository;
    private final NotificationRepository notificationRepository;
    private final CurrentUserService currentUserService;

    public List<NotificationDTO> getAllNotifications() {
        List<Notification> notifications = notificationRepository.findAllByUserId(currentUserService.getCurrentUser().getId());
        return notifications.stream()
                .map(this::mapToDTO)
                .toList();
    }

    private NotificationDTO mapToDTO(Notification notification) {
        NotificationDTO notificationDTO = new NotificationDTO();
        notificationDTO.setMessage(notification.getMessage());
        notificationDTO.setTaskId(notification.getTask().getId());
        return notificationDTO;
    }


}
