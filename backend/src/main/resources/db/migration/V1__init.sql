CREATE TABLE IF NOT EXISTS portfolio (
    id         BIGSERIAL PRIMARY KEY,
    symbol     VARCHAR(20)    NOT NULL,
    name       VARCHAR(100)   NOT NULL,
    type       VARCHAR(10)    NOT NULL,
    quantity   NUMERIC(20, 8) NOT NULL,
    avg_price  NUMERIC(20, 8) NOT NULL,
    created_at TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_symbol ON portfolio (symbol);

CREATE TABLE IF NOT EXISTS watchlist (
    id            BIGSERIAL PRIMARY KEY,
    symbol        VARCHAR(20)    NOT NULL UNIQUE,
    name          VARCHAR(100)   NOT NULL,
    type          VARCHAR(10)    NOT NULL,
    target_price  NUMERIC(20, 8),
    alert_enabled BOOLEAN        NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_watchlist_symbol ON watchlist (symbol);
