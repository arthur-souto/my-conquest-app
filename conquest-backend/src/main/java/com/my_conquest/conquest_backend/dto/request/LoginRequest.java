package com.my_conquest.conquest_backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @Email(message = "E-mail precisa ser válido.")
        @NotBlank(message = "E-mail não pode ficar em branco.")
        String email,
        @NotBlank(message = "Senha não pode ficar em branco.")
        String password
) {
}
