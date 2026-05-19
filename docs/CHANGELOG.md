# Changelog

## 2026-05-18

- Removed previous assistant-tooling files and references.
- Migrated AI analysis to OpenAI Responses API.
- Reverted the mistaken exchange-specific market integration because Ticoin uses Binance live crypto data.
- Restored Binance ticker and kline WebSocket hooks for real-time crypto prices and candles.
- Kept CoinGecko as backend seed/fallback data and Yahoo Finance for stocks.
- Repaired Korean, English, and Japanese UI copy for core navigation and settings.

## Validation

- Backend tests: `gradle test --no-daemon`
- Frontend build: `npm run build`
- Frontend E2E: `npx playwright test`
- Docker smoke: `docker compose up -d --build`
