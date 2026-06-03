package com.my_conquest.conquest_backend.dto.response;

import com.my_conquest.conquest_backend.entity.User;

public record UserResponse(
        String name,
        String email,
        String profileImage
) {
    public static UserResponse toResponse(User user) {
        return new UserResponse(
                user.getName(),
                user.getEmail(),
                user.getProfileImage()
        );
    }
}
