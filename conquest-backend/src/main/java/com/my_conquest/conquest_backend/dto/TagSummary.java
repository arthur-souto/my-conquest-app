package com.my_conquest.conquest_backend.dto;

import java.util.UUID;

public interface TagSummary {
    UUID getAchievementId();
    UUID getId();
    String getName();
    String getColorHex();
}
