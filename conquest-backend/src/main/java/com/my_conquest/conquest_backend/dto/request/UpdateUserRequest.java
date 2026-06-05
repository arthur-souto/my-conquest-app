package com.my_conquest.conquest_backend.dto.request;

import jakarta.validation.constraints.Pattern;

public record UpdateUserRequest(
        @Pattern(regexp = "(^$)|(^https?://.+$)", message = "Imagem de perfil deve ser uma URL válida")
        String profileImage
) {
}
