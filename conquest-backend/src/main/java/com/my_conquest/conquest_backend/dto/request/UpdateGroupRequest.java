package com.my_conquest.conquest_backend.dto.request;

import jakarta.validation.constraints.Size;

public record UpdateGroupRequest(
        @Size(min = 1, message = "Name not be empty")
        String name,
        @Size(min = 1, message = "Description not be empty")
        String description
) {
}
