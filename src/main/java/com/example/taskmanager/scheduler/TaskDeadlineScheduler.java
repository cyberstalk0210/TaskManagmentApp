package com.example.taskmanager.scheduler;

import com.example.taskmanager.entity.Notification;
import com.example.taskmanager.entity.Task;
import com.example.taskmanager.repo.NotificationRepository;
import com.example.taskmanager.repo.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class TaskDeadlineScheduler {

    private final TaskRepository taskRepository;
    private final NotificationRepository notificationRepository;

    @Scheduled(fixedRate = 5000)
    public void checkDeadlines() {

        log.info("Checking deadlines");
        LocalDate now = LocalDate.now();

        List<Task> expiredTasks =
                taskRepository.findExpiredTasks(now);

        for (Task task : expiredTasks) {

            boolean alreadySent =
                    notificationRepository.existsByTaskId(task.getId());

            if (alreadySent) {
                continue;
            }

            Notification notification = new Notification();
            notification.setUser(task.getCreator());
            notification.setTask(task);
            notification.setMessage(
                    "Task \"" + task.getTitle() + "\" deadline tugadi"
            );

            notificationRepository.save(notification);

            log.info("⏰ Deadline expired notification sent: {}", task.getTitle());
        }

    }
}