# ticoin

업비트 KRW 마켓을 우선 데이터 소스로 사용하는 실시간 가상자산·주식 소셜 대시보드입니다. 캔들 차트, WebSocket 가격 브로드캐스트, 포트폴리오, 관심목록, 가격 알림, 소셜 피드, OpenAI 기반 AI 시장 분석을 제공합니다.

## Tech Stack

### Backend

- Java 21, Spring Boot 3.4.1, Gradle
- Spring Web, WebFlux WebClient, Spring Data JPA, Hibernate
- PostgreSQL 16, Flyway, `ddl-auto: validate`
- Spring Security, JWT, OAuth2 Google/Kakao
- WebSocket/STOMP, SockJS
- Caffeine Cache, Actuator, springdoc-openapi
- External APIs: Upbit, Yahoo Finance, CoinGecko fallback, CryptoCompare, Reddit, Google News, OpenAI Responses API

### Frontend

- React 18.3, Vite 6, Tailwind CSS 3.4
- Zustand, React Router 6, Axios
- i18next ko/en/ja
- lucide-react, Canvas candle chart
- Playwright E2E

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

cd backend
./gradlew bootRun
./gradlew test

cd frontend
npm install
npm run dev
npm run build
npx playwright test

docker compose -f docker-compose.prod.yml up -d --build
```

## Environment

```bash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5-mini
OPENAI_URL=https://api.openai.com
UPBIT_URL=https://api.upbit.com
UPBIT_WS_URL=wss://api.upbit.com/websocket/v1
```

## API

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/market/feed` | 업비트 KRW 코인과 Yahoo 주식 통합 피드 |
| GET | `/api/market/coins` | 업비트 KRW 기본 코인 목록 |
| GET | `/api/market/stocks` | Yahoo 주식 시세 |
| GET | `/api/market/trending` | 업비트 거래대금 기반 트렌딩 |
| GET | `/api/market/candles` | 업비트/Yahoo 캔들 |
| GET | `/api/market/search` | 업비트 KRW 마켓 검색 |
| GET | `/api/ai/status` | OpenAI 분석 기능 상태 |
| GET | `/api/ai/analyze` | OpenAI 시장 분석 |

## Data Policy

- 코인 내부 심볼은 `KRW-BTC` 형식을 사용합니다.
- 화면에서는 `BTC/KRW` 형식으로 표시합니다.
- 단순 시세 조회 결과는 DB에 저장하지 않습니다.
- 사용자 데이터는 포트폴리오, 관심목록, 알림, 프로필, 소셜 피드 테이블에만 저장합니다.

## Docs

- `AGENTS.md`: Codex 작업 지침
- `docs/ARCHITECTURE.md`: 시스템 구조
- `docs/CHANGELOG.md`: 변경 이력
- `docs/DEVELOPMENT-LOG.md`: 작업 로그
- `deploy/aws-deploy.md`: AWS 배포 가이드
