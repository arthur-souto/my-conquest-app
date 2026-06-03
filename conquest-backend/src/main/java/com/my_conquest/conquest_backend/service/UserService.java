package com.my_conquest.conquest_backend.service;

import com.my_conquest.conquest_backend.dto.response.IdResponse;
import com.my_conquest.conquest_backend.dto.response.UserResponse;
import com.my_conquest.conquest_backend.entity.User;
import com.my_conquest.conquest_backend.exception.ResourceNotFoundException;
import com.my_conquest.conquest_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RestClient restClient;

    @Transactional
    public void getOrCreateUser(UUID keycloakId, User.UserBuilder builder) {
        if(!userRepository.existsByKeyCloakId(keycloakId)) {
            var user = builder.build();
            userRepository.save(user);
        }
    }

    @Transactional(readOnly = true)
    public UserResponse getUser(UUID keycloakId) {
        var user = userRepository.findByKeyCloakId(keycloakId).orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return UserResponse.toResponse(user);
    }

}
