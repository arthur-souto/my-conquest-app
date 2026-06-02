package com.my_conquest.conquest_backend.dto.response;

public record LoginResponse(
        String accessToken,
        int expirationInHours
) {
}
