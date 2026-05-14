package edu.bootcamp.authSys.service.impl;

import edu.bootcamp.authSys.entity.UserEntity;
import edu.bootcamp.authSys.repositoy.UserRepositoy;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class AppUserDetailsService implements UserDetailsService {

    private final UserRepositoy userRepositoy;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        UserEntity existngUser = userRepositoy.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Email not found for the email: " + email));
        return new User(existngUser.getEmail(), existngUser.getPassword(), new ArrayList<>());
    }
}
