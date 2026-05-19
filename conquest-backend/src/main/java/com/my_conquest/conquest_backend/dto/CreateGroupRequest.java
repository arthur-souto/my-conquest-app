package com.my_conquest.conquest_backend.dto;

import com.my_conquest.conquest_backend.entity.Group;
import jakarta.validation.constraints.NotBlank;

public record CreateGroupRequest(
        @NotBlank(message = "Name is required")
        String name,
        String description
) {
    public static Group toEntity(CreateGroupRequest req) {
        return Group.builder()
                .name(req.name)
                .description(req.description != null ? req.description : null)
                .build();
    }
}
