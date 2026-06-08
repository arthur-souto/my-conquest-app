package com.my_conquest.conquest_backend.service;

import com.my_conquest.conquest_backend.dto.response.LastAchievementResponse;
import com.my_conquest.conquest_backend.dto.response.StatsResponse;
import com.my_conquest.conquest_backend.enums.AchievementCategory;
import com.my_conquest.conquest_backend.repository.AchievementRepository;
import com.my_conquest.conquest_backend.repository.EvidenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final AchievementRepository achievementRepository;
    private final EvidenceRepository evidenceRepository;

    private static final int FIRST_COLUMN = 0;
    private static final int SECOND_COLUMN = 1;
    private static final double MAX_ROUNDING = 10.0;
    private static final double MIN_ROUNDING = 0.0;

    @Transactional(readOnly = true)
    public StatsResponse getStats(UUID userId) {
        Long totalAchievements = achievementRepository.countByUserKeyCloakId(userId);
        Long totalEvidences = evidenceRepository.countByUserKeyCloakId(userId);
        Double avgDifficulty = achievementRepository.avgDifficultyByUserKeyCloakId(userId);

        Map<String, Long> byCategory = achievementRepository
                .countByCategoryAndUserKeyCloakId(userId)
                .stream()
                .collect(Collectors.toMap(
                    row -> ((AchievementCategory) row[FIRST_COLUMN]).name().toLowerCase(),
                        row -> (Long) row[SECOND_COLUMN]
                ));

        Map<String, Long> byMonth = achievementRepository
                .countByMonthAndUserKeyCloakId(userId)
                .stream()
                .collect(Collectors.toMap(
                        row -> (String) row[FIRST_COLUMN],
                        row -> (Long) row[SECOND_COLUMN]
                ));

        String mostProductiveMonth = byMonth.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);

        String favoriteCategory = byCategory.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);

        LastAchievementResponse lastAchievement = achievementRepository
                .findLastByUserKeyCloakId(userId, PageRequest.of(FIRST_COLUMN, SECOND_COLUMN))
                .stream()
                .findFirst()
                .map(a -> new LastAchievementResponse(
                        a.getId(),
                        a.getTitle(),
                        a.getCategory(),
                        a.getAchievedAt()
                ))
                .orElse(null);

        return new StatsResponse(
                totalAchievements,
                totalEvidences,
                avgDifficulty != null ? Math.round(avgDifficulty * MAX_ROUNDING) / MAX_ROUNDING : MIN_ROUNDING,
                favoriteCategory,
                mostProductiveMonth,
                byCategory,
                byMonth,
                lastAchievement
        );

    }
}
