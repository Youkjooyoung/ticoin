# Development Log

## 2026-05-18

- Read `AGENTS.md`, architecture/development docs, and the full-stack product ops skill before making changes.
- Corrected the market-source direction: Ticoin uses Binance live crypto streams.
- Removed the mistaken exchange-specific client and test.
- Restored Binance ticker and kline hooks.
- Updated the dashboard cards and detail modal so crypto prices and candles update in real time.
- Rewrote project docs around Binance live data, CoinGecko seed data, Yahoo stocks, and OpenAI analysis.

## 2026-05-20

- Expanded crypto market discovery to all active Binance USDT spot markets through `BinanceClient`.
- Kept CoinGecko as a fallback for crypto seed data when Binance REST is unavailable.
- Added short Binance REST ticker correction polling beside WebSocket ticker updates to reduce visible price lag.
- Added local email/password login and registration while keeping OAuth provider support.
- Reworked search and profile flows so search uses the full Binance market list and profile depends on real auth state instead of hardcoded guest data.

## Validation Checklist

- Backend unit tests: `cd backend && ./gradlew test`
- Frontend build: `cd frontend && npm run build`
- Frontend E2E: `cd frontend && npx playwright test`
- Docker smoke: `docker compose up -d --build`
