-- Phase 0: Allow data URLs for profile avatar (base64 images can exceed 2048 chars)
ALTER TABLE profile ALTER COLUMN avatar_url TYPE TEXT;
