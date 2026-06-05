package com.my_conquest.conquest_backend.service;

import com.my_conquest.conquest_backend.dto.request.UpdateUserCredentials;
import com.my_conquest.conquest_backend.dto.request.UpdateUserRequest;
import com.my_conquest.conquest_backend.dto.response.IdResponse;
import com.my_conquest.conquest_backend.dto.response.UserResponse;
import com.my_conquest.conquest_backend.entity.User;
import com.my_conquest.conquest_backend.exception.ResourceNotFoundException;
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

    @Transactional(readOnly = true)
    public UserResponse getUser(UUID keycloakId) {
        var user = userRepository.findByKeyCloakId(keycloakId).orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return UserResponse.toResponse(user);
    }

    @Transactional
    public IdResponse updateCredentials(UUID keycloakId, UpdateUserCredentials req) {
        var user = userRepository.findByKeyCloakId(keycloakId).orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if(!req.email().isBlank()) {
            user.setEmail(req.email());
        }
        if(!req.username().isBlank()) {
            user.setUsername(req.username());
        }
        if(!req.name().isBlank()) {
            user.setName(req.name());
        }

        return IdResponse.toResponse(
                userRepository.save(user).getId()
        );
    }

    @Transactional
    public IdResponse updateUser(UUID keycloakId, UpdateUserRequest req) {
        var user = userRepository.findByKeyCloakId(keycloakId).orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if(req.profileImage() != null) {
            user.setProfileImage(req.profileImage());
        }

        return IdResponse.toResponse(
                userRepository.save(user).getId()
        );
    }
}
