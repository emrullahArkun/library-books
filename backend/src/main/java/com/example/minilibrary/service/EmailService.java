package com.example.minilibrary.service;

import com.example.minilibrary.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@RequiredArgsConstructor
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

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
        mailSender.send(message);
        log.info(">>> EMAIL SENT TO {} (Check MailHog at localhost:8025)", user.getEmail());
    }
}
