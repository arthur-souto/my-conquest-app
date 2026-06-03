package com.my_conquest.conquest_backend.repository;

import com.my_conquest.conquest_backend.dto.response.TagSummary;
import com.my_conquest.conquest_backend.entity.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TagRepository extends JpaRepository<Tag, UUID> {

    @Query("""
    SELECT t FROM Tag t
    WHERE t.user.keyCloakId = :userId
    AND (:target IS NULL OR LOWER(t.name) LIKE %:target%)
    """)
    Page<Tag> findAllByUserKeyCloakIdAndName(@Param("userId") UUID userId, @Param("target") String target, Pageable pageable);

    Optional<Tag> findByUserKeyCloakIdAndName(UUID userId, String name);

    Optional<Tag> findByIdAndUserKeyCloakId(UUID id, UUID userId);

    @Query("""
    SELECT a.id as achievementId, t.id as id, t.name as name, t.colorHex as colorHex
    FROM Achievement a
    JOIN a.tags t
    WHERE a.id IN :achievementIds
""")
    List<TagSummary> findAllByAchievements(@Param("achievementIds") List<UUID> achievementIds);
}
