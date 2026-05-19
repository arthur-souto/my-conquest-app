package com.my_conquest.conquest_backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Pattern;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "tags", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "name"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tag {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 80)
    private String name;

    @Column(name = "color_hex", nullable = false, length = 7)
    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Cor inválida, use formato hex: #RRGGBB")
    private String colorHex;
}
