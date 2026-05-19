package com.my_conquest.conquest_backend.dto;

import com.my_conquest.conquest_backend.entity.Tag;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record CreateTagRequest(
        @NotBlank(message = "Nome é necessário")
        String name,
        @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Cor inválida, use formato hex: #RRGGBB")
        String colorHex
) {

        public static Tag toEntity(CreateTagRequest req) {
                return Tag.builder()
                        .name(req.name)
                        .colorHex(req.colorHex)
                        .build();
        }

}
