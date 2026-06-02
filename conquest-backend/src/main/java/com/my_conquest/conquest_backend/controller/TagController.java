package com.my_conquest.conquest_backend.controller;

import com.my_conquest.conquest_backend.dto.request.CreateTagRequest;
import com.my_conquest.conquest_backend.dto.response.IdResponse;
import com.my_conquest.conquest_backend.dto.response.TagResponse;
import com.my_conquest.conquest_backend.dto.request.UpdateTagRequest;
import com.my_conquest.conquest_backend.notation.CurrentUserNotation;
import com.my_conquest.conquest_backend.service.TagService;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/v1/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagService tagService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public IdResponse create(
            @Parameter(hidden = true) @CurrentUserNotation UUID userId,
            @RequestBody @Valid CreateTagRequest req
    ) {
        return tagService.createTag(req, userId);
    }

    @GetMapping
    public Page<TagResponse> findAll(@Parameter(hidden = true) @CurrentUserNotation UUID userId, Pageable pageable) {
        return tagService.findAll(userId, pageable);
    }

    @PatchMapping("/{id}")
    public IdResponse update(
            @Parameter(hidden = true) @CurrentUserNotation UUID userId,
            @PathVariable UUID id,
            @RequestBody @Valid UpdateTagRequest req
            ) {
        return tagService.updateTag(userId, id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @Parameter(hidden = true) @CurrentUserNotation UUID userId,
            @PathVariable UUID id

    ) {
        tagService.delete(userId, id);
    }
}
