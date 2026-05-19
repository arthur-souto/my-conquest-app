package com.my_conquest.conquest_backend.entity;

import com.my_conquest.conquest_backend.enums.AchievementCategory;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "achievements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Achievement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Group group;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AchievementCategory category;

    @Column(name = "difficulty_level", nullable = false)
    private Short difficultyLevel;

    @Column(name = "achieved_at", nullable = false)
    private LocalDate achievedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @ManyToMany
    @JoinTable(
        name = "achievement_tags",
        joinColumns = @JoinColumn(name = "achievement_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private List<Tag> tags;

    @OneToMany(mappedBy = "achievement", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Evidence> evidences;

    @PrePersist
    private void prePersist() {
        if (createdAt == null) createdAt = OffsetDateTime.now();
        if (achievedAt == null) achievedAt = LocalDate.now();
    }
}
