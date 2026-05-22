# Development Log

## 2026-05-22

- Ran the automation review against the active Codex branch `codex-upbit-openai-ui-refactor`.
- Confirmed current project instructions live in `AGENTS.md`.
- Confirmed no remaining `.claude`, `CLAUDE.md`, Claude, or Gemini traces in the latest branch search.
- Documented date-by-date work history in `docs/WORK-HISTORY-BY-DATE.md`.
- Documented new issues, enhancement priorities, Git activity, and validation results in `docs/AUTOMATION-REVIEW-2026-05-22.md`.
- Validation note: backend tests could not run because Gradle wrapper executables/jar are missing and global Gradle is unavailable.
- Validation note: frontend build failed in this sandbox because Vite/esbuild attempted to scan `C:\Users\admin`, which is blocked by filesystem permissions.

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
