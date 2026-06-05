package com.my_conquest.conquest_backend.controller;

import com.my_conquest.conquest_backend.dto.request.UpdateUserCredentials;
import com.my_conquest.conquest_backend.dto.request.UpdateUserRequest;
import com.my_conquest.conquest_backend.dto.response.IdResponse;
import com.my_conquest.conquest_backend.dto.response.UserResponse;
import com.my_conquest.conquest_backend.notation.CurrentUserNotation;
import com.my_conquest.conquest_backend.service.UserService;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public UserResponse getMe(@Parameter(hidden = true) @CurrentUserNotation UUID userId) {
        return userService.getUser(userId);
    }

    @PutMapping("/credentials")
    public IdResponse updateCredentials(@Parameter(hidden = true) @CurrentUserNotation UUID userId, @RequestBody @Valid UpdateUserCredentials req) {
        return userService.updateCredentials(userId, req);
    }

    @PatchMapping("/me")
    public IdResponse updateUser(@Parameter(hidden = true) @CurrentUserNotation UUID userId, @RequestBody @Valid UpdateUserRequest req) {
        return userService.updateUser(userId, req);
    }
}
