package com.my_conquest.conquest_backend.controller;

import com.my_conquest.conquest_backend.dto.request.CreateGroupRequest;
import com.my_conquest.conquest_backend.dto.response.GroupResponse;
import com.my_conquest.conquest_backend.dto.response.IdResponse;
import com.my_conquest.conquest_backend.dto.request.UpdateGroupRequest;
import com.my_conquest.conquest_backend.notation.CurrentUserNotation;
import com.my_conquest.conquest_backend.service.GroupService;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/v1/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public IdResponse create(@Parameter(hidden = true) @CurrentUserNotation UUID userId, @RequestBody @Valid CreateGroupRequest req
    ) {
        return groupService.createGroup(req, userId);
    }

    @GetMapping
    public Page<GroupResponse> findAll(@Parameter(hidden = true) @CurrentUserNotation UUID userId, Pageable pageable
    ) {
        return groupService.findMyGroups(userId, pageable);
    }

    @PatchMapping("/{id}")
    public IdResponse update(@Parameter(hidden = true) @CurrentUserNotation UUID userId, @PathVariable UUID id, @RequestBody @Valid UpdateGroupRequest req
    ) {
        return groupService.updateGroup(req, userId, id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@Parameter(hidden = true) @CurrentUserNotation UUID userId, @PathVariable UUID id
    ) {
        groupService.deleteGroup(userId, id);
    }
}
