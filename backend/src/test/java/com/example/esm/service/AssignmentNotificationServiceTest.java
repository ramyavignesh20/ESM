package com.example.esm.service;

import com.example.esm.entity.Notification;
import com.example.esm.entity.Project;
import com.example.esm.entity.Task;
import com.example.esm.entity.User;
import com.example.esm.repo.NotificationRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.MailSendException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AssignmentNotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private AssignmentNotificationService service;

    @Test
    void savesNotificationAndMarksEmailDelivered() throws Exception {
        when(notificationRepository.save(any(Notification.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        service.notifyTaskAssignment(task());

        ArgumentCaptor<Notification> notificationCaptor =
                ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository, org.mockito.Mockito.times(2))
                .save(notificationCaptor.capture());
        verify(emailService).sendTaskAssignmentEmail(
                "member@example.com",
                "Team Member",
                42L,
                "Prepare release",
                "Platform",
                "Not assigned",
                "HIGH",
                "Not set"
        );

        Notification saved = notificationCaptor.getValue();
        assertEquals(7L, saved.getUserId());
        assertEquals(42L, saved.getTaskId());
        assertEquals("TASK_ASSIGNED", saved.getType());
        assertTrue(saved.isEmailSent());
    }

    @Test
    void keepsInAppNotificationWhenEmailDeliveryFails() throws Exception {
        doThrow(new MailSendException("SMTP unavailable"))
                .when(emailService)
                .sendTaskAssignmentEmail(
                        anyString(),
                        anyString(),
                        anyLong(),
                        anyString(),
                        anyString(),
                        anyString(),
                        anyString(),
                        anyString()
                );

        service.notifyTaskAssignment(task());

        ArgumentCaptor<Notification> notificationCaptor =
                ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(notificationCaptor.capture());
        assertFalse(notificationCaptor.getValue().isEmailSent());
    }

    private Task task() {
        User assignee = User.builder()
                .id(7L)
                .username("member")
                .fullName("Team Member")
                .email("member@example.com")
                .build();
        Project project = Project.builder()
                .name("Platform")
                .build();

        return Task.builder()
                .id(42L)
                .title("Prepare release")
                .priority("HIGH")
                .assignee(assignee)
                .project(project)
                .build();
    }
}
