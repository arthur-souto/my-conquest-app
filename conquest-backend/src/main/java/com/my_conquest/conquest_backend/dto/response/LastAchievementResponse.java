package com.my_conquest.conquest_backend.dto.response;

import com.my_conquest.conquest_backend.enums.AchievementCategory;

import java.time.LocalDate;
import java.util.UUID;

public record LastAchievementResponse(
        UUID id,
        String title,
        AchievementCategory category,
        LocalDate achievedAt
) {

}
