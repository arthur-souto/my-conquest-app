package com.my_conquest.conquest_backend.service;

import com.my_conquest.conquest_backend.dto.CreateGroupRequest;
import com.my_conquest.conquest_backend.dto.GroupResponse;
import com.my_conquest.conquest_backend.dto.IdResponse;
import com.my_conquest.conquest_backend.dto.UpdateGroupRequest;
import com.my_conquest.conquest_backend.entity.Group;
import com.my_conquest.conquest_backend.exception.ConflictException;
import com.my_conquest.conquest_backend.exception.ResourceNotFoundException;
import com.my_conquest.conquest_backend.exception.UnauthorizedException;
import com.my_conquest.conquest_backend.repository.GroupRepository;
import com.my_conquest.conquest_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;
    private final UserRepository userRepository;

    @Transactional
    public IdResponse createGroup(CreateGroupRequest req, UUID userId) {
        if(groupRepository.existsByNameAndUserId(req.name().trim().toLowerCase(), userId)) {
            throw new ConflictException("Name already used.");
        }

        final var user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found."));

        final var group = CreateGroupRequest.toEntity(req);
        group.setUser(user);

        return IdResponse.toResponse(groupRepository.save(group).getId());
    }

    @Transactional(readOnly = true)
    public Page<GroupResponse> findMyGroups(UUID userId, Pageable pageable) {
        return groupRepository.findAllByUserId(userId, pageable).map(GroupResponse::toResponse);
    }

    @Transactional
    public IdResponse updateGroup(UpdateGroupRequest req, UUID userId, UUID groupId) {
        final var group = groupRepository.findByIdAndUserId(groupId, userId).orElseThrow(() -> new ResourceNotFoundException("Group not found"));

        if(!group.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("Access denied: you do not own this resource");
        }

        if(req.name() != null) {
            group.setName(req.name());
        }

        if(req.description() != null) {
            group.setDescription(req.description());
        }

        return IdResponse.toResponse(groupRepository.save(group).getId());
    }

    @Transactional
    public void  deleteGroup(UUID userId, UUID groupId) {
        final var group = groupRepository.findByIdAndUserId(groupId, userId).orElseThrow(() -> new ResourceNotFoundException("Group not found"));

        if(!group.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("Access Denied: you do not own this resource");
        }

        groupRepository.deleteById(groupId);
    }
}
