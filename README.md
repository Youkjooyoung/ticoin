# Ticoin

Binance 실시간 코인 시세와 Yahoo Finance 주식 시세를 함께 보여주는 소셜 투자 대시보드입니다. 캔들 차트, WebSocket 가격 갱신, 포트폴리오, 관심목록, 가격 알림, 소셜 피드, OpenAI 기반 AI 시장 분석을 제공합니다.

## Tech Stack

- Backend: Java 21, Spring Boot 3.4.1, PostgreSQL 16, Flyway, WebSocket/STOMP, WebFlux WebClient
- Frontend: React 18.3, Vite 6, Tailwind CSS, Zustand, i18next, Playwright
- Market data: Binance REST/WebSocket, CoinGecko fallback, Yahoo Finance
- AI: OpenAI Responses API

## Ports

| Service | Port |
| --- | --- |
| Frontend Vite | 5175 |
| Frontend Docker/nginx | 5174 |
| Backend | 8090 |
| PostgreSQL Docker | 5434 -> 5432 |

## Commands

```bash
docker compose up -d --build
docker compose up -d postgres
cd backend && ./gradlew bootRun
cd backend && ./gradlew test
cd frontend && npm install && npm run dev
cd frontend && npm run build
cd frontend && npx playwright test
```

## Environment

```bash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5-mini
OPENAI_URL=https://api.openai.com
CMC_API_KEY=
```

Frontend Binance defaults:

```bash
VITE_BINANCE_REST_URL=https://api.binance.com
VITE_BINANCE_WS_URL=wss://stream.binance.com:9443
```

## Public API

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/market/feed` | CoinGecko crypto seed data and Yahoo stock feed |
| GET | `/api/market/coins` | Default crypto list |
| GET | `/api/market/stocks` | Default stock list |
| GET | `/api/market/trending` | CoinGecko trending crypto |
| GET | `/api/market/candles` | CoinGecko or Yahoo candles |
| GET | `/api/market/search` | Crypto search by ticker/name mapping |
| GET | `/api/ai/status` | OpenAI analysis status |
| GET | `/api/ai/analyze` | OpenAI market analysis |

## Market Data Policy

- Crypto cards use Binance WebSocket ticker updates for live prices.
- Crypto charts use Binance REST for initial candles and Binance kline WebSocket for live candle updates.
- Backend REST feed remains an initial/fallback data source.
- Stock data stays on Yahoo Finance.
- Quote and candle data are not persisted to PostgreSQL.
