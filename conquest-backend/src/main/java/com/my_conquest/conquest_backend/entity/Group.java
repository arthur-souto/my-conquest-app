package com.my_conquest.conquest_backend.entity;

import jakarta.persistence.*;
import lombok.*;


import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "groups")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Group {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 255)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @OneToMany(mappedBy =  "group", cascade = CascadeType.ALL, orphanRemoval = true)
    List<Achievement> achievements;

    @PrePersist
    private void prePersist() {
        if (createdAt == null) createdAt = OffsetDateTime.now();
    }

}
