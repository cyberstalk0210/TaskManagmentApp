package com.example.taskmanager.repo;

import com.example.taskmanager.entity.Task;
import com.example.taskmanager.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findAllByCreator(User author);

    @Query("""
            SELECT t FROM Task t
            WHERE t.deadline <= :now
            AND t.status <> 'DONE'
            """)
    List<Task> findExpiredTasks(LocalDate now);
}