package com.example.taskmanager.repo;

import com.example.taskmanager.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findAllByUserId(Long userId);

    Long countByUserIdAndReadFalse(Long userId);

    boolean existsByTaskId(Long taskId);
}
