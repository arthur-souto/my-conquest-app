package com.my_conquest.conquest_backend.dto;

import com.my_conquest.conquest_backend.enums.AchievementCategory;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record UpdateAchievementRequest(
        @Size(min = 3, max = 255, message = "Title must be between 3 and 255 characters")
        String title,

        @Size(max = 5000, message = "Description must be at most 5000 characters")
        String description,

        AchievementCategory category,

        @Min(value = 1, message = "Difficulty level must be at least 1")
        @Max(value = 5, message = "Difficulty level must be at most 5")
        Short difficultyLevel,

        @PastOrPresent(message = "Achieved at must be in the past or present")
        LocalDate achievedAt
) {
}
