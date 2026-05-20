ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
CREATE UNIQUE INDEX IF NOT EXISTS uk_users_local_email ON users (email) WHERE provider = 'local';
