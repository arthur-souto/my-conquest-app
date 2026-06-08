package com.my_conquest.conquest_backend.repository;

import com.my_conquest.conquest_backend.dto.response.AchievementSummary;
import com.my_conquest.conquest_backend.entity.Achievement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AchievementRepository extends JpaRepository<Achievement, UUID> {

    Optional<Achievement> findByIdAndGroupId(UUID achievementId, UUID groupId);

    boolean existsByIdAndGroupId(UUID id, UUID groupId);

    @Query("SELECT COUNT(a) FROM Achievement a WHERE a.group.user.keyCloakId = :keyCloakId")
    Long countByUserKeyCloakId(@Param("keyCloakId") UUID keyCloakId);

    @Query("SELECT AVG(a.difficultyLevel) FROM Achievement a WHERE a.group.user.keyCloakId = :keyCloakId")
    Double avgDifficultyByUserKeyCloakId(@Param("keyCloakId") UUID keyCloakId);

    @Query("""
    SELECT a.category, COUNT(a)
    FROM Achievement a
    WHERE a.group.user.keyCloakId = :keyCloakId
    GROUP BY a.category
    """)
    List<Object[]> countByCategoryAndUserKeyCloakId(@Param("keyCloakId") UUID keyCloakId);

    @Query("""
    SELECT FUNCTION('TO_CHAR', a.achievedAt, 'YYYY-MM'), COUNT(a)
    FROM Achievement a
    WHERE a.group.user.keyCloakId = :keyCloakId
    GROUP BY FUNCTION('TO_CHAR', a.achievedAt, 'YYYY-MM')
    ORDER BY 1
    """)
    List<Object[]> countByMonthAndUserKeyCloakId(@Param("keyCloakId") UUID keyCloakId);

    @Query("""
    SELECT a
    FROM Achievement a
    WHERE a.group.user.keyCloakId = :keyCloakId
    ORDER BY a.achievedAt DESC
    """)
    List<Achievement> findLastByUserKeyCloakId(@Param("keyCloakId") UUID keyCloakId, Pageable pageable);

    @Query("""
    SELECT a.group.id as groupId, a.id as id, a.title as title, a.description as description,
    a.category as category, a.difficultyLevel as difficultyLevel,
    a.achievedAt as achievedAt, a.createdAt as createdAt
    FROM Achievement a WHERE a.group.id =:groupId
    AND (:target IS NULL OR LOWER(a.title) LIKE %:target%)
    """)
    Page<AchievementSummary> findByGroupIdAndTarget(@Param("groupId") UUID groupId, @Param("target") String target, Pageable pageable);

}
