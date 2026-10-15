package com.example.esm.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.util.HtmlUtils;
import org.springframework.beans.factory.annotation.Value;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:}")
    private String fromAddress;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendTaskAssignmentEmail(
            String recipientEmail,
            String assigneeName,
            Long taskId,
            String taskTitle,
            String projectName,
            String sprintName,
            String priority,
            String dueDate
    ) throws MessagingException {

        MimeMessage message = mailSender.createMimeMessage();

        MimeMessageHelper helper =
                new MimeMessageHelper(message, true, "UTF-8");

        if (fromAddress != null && !fromAddress.isBlank()) {
            helper.setFrom(fromAddress);
        }

        helper.setTo(recipientEmail);

        helper.setSubject(
                "New Task Assigned - " + taskTitle
        );

        String html = """
                <html>
                <body style="font-family: Arial, sans-serif;">

                    <h2>New Task Assigned</h2>

                    <p>Hello <b>%s</b>,</p>

                    <p>
                        A new task has been assigned to you
                        in the Enterprise Scrum Management application.
                    </p>

                    <table border="1"
                           cellpadding="10"
                           cellspacing="0"
                           style="border-collapse: collapse;">

                        <tr>
                            <td><b>Task ID</b></td>
                            <td>%s</td>
                        </tr>

                        <tr>
                            <td><b>Task Title</b></td>
                            <td>%s</td>
                        </tr>

                        <tr>
                            <td><b>Project</b></td>
                            <td>%s</td>
                        </tr>

                        <tr>
                            <td><b>Sprint</b></td>
                            <td>%s</td>
                        </tr>

                        <tr>
                            <td><b>Priority</b></td>
                            <td>%s</td>
                        </tr>

                        <tr>
                            <td><b>Due Date</b></td>
                            <td>%s</td>
                        </tr>

                    </table>

                    <p>
                        Please login to the application to view
                        and work on this task.
                    </p>

                    <p>
                        Regards,<br>
                        <b>Enterprise Scrum Management Team</b>
                    </p>

                </body>
                </html>
                """.formatted(
                        HtmlUtils.htmlEscape(assigneeName),
                        taskId,
                        HtmlUtils.htmlEscape(taskTitle),
                        HtmlUtils.htmlEscape(projectName),
                        HtmlUtils.htmlEscape(sprintName),
                        HtmlUtils.htmlEscape(priority),
                        HtmlUtils.htmlEscape(dueDate)
                );

        helper.setText(html, true);

        mailSender.send(message);
    }
}