package com.my_conquest.conquest_backend.controller;

import com.my_conquest.conquest_backend.notation.CurrentUserNotation;
import com.my_conquest.conquest_backend.service.StorageService;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/storage")
@RequiredArgsConstructor
public class StorageController {

    private final StorageService storageService;

    @GetMapping("/image/presigned-url")
    public Map<String, String> getImageUrl(
            @Parameter(hidden = true) @CurrentUserNotation UUID userId,
            @RequestParam String fileName,
            @RequestParam String type
    ) {
        return storageService.getImageUploadUrl(fileName, type, userId);
    }

    @GetMapping("/pdf/presigned-url")
    public Map<String, String> getPdfUrl(
            @Parameter(hidden = true) @CurrentUserNotation UUID userId,
            @RequestParam String fileName,
            @RequestParam String type

    ) {
        return storageService.getPdfUploadUrl(fileName, type, userId);
    }
}
