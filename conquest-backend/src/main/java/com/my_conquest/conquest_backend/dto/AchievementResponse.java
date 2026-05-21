package com.my_conquest.conquest_backend.dto;

import com.my_conquest.conquest_backend.enums.AchievementCategory;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record AchievementResponse(
    UUID groupId,
    UUID id,
    String title,
    String description,
    AchievementCategory achievementCategory,
    Short difficultyLevel,
    LocalDate achievedAt,
    OffsetDateTime createdAt,
    List<TagSummary> tags,
    List<EvidenceSummary> evidences
) {
}
