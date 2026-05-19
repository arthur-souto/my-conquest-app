package com.my_conquest.conquest_backend.dto;

public record LoginResponse(
        String accessToken,
        int expirationInHours
) {
}
