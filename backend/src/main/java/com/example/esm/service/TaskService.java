
package com.example.esm.service;

import com.example.esm.entity.Task;
import com.example.esm.repo.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;

    // Get all tasks
    @Transactional(readOnly = true)
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    // Get task by ID
    @Transactional(readOnly = true)
    public Task getTaskById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Task not found with ID: " + id)
                );
    }

    // Get tasks by project ID
    @Transactional(readOnly = true)
    public List<Task> getTasksByProject(Long projectId) {

        if (projectId == null) {
            throw new IllegalArgumentException(
                    "Project ID is required"
            );
        }

        return taskRepository.findByProjectId(projectId);
    }

    // Get tasks by sprint ID
    @Transactional(readOnly = true)
    public List<Task> getTasksBySprint(Long sprintId) {

        if (sprintId == null) {
            throw new IllegalArgumentException(
                    "Sprint ID is required"
            );
        }

        return taskRepository.findBySprintId(sprintId);
    }

    // Create task
    public Task createTask(Task task) {

        if (task.getProject() == null) {
            throw new IllegalArgumentException(
                    "Project is required"
            );
        }

        return taskRepository.save(task);
    }

    // Update task
    public Task updateTask(Long id, Task updatedTask) {

        Task existingTask = getTaskById(id);

        existingTask.setTitle(updatedTask.getTitle());
        existingTask.setDescription(updatedTask.getDescription());
        existingTask.setStatus(updatedTask.getStatus());
        existingTask.setPriority(updatedTask.getPriority());

        if (updatedTask.getProject() != null) {
            existingTask.setProject(updatedTask.getProject());
        }

        if (updatedTask.getSprint() != null) {
            existingTask.setSprint(updatedTask.getSprint());
        }

        if (updatedTask.getAssignee() != null) {
            existingTask.setAssignee(updatedTask.getAssignee());
        }

        return taskRepository.save(existingTask);
    }

    // Delete task
    public void deleteTask(Long id) {

        if (!taskRepository.existsById(id)) {
            throw new RuntimeException(
                    "Task not found with ID: " + id
            );
        }

        taskRepository.deleteById(id);
    }
}