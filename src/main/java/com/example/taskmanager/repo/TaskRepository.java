package com.example.taskmanager.repo;

import com.example.taskmanager.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;

 public interface TaskRepository extends JpaRepository<Task, Long> {
}