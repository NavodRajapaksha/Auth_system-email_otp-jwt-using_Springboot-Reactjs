package edu.bootcamp.authSys.service.impl;

import edu.bootcamp.authSys.dto.request.ProfileRequest;
import edu.bootcamp.authSys.dto.response.ProfileResponse;
import edu.bootcamp.authSys.entity.UserEntity;
import edu.bootcamp.authSys.repositoy.UserRepositoy;
import edu.bootcamp.authSys.service.EmailService;
import edu.bootcamp.authSys.service.ProfileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@Service
@Slf4j
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {

    private final UserRepositoy userRepositoy;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

//    user register

    @Override
    public ProfileResponse createProfile(ProfileRequest profileRequest) {
        UserEntity newProfile = ConvertToUserEntity(profileRequest);
        if(!userRepositoy.existsByEmail(profileRequest.getEmail())){
            newProfile = userRepositoy.save(newProfile);
            return ConvertToUserResponse(newProfile);
        }

        throw new ResponseStatusException(HttpStatus.CONFLICT, "Email Already exist");
    }

    @Override
    public ProfileResponse getProfile(String email) {
        UserEntity existingUser = userRepositoy.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
        return ConvertToUserResponse(existingUser);

    }

    @Override
    public void sendResetOtp(String email) {
        UserEntity userEntity = userRepositoy.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        // generate 6 digit otp
        String otp = String.valueOf(ThreadLocalRandom.current().nextInt(100000, 1000000));

        // calculate ecpiry time (current time + 15 min in milisecond)
        long expiryTime = System.currentTimeMillis() + (15 * 60 * 1000);

        // update the profile / user
        userEntity.setResetOtp(otp);
        userEntity.setResetOtpExpireAt(expiryTime);

        // save into the db
        userRepositoy.save(userEntity);

        try{
            emailService.sendResetOtpEmail(userEntity.getEmail(), otp);
        } catch (Exception ex) {
            throw new RuntimeException("Unable to send email");
        }
    }

    @Override
    public void resetPassword(String email, String otp, String newPassword) {
        UserEntity userEntity = userRepositoy.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        if (userEntity.getResetOtp() == null || !userEntity.getResetOtp().equals(otp)) {
            throw new RuntimeException("Invaild OTP");
        }

        if (userEntity.getResetOtpExpireAt() < System.currentTimeMillis()) {
            throw new RuntimeException("OTP Expired");
        }

        userEntity.setPassword(passwordEncoder.encode(newPassword));
        userEntity.setResetOtp(null);
        userEntity.setResetOtpExpireAt(0L);

        userRepositoy.save(userEntity);
    }

    @Override
    public void sendOtp(String email) {
        UserEntity userEntity = userRepositoy.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not Found: " + email));

        if (userEntity.getIsAccountVerified() != null && userEntity.getIsAccountVerified()){
            return;
        }

        // generate 6 digit otp
        String otp = String.valueOf(ThreadLocalRandom.current().nextInt(100000, 1000000));

        // calculate ecpiry time (current time + 15 min in milisecond)
        long expiryTime = System.currentTimeMillis() + (15 * 60 * 1000);

        // update the user entity
        userEntity.setVerifyOtp(otp);
        userEntity.setVerifyOtpExpireAt(expiryTime);

        userRepositoy.save(userEntity);

        try {
            emailService.sendOtpEmail(userEntity.getEmail(), otp);
        } catch (Exception e) {
            throw new RuntimeException("Unable to send Email");
        }
    }

    @Override
    public void verifyOtp(String email, String otp) {
        UserEntity userEntity = userRepositoy.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        if (userEntity.getVerifyOtp() == null || !userEntity.getVerifyOtp().equals(otp)) {
            throw new RuntimeException("Invalid Otp");
        }

        if (userEntity.getVerifyOtpExpireAt() < System.currentTimeMillis()) {
            throw new RuntimeException("Otp Expired");
        }

        userEntity.setIsAccountVerified(true);
        userEntity.setVerifyOtp(null);
        userEntity.setVerifyOtpExpireAt(0L);

        userRepositoy.save(userEntity);
    }

    private ProfileResponse ConvertToUserResponse( UserEntity newProfile ) {
        return ProfileResponse.builder()
                .name(newProfile.getName())
                .email(newProfile.getEmail())
                .userId(newProfile.getUserId())
                .isAccountVerified(newProfile.getIsAccountVerified())
                .build();
    }

    private UserEntity ConvertToUserEntity(ProfileRequest profileRequest){
        return UserEntity.builder()
                .email(profileRequest.getEmail())
                .userId(UUID.randomUUID().toString())
                .name(profileRequest.getName())
                .password(passwordEncoder.encode(profileRequest.getPassword()))
                .isAccountVerified(false)
                .resetOtpExpireAt(0L)
                .verifyOtp(null)
                .verifyOtpExpireAt(0L)
                .resetOtp(null)
                .build();
    }
}
