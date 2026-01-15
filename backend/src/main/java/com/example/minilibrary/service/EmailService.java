package com.example.minilibrary.service;

import com.example.minilibrary.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @org.springframework.beans.factory.annotation.Value("${app.base-url}")
    private String baseUrl;

    public void sendVerificationEmail(User user) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("noreply@library.local");
        message.setTo(user.getEmail());
        message.setSubject("Library Email Verification");
        message.setText("Click here to verify your account:\n" + baseUrl + "/verify?token="
                + user.getVerificationToken());

        mailSender.send(message);
        System.out.println(">>> EMAIL SENT TO " + user.getEmail() + " (Check MailHog at localhost:8025)");
    }
}
