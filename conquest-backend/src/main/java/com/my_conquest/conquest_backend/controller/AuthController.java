package com.my_conquest.conquest_backend.controller;

import com.my_conquest.conquest_backend.dtos.LoginRequest;
import com.my_conquest.conquest_backend.dtos.LoginResponse;
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
    public ResponseEntity<LoginResponse> signIn(@RequestBody @Valid LoginRequest request) {
        return ResponseEntity.ok(authService.signIn(request));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe(@AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        List<String> roles = jwt.getClaimAsStringList("roles");
        return ResponseEntity.ok(userId);
    }
}
