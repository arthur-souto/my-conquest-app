package com.my_conquest.conquest_backend.dto;

import com.my_conquest.conquest_backend.entity.Evidence;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateEvidenceRequest(
        @NotBlank(message = "Storage path is required")
        @Size(max = 2048, message = "Storage path must be at most 2048 characters")
        String storagePath,
        @Size(max = 50, message = "File type must be at most 50 characters")
        String fileType,
        @Size(max = 255, message = "Caption must be at most 255 characters")
        String caption
) {
    public static Evidence toEntity(CreateEvidenceRequest req) {
        return Evidence.builder()
                .storagePath(req.storagePath)
                .fileType(req.fileType)
                .caption(req.caption)
                .build();
    }
}
