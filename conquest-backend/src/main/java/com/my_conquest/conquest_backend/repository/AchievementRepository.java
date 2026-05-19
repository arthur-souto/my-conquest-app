package com.my_conquest.conquest_backend.repository;

import com.my_conquest.conquest_backend.entity.Achievement;
import com.my_conquest.conquest_backend.enums.AchievementCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AchievementRepository extends JpaRepository<Achievement, UUID> {

    List<Achievement> findByUserId(UUID userId);

    List<Achievement> findByUserIdAndCategory(UUID userId, AchievementCategory category);
}
