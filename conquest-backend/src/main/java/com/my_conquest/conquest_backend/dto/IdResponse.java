package com.my_conquest.conquest_backend.dto;

import java.util.UUID;

public record IdResponse(UUID id) {

    public static IdResponse toResponse(UUID id) {
        return new IdResponse(id);
    }
}
