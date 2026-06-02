package com.my_conquest.conquest_backend.service;

import com.my_conquest.conquest_backend.entity.User;
import com.my_conquest.conquest_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional
    public void getOrCreateUser(UUID keycloakId, User.UserBuilder builder) {
        if(!userRepository.existsByKeyCloakId(keycloakId)) {
            var user = builder.build();
            userRepository.save(user);
        }
    }

}
