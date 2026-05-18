# Changelog

## Unreleased

### Added

- Added Upbit KRW market client for tickers, search, trending, and candles.
- Added OpenAI Responses API client for AI market analysis.
- Added Codex-first `AGENTS.md` with mandatory Read rules for project docs and skills.

### Changed

- Crypto market feed now uses Upbit first.
- AI analysis settings now use `OPENAI_API_KEY`, `OPENAI_MODEL`, and `OPENAI_URL`.
- Frontend copy, PWA manifest, and core dashboard screens were restored to valid Korean/English/Japanese text.
- Layout was widened into a trading dashboard style with feed and side context panels.
- Documentation was rewritten with the current Upbit/OpenAI/Codex architecture.

### Removed

- Removed previous assistant-tooling files.
- Removed previous AI provider client and environment settings.
- Removed direct frontend exchange connections in favor of backend-controlled market APIs.

## 0.4.0

- Added comments, profile editing, price alerts, quick create, notification dropdown, and chart improvements.
- Added Docker frontend entrypoint CRLF handling.

## 0.3.0

- Added device identity, price alerts, WebSocket alert events, production compose configuration, and AWS deployment documentation.

## 0.2.0

- Added Flyway, validation, Actuator, Swagger, WebSocket price broadcasts, modal chart views, toast notifications, skeletons, and E2E smoke tests.

## 0.1.0

- Initial Spring Boot, React, PostgreSQL, Docker, and dashboard implementation.
