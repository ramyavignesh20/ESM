package com.example.esm.service;

import com.example.esm.entity.Notification;
import com.example.esm.entity.Task;
import com.example.esm.entity.User;
import com.example.esm.repo.NotificationRepository;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.MailException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AssignmentNotificationService {

    private static final Logger logger =
            LoggerFactory.getLogger(AssignmentNotificationService.class);

    private final NotificationRepository notificationRepository;
    private final EmailService emailService;

    @Transactional
    public void notifyTaskAssignment(Task task) {
        User assignee = task.getAssignee();
        if (assignee == null) {
            return;
        }

        String taskTitle = task.getTitle();
        String message = "Task \"" + taskTitle + "\" has been assigned to you.";
        Notification notification = notificationRepository.save(
                new Notification(assignee.getId(), message, "TASK_ASSIGNED", task.getId())
        );

        try {
            emailService.sendTaskAssignmentEmail(
                    assignee.getEmail(),
                    assignee.getFullName() == null
                            ? assignee.getUsername()
                            : assignee.getFullName(),
                    task.getId(),
                    taskTitle,
                    task.getProject().getName(),
                    task.getSprint() == null ? "Not assigned" : task.getSprint().getName(),
                    task.getPriority(),
                    task.getDueDate() == null ? "Not set" : task.getDueDate().toString()
            );
            notification.setEmailSent(true);
            notificationRepository.save(notification);
        } catch (MessagingException | MailException exception) {
            logger.error(
                    "Could not send task assignment email for task {} to user {}",
                    task.getId(),
                    assignee.getId(),
                    exception
            );
        }
    }
}
