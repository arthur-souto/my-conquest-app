package com.my_conquest.conquest_backend.service;

import com.my_conquest.conquest_backend.dto.request.CreateGroupRequest;
import com.my_conquest.conquest_backend.dto.response.GroupResponse;
import com.my_conquest.conquest_backend.dto.response.IdResponse;
import com.my_conquest.conquest_backend.dto.request.UpdateGroupRequest;
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
        if(groupRepository.existsByNameAndUserKeyCloakId(req.name().trim().toLowerCase(), userId)) {
            throw new ConflictException("Name already used.");
        }
        final var user = userRepository.findByKeyCloakId(userId).orElseThrow(() -> new ResourceNotFoundException("User not found."));

        final var group = CreateGroupRequest.toEntity(req);
        group.setUser(user);

        return IdResponse.toResponse(groupRepository.save(group).getId());
    }

    @Transactional(readOnly = true)
    public Page<GroupResponse> findMyGroups(UUID userId, String target, Pageable pageable) {
        return groupRepository.findAllByKeyCloakIdAndTarget(userId, target != null ? target.toLowerCase() : null, pageable).map(GroupResponse::toResponse);
    }

    @Transactional
    public IdResponse updateGroup(UpdateGroupRequest req, UUID userId, UUID groupId) {
        final var group = groupRepository.findByIdAndUserKeyCloakId(groupId, userId).orElseThrow(() -> new ResourceNotFoundException("Group not found"));

        if(!group.getUser().getKeyCloakId().equals(userId)) {
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
        final var group = groupRepository.findByIdAndUserKeyCloakId(groupId, userId).orElseThrow(() -> new ResourceNotFoundException("Group not found"));

        if(!group.getUser().getKeyCloakId().equals(userId)) {
            throw new UnauthorizedException("Access Denied: you do not own this resource");
        }

        groupRepository.deleteById(groupId);
    }
}
