package com.my_conquest.conquest_backend.controller;

import com.my_conquest.conquest_backend.dto.request.CreateAchievementRequest;
import com.my_conquest.conquest_backend.dto.request.CreateEvidenceRequest;
import com.my_conquest.conquest_backend.dto.request.UpdateAchievementRequest;
import com.my_conquest.conquest_backend.dto.response.AchievementResponse;
import com.my_conquest.conquest_backend.dto.response.IdResponse;
import com.my_conquest.conquest_backend.notation.CurrentUserNotation;
import com.my_conquest.conquest_backend.service.AchievementService;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/v1/achievements")
@RequiredArgsConstructor
public class AchievementController {

    private final AchievementService achievementService;

    @PostMapping("/{groupId}")
    public IdResponse createAchievement(@Parameter(hidden = true) @CurrentUserNotation UUID userId, @PathVariable UUID groupId, @RequestBody @Valid CreateAchievementRequest req) {
        return achievementService.createAchievement(userId, groupId, req);
    }

    @GetMapping("/{groupId}")
    public Page<AchievementResponse> findAllAchievements(@Parameter(hidden = true) @CurrentUserNotation UUID userId, @PathVariable UUID groupId, @RequestParam(required = false) String target, Pageable pageable) {
        return achievementService.getAllAchievements(userId, groupId, target, pageable);
    }

    @PatchMapping("/{groupId}/{achievementId}")
    public IdResponse updateAchievement(@Parameter(hidden = true) @CurrentUserNotation UUID userId, @PathVariable UUID groupId, @PathVariable UUID achievementId, @RequestBody @Valid UpdateAchievementRequest req) {
        return achievementService.updateAchievement(userId, groupId, achievementId, req);
    }

    @DeleteMapping("/{groupId}/{achievementId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAchievement(@Parameter(hidden = true) @CurrentUserNotation UUID userId, @PathVariable UUID groupId, @PathVariable UUID achievementId) {
        achievementService.deleteAchievement(userId, groupId, achievementId);
    }

    @PostMapping("/{groupId}/{achievementId}/tags/{tagId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void addTag(@Parameter(hidden = true) @CurrentUserNotation UUID userId, @PathVariable UUID groupId, @PathVariable UUID achievementId, @PathVariable UUID tagId) {
        achievementService.addTag(userId, groupId, achievementId, tagId);
    }

    @DeleteMapping("/{groupId}/{achievementId}/tags/{tagId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeTag(@Parameter(hidden = true) @CurrentUserNotation UUID userId, @PathVariable UUID groupId, @PathVariable UUID achievementId, @PathVariable UUID tagId) {
        achievementService.removeTag(userId, groupId, achievementId, tagId);
    }

    @PostMapping("/{groupId}/{achievementId}/evidences")
    @ResponseStatus(HttpStatus.CREATED)
    public IdResponse addEvidence(@Parameter(hidden = true) @CurrentUserNotation UUID userId, @PathVariable UUID groupId, @PathVariable UUID achievementId, @RequestBody @Valid CreateEvidenceRequest req) {
        return achievementService.addEvidence(userId, groupId, achievementId, req);
    }

    @DeleteMapping("/{groupId}/{achievementId}/evidences/{evidenceId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeEvidence(@Parameter(hidden = true) @CurrentUserNotation UUID userId, @PathVariable UUID groupId, @PathVariable UUID achievementId, @PathVariable UUID evidenceId) {
        achievementService.removeEvidence(userId, groupId, achievementId, evidenceId);
    }
}
