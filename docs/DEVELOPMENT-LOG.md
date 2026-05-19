# Development Log

## 2026-05-18

- Read `AGENTS.md`, architecture/development docs, and the full-stack product ops skill before making changes.
- Corrected the market-source direction: Ticoin uses Binance live crypto streams.
- Removed the mistaken exchange-specific client and test.
- Restored Binance ticker and kline hooks.
- Updated the dashboard cards and detail modal so crypto prices and candles update in real time.
- Rewrote project docs around Binance live data, CoinGecko seed data, Yahoo stocks, and OpenAI analysis.

## Validation Checklist

- Backend unit tests: `cd backend && ./gradlew test`
- Frontend build: `cd frontend && npm run build`
- Frontend E2E: `cd frontend && npx playwright test`
- Docker smoke: `docker compose up -d --build`
