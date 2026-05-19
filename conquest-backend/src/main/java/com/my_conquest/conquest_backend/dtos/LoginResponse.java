package com.my_conquest.conquest_backend.dtos;

public record LoginResponse(
        String accessToken,
        int expirationInHours
) {
}
