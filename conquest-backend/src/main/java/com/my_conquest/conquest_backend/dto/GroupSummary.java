package com.my_conquest.conquest_backend.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public interface GroupSummary {
    UUID getId();
    String getName();
    String getDescription();
    OffsetDateTime getCreatedAt();
    long getAchievementsCount();
}
