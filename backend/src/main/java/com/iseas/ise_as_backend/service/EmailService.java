package com.iseas.ise_as_backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendStatusUpdateEmail(String to, String studentName, String status) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Application Status Update - " + studentName);
        
        String content = String.format(
            "Dear Parent,\n\n" +
            "This is an update regarding the application for %s.\n" +
            "The current status of the application has been updated to: %s.\n\n" +
            "You can log in to the admissions portal to see more details.\n\n" +
            "Best regards,\n" +
            "Admissions Team",
            studentName, status
        );
        
        message.setText(content);
        mailSender.send(message);
    }
}
