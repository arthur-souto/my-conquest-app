package com.my_conquest.conquest_backend.dto.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateTagRequest(
        @Size(min = 1, message = "Name not be empty")
        String name,
        @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Invalid color, use format hex: #RRGGBB")
        String colorHex
) {
}
