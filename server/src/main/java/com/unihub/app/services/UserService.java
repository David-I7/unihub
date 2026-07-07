package com.unihub.app.services;

import com.unihub.app.entities.User;
import com.unihub.app.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    public User register(User user){
        Optional<User> existingUser = userRepository.findByUsernameOrEmail(user.getUsername(),user.getEmail());

        if(existingUser.isPresent()){
            boolean sameEmail = user.getEmail().equals(existingUser.get().getEmail());
            boolean sameUsername = user.getUsername().equals(existingUser.get().getUsername());
            String message = sameUsername && sameEmail ? "Username and email are already taken" : sameUsername ? "Username is taken" : "Email is taken";
            throw new ResponseStatusException(HttpStatus.CONFLICT,message);
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        return userRepository.save(user);
    }


    public User login(User user) {
        Optional<User> existingUser = userRepository.findByUsernameOrEmail(user.getUsername(),user.getEmail());

        if(existingUser.isEmpty()){
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,"User not found");
        }

        if(!passwordEncoder.matches(user.getPassword(),existingUser.get().getPassword())){
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Incorrect password");
        }

        return existingUser.get();
    }
}
