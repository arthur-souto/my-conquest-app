package com.my_conquest.conquest_backend.dto;

import com.my_conquest.conquest_backend.enums.AchievementCategory;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

public interface AchievementSummary {
    UUID getGroupId();
    UUID getId();
    String getTitle();
    String getDescription();
    AchievementCategory getCategory();
    Short getDifficultyLevel();
    LocalDate getAchievedAt();
    OffsetDateTime getCreatedAt();
}
