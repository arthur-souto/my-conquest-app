package com.my_conquest.conquest_backend.dto.response;

import java.util.Map;

public record StatsResponse(
        Long totalAchievements,
        Long totalEvidences,
        Double averageDifficulty,
        String favoriteCategory,
        String mostProductiveMonth,
        Map<String, Long> achievementsByCategory,
        Map<String, Long> achievementsByMonth,
        LastAchievementResponse lastAchievement
) {
}
