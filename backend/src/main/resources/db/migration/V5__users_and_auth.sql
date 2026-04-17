-- Phase 2: OAuth users table and profile linkage
CREATE TABLE IF NOT EXISTS users (
    id           BIGSERIAL PRIMARY KEY,
    provider     VARCHAR(32)  NOT NULL,
    provider_id  VARCHAR(128) NOT NULL,
    email        VARCHAR(200),
    name         VARCHAR(100),
    avatar_url   TEXT,
    role         VARCHAR(32)  NOT NULL DEFAULT 'USER',
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_users_provider UNIQUE (provider, provider_id)
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- Optional linkage: a profile may or may not belong to a registered user
ALTER TABLE profile ADD COLUMN IF NOT EXISTS user_id BIGINT;
ALTER TABLE profile ADD CONSTRAINT fk_profile_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_profile_user ON profile (user_id);
