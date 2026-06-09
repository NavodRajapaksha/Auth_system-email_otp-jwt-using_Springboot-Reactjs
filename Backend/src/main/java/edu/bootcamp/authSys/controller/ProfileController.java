package edu.bootcamp.authSys.controller;

import edu.bootcamp.authSys.dto.request.ProfileRequest;
import edu.bootcamp.authSys.dto.response.ProfileResponse;
import edu.bootcamp.authSys.service.EmailService;
import edu.bootcamp.authSys.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.CurrentSecurityContext;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;
    private final EmailService emailService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    private ProfileResponse register(@Valid @RequestBody ProfileRequest profileRequest){
        ProfileResponse profileResponse = profileService.createProfile(profileRequest);
        emailService.sendWelcomeEmail(profileResponse.getEmail(), profileResponse.getName());
        return profileResponse;
    }

    @GetMapping("/profile")
    public ProfileResponse getProfile (@CurrentSecurityContext(expression = "authentication?.name") String email) {
        return profileService.getProfile(email);
    }

}
