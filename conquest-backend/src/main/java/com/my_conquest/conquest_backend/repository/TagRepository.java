package com.my_conquest.conquest_backend.repository;

import com.my_conquest.conquest_backend.dto.TagSummary;
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

    List<Tag> findByUserId(UUID userId);

    Page<Tag> findAllByUserId(UUID userId, Pageable pageable);

    Optional<Tag> findByUserIdAndName(UUID userId, String name);

    Optional<Tag> findByIdAndUserId(UUID id, UUID userId);

    @Query("""
    SELECT a.id as achievementId, t.id as id, t.name as name, t.colorHex as colorHex
    FROM Achievement a
    JOIN a.tags t
    WHERE a.id IN :achievementIds
""")
    List<TagSummary> findAllByAchievements(@Param("achievementIds") List<UUID> achievementIds);
}
