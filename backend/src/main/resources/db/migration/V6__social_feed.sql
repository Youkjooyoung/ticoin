-- Phase 3: Social posts, follows, likes
CREATE TABLE IF NOT EXISTS post (
    id            BIGSERIAL PRIMARY KEY,
    user_id       BIGINT REFERENCES users(id) ON DELETE SET NULL,
    device_id     VARCHAR(64)  NOT NULL,
    author_name   VARCHAR(50)  NOT NULL,
    symbol        VARCHAR(20),
    content       VARCHAR(1000) NOT NULL,
    image_url     TEXT,
    like_count    INTEGER      NOT NULL DEFAULT 0,
    comment_count INTEGER      NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_post_created ON post (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_symbol ON post (symbol);
CREATE INDEX IF NOT EXISTS idx_post_device ON post (device_id);
CREATE INDEX IF NOT EXISTS idx_post_user ON post (user_id);

CREATE TABLE IF NOT EXISTS post_like (
    id         BIGSERIAL PRIMARY KEY,
    post_id    BIGINT       NOT NULL REFERENCES post(id) ON DELETE CASCADE,
    device_id  VARCHAR(64)  NOT NULL,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_post_like UNIQUE (post_id, device_id)
);

CREATE INDEX IF NOT EXISTS idx_post_like_post ON post_like (post_id);

CREATE TABLE IF NOT EXISTS follow (
    id            BIGSERIAL PRIMARY KEY,
    follower_id   BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id  BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_follow UNIQUE (follower_id, following_id),
    CONSTRAINT chk_follow_self CHECK (follower_id <> following_id)
);

CREATE INDEX IF NOT EXISTS idx_follow_follower ON follow (follower_id);
CREATE INDEX IF NOT EXISTS idx_follow_following ON follow (following_id);
