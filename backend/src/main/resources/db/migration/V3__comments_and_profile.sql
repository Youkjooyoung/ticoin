CREATE TABLE IF NOT EXISTS comment (
    id          BIGSERIAL PRIMARY KEY,
    device_id   VARCHAR(64)  NOT NULL,
    symbol      VARCHAR(20)  NOT NULL,
    author      VARCHAR(50)  NOT NULL,
    content     VARCHAR(500) NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comment_symbol ON comment (symbol);
CREATE INDEX IF NOT EXISTS idx_comment_device ON comment (device_id);

CREATE TABLE IF NOT EXISTS profile (
    id          BIGSERIAL PRIMARY KEY,
    device_id   VARCHAR(64)  NOT NULL UNIQUE,
    nickname    VARCHAR(50)  NOT NULL,
    bio         VARCHAR(200),
    avatar_url  VARCHAR(2048),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profile_device ON profile (device_id);
