package com.my_conquest.conquest_backend.controller;

import com.my_conquest.conquest_backend.dto.LoginRequest;
import com.my_conquest.conquest_backend.dto.LoginResponse;
import com.my_conquest.conquest_backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/sign-in")
    public LoginResponse signIn(@RequestBody @Valid LoginRequest request) {
        return authService.signIn(request);
    }

}
