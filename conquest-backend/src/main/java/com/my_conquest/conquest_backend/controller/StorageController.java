package com.my_conquest.conquest_backend.controller;

import com.my_conquest.conquest_backend.notation.CurrentUserNotation;
import com.my_conquest.conquest_backend.service.StorageService;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/v1/storage")
@RequiredArgsConstructor
public class StorageController {

    private final StorageService storageService;

    @GetMapping("/image/presigned-url")
    public Map<String, String> getImageUrl(@Parameter(hidden = true) @CurrentUserNotation UUID userId, @RequestParam String fileName, @RequestParam String type) {
        return storageService.getImageUploadUrl(fileName, type, userId);
    }

    @GetMapping("/pdf/presigned-url")
    public Map<String, String> getPdfUrl(@Parameter(hidden = true) @CurrentUserNotation UUID userId, @RequestParam String fileName, @RequestParam String type) {
        return storageService.getPdfUploadUrl(fileName, type, userId);
    }

    @DeleteMapping("/file")
    public void deleteFile(@RequestParam String storagePath) {
        storageService.deleteFile(storagePath);
    }
}
