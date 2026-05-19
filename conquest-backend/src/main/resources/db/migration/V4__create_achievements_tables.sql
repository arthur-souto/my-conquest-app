-- Group of achievements
CREATE TABLE groups (
                        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        name        VARCHAR(255) NOT NULL,
                        user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                        description TEXT,
                        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Main achievements table
CREATE TABLE achievements (
                              id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                              title            VARCHAR(255) NOT NULL,
                              description      TEXT,
                              group_id         UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
                              category         VARCHAR(20) NOT NULL CHECK (category IN ('career', 'personal', 'learning', 'fitness')),
                              difficulty_level SMALLINT NOT NULL DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
                              achieved_at      DATE NOT NULL DEFAULT CURRENT_DATE,
                              created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tags table (reusable per user)
CREATE TABLE tags (
                      id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                      user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                      name      VARCHAR(80) NOT NULL,
                      color_hex VARCHAR(7) NOT NULL DEFAULT '#6366F1',
                      UNIQUE (user_id, name)
);

-- Junction table: achievement <-> tag
CREATE TABLE achievement_tags (
                                  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
                                  tag_id         UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
                                  PRIMARY KEY (achievement_id, tag_id)
);

-- Evidences table (images, screenshots, PDFs)
CREATE TABLE evidences (
                           id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                           achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
                           storage_path   TEXT NOT NULL,
                           file_type      VARCHAR(50),
                           caption        VARCHAR(255),
                           uploaded_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Indexes
-- ============================================================

-- achievements: most queries filter by user through group_id
CREATE INDEX idx_achievements_group_id       ON achievements(group_id);
CREATE INDEX idx_achievements_category       ON achievements(category);
CREATE INDEX idx_achievements_achieved_at    ON achievements(achieved_at DESC);
-- composite: list achievements within a group sorted by date
CREATE INDEX idx_achievements_group_date     ON achievements(group_id, achieved_at DESC);
-- composite: filter achievements by category within a group
CREATE INDEX idx_achievements_group_category ON achievements(group_id, category);

-- groups: lookup by owner
CREATE INDEX idx_groups_user_id              ON groups(user_id);

-- tags: lookup by owner (UNIQUE partially covers this, but explicit for clarity)
CREATE INDEX idx_tags_user_id                ON tags(user_id);

-- achievement_tags: reverse side (tag -> achievements)
CREATE INDEX idx_achievement_tags_tag_id     ON achievement_tags(tag_id);

-- evidences: lookup by achievement
CREATE INDEX idx_evidences_achievement_id    ON evidences(achievement_id);

-- ============================================================
-- View: achievements with tag and evidence counts
-- ============================================================
CREATE VIEW achievements_summary AS
SELECT
    a.id,
    a.title,
    a.category,
    a.difficulty_level,
    a.achieved_at,
    a.group_id,
    COUNT(DISTINCT atags.tag_id) AS tag_count,
    COUNT(DISTINCT e.id)         AS evidence_count
FROM achievements a
         LEFT JOIN achievement_tags atags ON atags.achievement_id = a.id
         LEFT JOIN evidences e             ON e.achievement_id    = a.id
GROUP BY a.id;