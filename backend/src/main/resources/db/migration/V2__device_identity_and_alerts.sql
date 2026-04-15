-- Device identity columns
ALTER TABLE portfolio ADD COLUMN IF NOT EXISTS device_id VARCHAR(64) NOT NULL DEFAULT 'anonymous';
ALTER TABLE watchlist DROP CONSTRAINT IF EXISTS watchlist_symbol_key;
ALTER TABLE watchlist ADD COLUMN IF NOT EXISTS device_id VARCHAR(64) NOT NULL DEFAULT 'anonymous';
ALTER TABLE watchlist ADD CONSTRAINT watchlist_device_symbol_uk UNIQUE (device_id, symbol);

CREATE INDEX IF NOT EXISTS idx_portfolio_device ON portfolio (device_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_device ON watchlist (device_id);

-- Price alerts
CREATE TABLE IF NOT EXISTS price_alert (
    id          BIGSERIAL PRIMARY KEY,
    device_id   VARCHAR(64)    NOT NULL,
    symbol      VARCHAR(20)    NOT NULL,
    name        VARCHAR(100)   NOT NULL,
    type        VARCHAR(10)    NOT NULL,
    condition   VARCHAR(10)    NOT NULL, -- ABOVE | BELOW
    target      NUMERIC(20, 8) NOT NULL,
    triggered   BOOLEAN        NOT NULL DEFAULT FALSE,
    triggered_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alert_device ON price_alert (device_id);
CREATE INDEX IF NOT EXISTS idx_alert_active ON price_alert (triggered) WHERE triggered = FALSE;
