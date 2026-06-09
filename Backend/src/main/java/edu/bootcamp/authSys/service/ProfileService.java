package edu.bootcamp.authSys.service;

import edu.bootcamp.authSys.dto.request.ProfileRequest;
import edu.bootcamp.authSys.dto.response.ProfileResponse;

public interface ProfileService {

    ProfileResponse createProfile(ProfileRequest profileRequest);

    ProfileResponse getProfile(String email);

    void sendResetOtp(String email);

    void resetPassword(String email, String otp, String newPassword);

    void sendOtp(String email);

    void verifyOtp(String email, String otp);

}
