package com.my_conquest.conquest_backend.dto;

import com.my_conquest.conquest_backend.entity.Achievement;
import com.my_conquest.conquest_backend.enums.AchievementCategory;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

public record CreateAchievementRequest(
        @NotBlank(message = "Title is required")
        String title,
        String description,
        @NotNull(message = "Category is required")
        AchievementCategory category,
        @Min(value = 1, message = "Difficulty level must be at least 1")
        @Max(value = 5, message = "Difficulty level must be at most 5")
        @NotNull(message = "Difficulty is required")
        Short difficultyLevel,
        @NotNull(message = "AchievedAt is required")
        LocalDate achievedAt
) {
    public static Achievement toEntity(CreateAchievementRequest req) {
        return Achievement.builder()
                .title(req.title)
                .description(req.description != null ? req.description : null)
                .category(req.category)
                .difficultyLevel(req.difficultyLevel)
                .achievedAt(req.achievedAt)
                .build();
    }

}
