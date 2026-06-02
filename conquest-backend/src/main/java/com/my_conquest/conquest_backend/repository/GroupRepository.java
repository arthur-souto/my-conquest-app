package com.my_conquest.conquest_backend.repository;

import com.my_conquest.conquest_backend.dto.response.GroupSummary;
import com.my_conquest.conquest_backend.entity.Group;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface GroupRepository extends JpaRepository<Group, UUID> {

    boolean existsByIdAndUserKeyCloakId(UUID id, UUID userId);

    @Query("""
    SELECT 
    g.id as id,
    g.name as name, 
    g.description as description, 
    g.createdAt as createdAt,
    COUNT(a) as achievementsCount     
    FROM Group g
    LEFT JOIN g.achievements a 
    WHERE g.user.keyCloakId =:keyCloakId
    GROUP BY g.id, g.name, g.description, g.createdAt 
    """)
    Page<GroupSummary> findAllByKeyCloakId(@Param("keyCloakId") UUID keyCloakId, Pageable pageable);

    Optional<Group> findByIdAndUserKeyCloakId(UUID id, UUID userId);

    boolean existsByNameAndUserKeyCloakId(String name, UUID userId);
}
