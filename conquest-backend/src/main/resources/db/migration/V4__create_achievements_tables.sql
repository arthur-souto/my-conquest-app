-- Main achievements table
CREATE TABLE achievements (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title            VARCHAR(255) NOT NULL,
  description      TEXT,
  -- Fixed categories: career, personal, learning, fitness
  category         VARCHAR(20) NOT NULL CHECK (category IN ('career', 'personal', 'learning', 'fitness')),
  -- 1 (easy) to 5 (very hard)
  difficulty_level SMALLINT NOT NULL DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  achieved_at      DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tags table (reusable per user)
CREATE TABLE tags (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       VARCHAR(80) NOT NULL,
  color_hex  VARCHAR(7) NOT NULL DEFAULT '#6366F1',
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
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  achievement_id  UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  storage_path    TEXT NOT NULL, -- ex: 'evidences/user-id/achievement-id/foto.png'
  file_type       VARCHAR(50),   -- ex: 'image/png', 'application/pdf'
  caption         VARCHAR(255),
  uploaded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX idx_achievements_user_id    ON achievements(user_id);
CREATE INDEX idx_achievements_category   ON achievements(category);
CREATE INDEX idx_achievements_achieved_at ON achievements(achieved_at DESC);
CREATE INDEX idx_evidences_achievement_id ON evidences(achievement_id);
CREATE INDEX idx_tags_user_id            ON tags(user_id);

-- ============================================================
-- Useful view: achievements with tag and evidence counts
-- ============================================================

CREATE VIEW achievements_summary AS
SELECT
  a.id,
  a.user_id,
  a.title,
  a.category,
  a.difficulty_level,
  a.achieved_at,
  COUNT(DISTINCT at.tag_id)  AS tag_count,
  COUNT(DISTINCT e.id)       AS evidence_count
FROM achievements a
LEFT JOIN achievement_tags at ON at.achievement_id = a.id
LEFT JOIN evidences e          ON e.achievement_id  = a.id
GROUP BY a.id;
