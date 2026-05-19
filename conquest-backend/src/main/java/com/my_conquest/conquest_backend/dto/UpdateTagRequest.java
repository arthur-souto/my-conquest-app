package com.my_conquest.conquest_backend.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateTagRequest(
        @Size(min = 1, message = "O nome não pode ser vazio")
        String name,
        @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Cor inválida, use formato hex: #RRGGBB")
        String colorHex
) {
}
