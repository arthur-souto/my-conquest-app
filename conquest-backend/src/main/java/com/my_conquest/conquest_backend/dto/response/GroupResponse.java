package com.my_conquest.conquest_backend.dto.response;

import java.time.OffsetDateTime;
import java.util.UUID;

public record GroupResponse(
        UUID id,
        String name,
        String description,
        OffsetDateTime createdAt,
        long achievementsCount
) {

    public static GroupResponse toResponse(GroupSummary group) {
        return new GroupResponse(
                group.getId(),
                group.getName(),
                group.getDescription(),
                group.getCreatedAt(),
                group.getAchievementsCount()
        );
    }
}
