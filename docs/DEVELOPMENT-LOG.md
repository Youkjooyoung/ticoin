# Development Log

## 2026-05-18

- Rebased project operating instructions around Codex in `AGENTS.md`.
- Removed previous assistant-tooling files and references.
- Migrated AI analysis from the previous provider-specific client to OpenAI Responses API.
- Added Upbit-first market data integration for KRW crypto markets.
- Restored corrupted Korean UI text and rebuilt core dashboard surfaces.
- Updated documentation for current ports, data sources, and environment variables.

## Validation Checklist

- Backend unit tests: `cd backend && ./gradlew test`
- Frontend build: `cd frontend && npm run build`
- Frontend E2E: `cd frontend && npx playwright test`
- Docker smoke: `docker compose up -d --build`
