package com.my_conquest.conquest_backend.controller;

import com.my_conquest.conquest_backend.dto.response.UserResponse;
import com.my_conquest.conquest_backend.notation.CurrentUserNotation;
import com.my_conquest.conquest_backend.service.UserService;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
