package com.my_conquest.conquest_backend.dto.request;

public record UpdateUserCredentials(
        String username,
        String name,
        String email
) {
}
