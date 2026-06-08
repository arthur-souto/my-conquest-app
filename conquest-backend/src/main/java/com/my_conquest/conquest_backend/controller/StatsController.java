package com.my_conquest.conquest_backend.controller;

import com.my_conquest.conquest_backend.dto.response.StatsResponse;
import com.my_conquest.conquest_backend.notation.CurrentUserNotation;
import com.my_conquest.conquest_backend.service.StatsService;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/v1/stats")
@RequiredArgsConstructor
public class StatsController {

    private final StatsService statsService;

    @GetMapping
    public ResponseEntity<StatsResponse> getStats(@Parameter(hidden = true) @CurrentUserNotation UUID userId) {
        return ResponseEntity.ok(statsService.getStats(userId));
    }
}