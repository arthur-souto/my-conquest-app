package com.my_conquest.conquest_backend.repository;

import com.my_conquest.conquest_backend.dto.GroupSummary;
import com.my_conquest.conquest_backend.entity.Group;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface GroupRepository extends JpaRepository<Group, UUID> {

    boolean existsByIdAndUserId(UUID id, UUID userId);

    @Query("""
    SELECT 
    g.id as id,
    g.name as name, 
    g.description as description, 
    g.createdAt as createdAt,
    COUNT(a) as achievementsCount     
    FROM Group g
    LEFT JOIN g.achievements a 
    WHERE g.user.id =:userId
    GROUP BY g.id, g.name, g.description, g.createdAt 
    """)
    Page<GroupSummary> findAllByUserId(@Param("userId") UUID userId, Pageable pageable);

    Optional<Group> findByIdAndUserId(UUID id, UUID userId);

    boolean existsByNameAndUserId(String name, UUID userId);
}
