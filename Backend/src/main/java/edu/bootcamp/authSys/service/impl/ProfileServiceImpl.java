package edu.bootcamp.authSys.service.impl;

import edu.bootcamp.authSys.dto.request.ProfileRequest;
import edu.bootcamp.authSys.dto.response.ProfileResponse;
import edu.bootcamp.authSys.entity.UserEntity;
import edu.bootcamp.authSys.repositoy.UserRepositoy;
import edu.bootcamp.authSys.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {

    private final UserRepositoy userRepositoy;
    private final PasswordEncoder passwordEncoder;

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
