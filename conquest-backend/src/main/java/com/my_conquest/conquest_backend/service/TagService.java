package com.my_conquest.conquest_backend.service;

import com.my_conquest.conquest_backend.dto.CreateTagRequest;
import com.my_conquest.conquest_backend.dto.IdResponse;
import com.my_conquest.conquest_backend.dto.TagResponse;
import com.my_conquest.conquest_backend.dto.UpdateTagRequest;
import com.my_conquest.conquest_backend.entity.Tag;
import com.my_conquest.conquest_backend.exception.ConflictException;
import com.my_conquest.conquest_backend.exception.ResourceNotFoundException;
import com.my_conquest.conquest_backend.repository.TagRepository;
import com.my_conquest.conquest_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TagService {

    private final TagRepository tagRepository;
    private final UserRepository userRepository;

    public IdResponse createTag(CreateTagRequest req, UUID userId) {
        if (tagRepository.findByUserIdAndName(userId, req.name()).isPresent()) {
            throw new ConflictException("Tag com nome '" + req.name() + "' já existe.");
        }

        final var user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));

        Tag tag = CreateTagRequest.toEntity(req);
        tag.setUser(user);

        return new IdResponse(tagRepository.save(tag).getId());
    }

    public Page<TagResponse> findAll(UUID userId, Pageable pageable) {
        return tagRepository.findAllByUserId(userId, pageable)
                .map(TagResponse::from);
    }

    public IdResponse updateTag(UUID userId, UUID tagId, UpdateTagRequest req) {
        final var tag = tagRepository.findByIdAndUserId(tagId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Tag não encontrada."));

        if(req.colorHex() != null) {tag.setColorHex(req.colorHex());}
        if(req.name() != null) {tag.setName(req.name());}

        return new IdResponse(
                tagRepository.save(tag).getId()
        );
    }

    public void delete(UUID userId, UUID tagId) {
        final var tag = tagRepository.findById(tagId)
                .orElseThrow(() -> new ResourceNotFoundException("Tag not found."));

        if (!tag.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Tag not found.");
        }

        tagRepository.delete(tag);
    }
}
