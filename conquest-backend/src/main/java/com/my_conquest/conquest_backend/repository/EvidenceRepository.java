package com.my_conquest.conquest_backend.repository;

import com.my_conquest.conquest_backend.dto.response.EvidenceSummary;
import com.my_conquest.conquest_backend.entity.Evidence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EvidenceRepository extends JpaRepository<Evidence, UUID> {

    List<Evidence> findByAchievementId(UUID achievementId);

    Optional<Evidence> findByIdAndAchievementId(UUID id, UUID achievementId);

    @Query("""
    SELECT a.id as achievementId, e.id as id, e.storagePath as storagePath, e.fileType as fileType,
    e.caption as caption, e.uploadedAt as uploadedAt
    FROM Achievement a
    JOIN a.evidences e
    WHERE a.id IN :achievementIds
""")
    List<EvidenceSummary> findAllByAchievementIds(@Param("achievementIds") List<UUID> achievementIds);
}
