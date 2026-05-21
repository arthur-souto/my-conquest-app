package com.my_conquest.conquest_backend.service;

import com.my_conquest.conquest_backend.dto.*;
import com.my_conquest.conquest_backend.exception.ResourceNotFoundException;
import com.my_conquest.conquest_backend.repository.AchievementRepository;
import com.my_conquest.conquest_backend.repository.EvidenceRepository;
import com.my_conquest.conquest_backend.repository.GroupRepository;
import com.my_conquest.conquest_backend.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AchievementService {

    private final AchievementRepository achievementRepository;
    private final TagRepository tagRepository;
    private final EvidenceRepository evidenceRepository;
    private final GroupRepository groupRepository;


    @Transactional
    public IdResponse createAchievement(UUID userId, UUID groupId, CreateAchievementRequest req) {
        final var group = groupRepository.findByIdAndUserId(groupId, userId).orElseThrow(() -> new ResourceNotFoundException("Group not found"));
        final var achievement = CreateAchievementRequest.toEntity(req);
        achievement.setGroup(group);

        return IdResponse.toResponse(achievementRepository.save(achievement).getId());
    }

    @Transactional(readOnly = true)
    public Page<AchievementResponse> getAllAchievements(UUID userId, UUID groupId, Pageable pageable) {
        final var group = groupRepository.findByIdAndUserId(groupId, userId).orElseThrow(() -> new ResourceNotFoundException("Group not found")).getId();

        Page<AchievementSummary> achievements = achievementRepository.findByGroupId(group, pageable);
        List<UUID> achievementsIds = achievements.map(AchievementSummary::getId).stream().toList();

        Map<UUID, List<TagSummary>> tagsMap = tagRepository.findAllByAchievements(achievementsIds)
                .stream().collect(Collectors.groupingBy(TagSummary::getAchievementId));

        Map<UUID, List<EvidenceSummary>> evidencesMap = evidenceRepository.findAllByAchievementIds(achievementsIds)
                .stream().collect(Collectors.groupingBy(EvidenceSummary::getAchievementId));


        return achievements.map(a -> new AchievementResponse(
                a.getGroupId(),
                a.getId(),
                a.getTitle(),
                a.getDescription(),
                a.getCategory(),
                a.getDifficultyLevel(),
                a.getAchievedAt(),
                a.getCreatedAt(),
                tagsMap.getOrDefault(a.getId(), List.of()),
                evidencesMap.getOrDefault(a.getId(), List.of())
        ));
    }

    @Transactional
    public IdResponse updateAchievement(UUID userId, UUID groupId, UUID achievementId, UpdateAchievementRequest req) {
        if(!groupRepository.existsByIdAndUserId(groupId, userId)) {
            throw new ResourceNotFoundException("Group not found.");
        }

        final var achievement = achievementRepository.findByIdAndGroupId(achievementId, groupId).orElseThrow(() -> new ResourceNotFoundException("Achievement not found."));

        if (req.title() != null) achievement.setTitle(req.title());
        if (req.description() != null) achievement.setDescription(req.description());
        if (req.category() != null) achievement.setCategory(req.category());
        if (req.difficultyLevel() != null) achievement.setDifficultyLevel(req.difficultyLevel());
        if (req.achievedAt() != null) achievement.setAchievedAt(req.achievedAt());

        return IdResponse.toResponse(achievementRepository.save(achievement).getId());
    }

    @Transactional
    public void deleteAchievement(UUID userId, UUID groupId, UUID achievementId) {
        if(!groupRepository.existsByIdAndUserId(groupId, userId)) {
            throw new ResourceNotFoundException("Group not found.");
        }

        if(!achievementRepository.existsByIdAndGroupId(achievementId, groupId)) {
            throw new ResourceNotFoundException("Group not found.");
        }

        achievementRepository.deleteById(achievementId);
    }

    @Transactional
    public void addTag(UUID userId, UUID groupId, UUID achievementId, UUID tagId) {
        if(!groupRepository.existsByIdAndUserId(groupId, userId)) {
            throw new ResourceNotFoundException("Group not found.");
        }

        final var achievement = achievementRepository.findByIdAndGroupId(achievementId, groupId).orElseThrow(() -> new ResourceNotFoundException("Achievement not found."));
        final var tag = tagRepository.findByIdAndUserId(tagId, userId).orElseThrow(() -> new ResourceNotFoundException("Tag not found."));

        achievement.addTag(tag);

        achievementRepository.save(achievement);
    }

    @Transactional
    public void removeTag(UUID userId, UUID groupId, UUID achievementId, UUID tagId) {
        if(!groupRepository.existsByIdAndUserId(groupId, userId)) {
            throw new ResourceNotFoundException("Group not found.");
        }

        final var achievement = achievementRepository.findByIdAndGroupId(achievementId, groupId).orElseThrow(() -> new ResourceNotFoundException("Achievement not found."));
        final var tag = tagRepository.findByIdAndUserId(tagId, userId).orElseThrow(() -> new ResourceNotFoundException("Tag not found."));

        achievement.removeTag(tag);

        achievementRepository.save(achievement);
    }

    @Transactional
    public IdResponse addEvidence(UUID userId, UUID groupId, UUID achievementId, CreateEvidenceRequest req) {
        if(!groupRepository.existsByIdAndUserId(groupId, userId)) {
            throw new ResourceNotFoundException("Group not found.");
        }

        final var achievement = achievementRepository.findByIdAndGroupId(achievementId, groupId).orElseThrow(() -> new ResourceNotFoundException("Achievement not found."));
        final var evidence = CreateEvidenceRequest.toEntity(req);

        achievement.addEvidence(evidence);
        achievementRepository.save(achievement);

        return IdResponse.toResponse(evidence.getId());
    }

    @Transactional
    public void removeEvidence(UUID userId, UUID groupId, UUID achievementId, UUID evidenceId) {
        if(!groupRepository.existsByIdAndUserId(groupId, userId)) {
            throw new ResourceNotFoundException("Group not found.");
        }

        final var achievement = achievementRepository.findByIdAndGroupId(achievementId, groupId).orElseThrow(() -> new ResourceNotFoundException("Achievement not found."));
        final var evidence = evidenceRepository.findById(evidenceId).orElseThrow(() -> new ResourceNotFoundException("Evidence not found."));

        achievement.removeEvidence(evidence);
        achievementRepository.save(achievement);
    }
}
