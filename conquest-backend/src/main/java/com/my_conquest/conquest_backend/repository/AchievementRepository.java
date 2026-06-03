package com.my_conquest.conquest_backend.repository;

import com.my_conquest.conquest_backend.dto.response.AchievementSummary;
import com.my_conquest.conquest_backend.entity.Achievement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface AchievementRepository extends JpaRepository<Achievement, UUID> {

    Optional<Achievement> findByIdAndGroupId(UUID achievementId, UUID groupId);

    boolean existsByIdAndGroupId(UUID id, UUID groupId);

    @Query("""
    SELECT a.group.id as groupId, a.id as id, a.title as title, a.description as description,
    a.category as category, a.difficultyLevel as difficultyLevel,
    a.achievedAt as achievedAt, a.createdAt as createdAt
    FROM Achievement a WHERE a.group.id =:groupId
    AND (:target IS NULL OR LOWER(a.title) LIKE %:target%)
    """)
    Page<AchievementSummary> findByGroupIdAndTarget(@Param("groupId") UUID groupId, @Param("target") String target, Pageable pageable);

}
