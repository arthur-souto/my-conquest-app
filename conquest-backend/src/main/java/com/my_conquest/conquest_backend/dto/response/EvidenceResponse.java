package com.my_conquest.conquest_backend.dto.response;

import java.time.OffsetDateTime;
import java.util.UUID;

public record EvidenceResponse(
        UUID achievementId,
        UUID id,
        String storagePath,
        String fileType,
        String caption,
        OffsetDateTime uploadedAt
) {
    public static EvidenceResponse from(EvidenceSummary summary, String imagesUrl, String pdfsUrl) {
        String baseUrl = summary.getFileType() != null && summary.getFileType().contains("pdf")
                ? pdfsUrl
                : imagesUrl;

        return new EvidenceResponse(
                summary.getAchievementId(),
                summary.getId(),
                baseUrl + "/" + summary.getStoragePath(),
                summary.getFileType(),
                summary.getCaption(),
                summary.getUploadedAt()
        );
    }
}