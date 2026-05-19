package com.my_conquest.conquest_backend.dto;

import com.my_conquest.conquest_backend.entity.Tag;

import java.util.UUID;

public record TagResponse(
        UUID id,
        String name,
        String colorHex
) {
    public static TagResponse from(Tag tag) {
        return new TagResponse(tag.getId(), tag.getName(), tag.getColorHex());
    }
}
