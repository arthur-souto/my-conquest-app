package com.my_conquest.conquest_backend.dto.response;

import java.time.OffsetDateTime;
import java.util.UUID;

public interface EvidenceSummary {
    UUID getAchievementId();
    UUID getId();
    String getStoragePath();
    String getFileType();
    String getCaption();
    OffsetDateTime getUploadedAt();
}
