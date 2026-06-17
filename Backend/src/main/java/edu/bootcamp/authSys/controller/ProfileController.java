package edu.bootcamp.authSys.controller;

import edu.bootcamp.authSys.dto.request.ProfileRequest;
import edu.bootcamp.authSys.dto.response.ProfileResponse;
import edu.bootcamp.authSys.service.EmailService;
import edu.bootcamp.authSys.service.ProfileService;
import jakarta.mail.MessagingException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.CurrentSecurityContext;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;
    private final EmailService emailService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public ProfileResponse register(@Valid @RequestBody ProfileRequest profileRequest) {
        ProfileResponse profileResponse = profileService.createProfile(profileRequest);
        try {
            emailService.sendWelcomeEmail(profileResponse.getEmail(), profileResponse.getName());
        } catch (MessagingException e) {
            log.error("Failed to send welcome email to {}: {}", profileResponse.getEmail(), e.getMessage());
        }
        return profileResponse;
    }

    @GetMapping("/profile")
    public ProfileResponse getProfile(@CurrentSecurityContext(expression = "authentication?.name") String email) {
        return profileService.getProfile(email);
    }

}
