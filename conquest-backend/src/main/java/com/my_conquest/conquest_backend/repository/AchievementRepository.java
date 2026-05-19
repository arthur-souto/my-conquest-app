package com.my_conquest.conquest_backend.repository;

import com.my_conquest.conquest_backend.entity.Achievement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AchievementRepository extends JpaRepository<Achievement, UUID> {

    Page<Achievement> findAllByGroupId(UUID groupId, Pageable pageable);

}
