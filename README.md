# ticoin · 주식 & 코인

Figma AI 디자인 기반 주식/코인 실시간 소셜 대시보드. 다크 + 퍼플 테마, 바이낸스 스타일 캔들 차트, 실시간 WebSocket 가격 스트림.

## 기술 스택

**Frontend**
- React 18 + Vite 6
- Tailwind CSS 3 (다크 모드)
- Zustand (marketStore + toastStore)
- React Router 6 + ErrorBoundary + 404 페이지
- Axios + Vite `/api` 프록시
- `@stomp/stompjs` + `sockjs-client` (WebSocket 실시간 가격)
- lucide-react 아이콘
- Canvas 기반 CandleChart (Binance 스타일, MA7/MA25, 볼륨)
- SVG LineChart + MiniChart (재사용)
- Toast 시스템, 스켈레톤 로더, AssetDetailModal

**Backend**
- Java 21 + Spring Boot 3.4 (Gradle)
- Spring Web + WebFlux(WebClient) + Data JPA + Validation + Cache(Caffeine)
- **Spring WebSocket (STOMP)** — 실시간 가격 브로드캐스트
- **Flyway** 마이그레이션 (`db/migration/V1__init.sql`)
- **Spring Boot Actuator** (`/actuator/health`)
- **springdoc-openapi** (`/swagger-ui.html`, `/v3/api-docs`)
- **Global exception handler** (`@RestControllerAdvice` + `ErrorResponse`)
- DTO 유효성 검증 (`PortfolioCreateRequest`, `WatchlistCreateRequest`)
- PostgreSQL 16
- 통합 테스트 (MockMvc + H2)

**Infra**
- Docker Compose (postgres + backend + frontend)
- Nginx (프론트 서빙 + `/api` 프록시)

## 외부 API

| 데이터 | 1순위 | 대체 |
| --- | --- | --- |
| 코인 시세 | **CoinGecko** `/coins/markets` (무료) | — |
| 코인 OHLC | **CoinGecko** `/coins/{id}/ohlc` | — |
| 주식 시세 | **Yahoo Finance** `query1.finance.yahoo.com` (무료, 비공식) | Alpha Vantage, Finnhub |
| 주식 차트 | **Yahoo Finance** `/v8/finance/chart` | — |
| 암호화폐 뉴스 | **CryptoCompare News API** (무료) | CoinMarketCap Pro(유료) |

> CoinMarketCap 뉴스는 Pro 전용이라 기본값은 **CryptoCompare**. `CMC_API_KEY` 환경변수로 Pro 키 주입 가능.

## 구조

```
ticoin/
├── backend/                          # Spring Boot 3.4
│   ├── src/main/java/com/ticoin/
│   │   ├── TicoinApplication.java    # @EnableCaching + @EnableScheduling
│   │   ├── client/                   # CoinGecko / Yahoo / CryptoCompare
│   │   ├── config/WebConfig.java     # CORS + WebClient
│   │   ├── controller/               # Market, News, Portfolio, Watchlist
│   │   ├── dto/                      # records: Asset/Candle/News/*CreateRequest
│   │   ├── entity/                   # Portfolio, Watchlist
│   │   ├── exception/                # GlobalExceptionHandler + ErrorResponse
│   │   ├── repository/
│   │   ├── service/
│   │   └── websocket/                # WebSocketConfig + PriceStreamService
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   └── db/migration/V1__init.sql
│   ├── src/test/                     # MockMvc 통합 테스트
│   ├── build.gradle
│   └── Dockerfile
├── frontend/                         # React 18 + Vite 6
│   ├── src/
│   │   ├── App.jsx                   # ErrorBoundary + ToastContainer 루트
│   │   ├── components/
│   │   │   ├── AssetCard.jsx + AssetDetailModal.jsx
│   │   │   ├── Sidebar/BottomNav/Header/StoryBar
│   │   │   ├── Toast.jsx + ErrorBoundary.jsx
│   │   │   ├── charts/ (CandleChart, LineChart, MiniChart)
│   │   │   └── skeletons/ (AssetCard, News, List)
│   │   ├── hooks/                    # useLivePrices, useDebounce
│   │   ├── layouts/RootLayout.jsx
│   │   ├── pages/                    # Home, Search, Trending, Portfolio, Watchlist, Profile, NotFound
│   │   ├── stores/                   # marketStore, toastStore
│   │   ├── api/                      # axios + market/news/portfolio/watchlist
│   │   ├── lib/utils.js
│   │   └── styles/index.css          # Tailwind + keyframes
│   ├── package.json
│   ├── vite.config.js                # port 5174 strict, /api + /ws proxy
│   ├── tailwind.config.js
│   └── Dockerfile
└── docker-compose.yml
```

## 실행

### Docker Compose (전체)
```bash
docker compose up -d --build
# frontend → http://localhost:5174
# backend  → http://localhost:8090 (swagger: /swagger-ui.html)
# postgres → localhost:5433
```

### 로컬 개발 (Vite HMR + Spring Boot)
```bash
# 1. Postgres만 컨테이너로
docker compose up -d postgres

# 2. 백엔드
cd backend
./gradlew bootRun       # 또는 gradle bootRun (wrapper 없을 때)

# 3. 프론트엔드 (새 터미널)
cd frontend
npm install             # 최초 1회
npm run dev             # → http://localhost:5174
```

Vite dev 서버는 `/api`와 `/ws`를 `http://localhost:8090`으로 자동 프록시.

## 주요 엔드포인트

| Method | Path | 설명 |
| --- | --- | --- |
| GET | `/api/market/feed` | 전체 피드 (코인 + 주식) |
| GET | `/api/market/coins` | 코인 목록 |
| GET | `/api/market/stocks` | 주식 목록 |
| GET | `/api/market/trending` | 트렌딩 |
| GET | `/api/market/candles?symbol=X&type=CRYPTO&interval=1D` | OHLC 캔들 |
| GET | `/api/market/search?q=...` | 검색 |
| GET | `/api/news?category=BTC` | 크립토 뉴스 |
| GET / POST / DELETE | `/api/portfolio` | 포트폴리오 CRUD (검증) |
| GET / POST / PATCH / DELETE | `/api/watchlist` | 관심목록 CRUD (검증) |
| WS | `/ws` → `/topic/prices` | STOMP 실시간 가격 푸시 (15초 주기) |
| GET | `/actuator/health` | 헬스체크 |
| GET | `/swagger-ui.html` | API 문서 |

## 페이지

| Path | 설명 |
| --- | --- |
| `/` | 피드 + StoryBar + **AssetDetailModal (클릭 시 열림)** + Skeleton 로더 + 실시간 WebSocket 구독 |
| `/search` | **300ms 디바운스** 검색 + 트렌딩/최근 검색 탭 |
| `/trending` | 최고 상승 / 실시간 랭킹 / 하락 종목 |
| `/portfolio` | 총자산 + **7일 수익률 LineChart** + 자산배분 도넛 + CRUD + Toast |
| `/watchlist` | 관심자산 + 목표가 + 알림 토글 + **↑↓ 정렬 (localStorage 저장)** + Toast |
| `/profile` | 프로필 + 크립토 뉴스 (NewsSkeleton) + 설정 |
| `*` | 404 NotFound 페이지 |

## 고도화 버전 (v0.2.0)

2026-04-15 추가 기능:
- ✅ Global exception handler + DTO 검증
- ✅ Flyway DB 마이그레이션 + `ddl-auto: validate`
- ✅ Actuator + OpenAPI Swagger
- ✅ WebSocket STOMP 실시간 가격 스트림 (15초 주기)
- ✅ Controller 통합 테스트 (MockMvc + H2)
- ✅ AssetDetailModal (클릭 시 큰 차트)
- ✅ useLivePrices WebSocket 훅
- ✅ useDebounce 검색
- ✅ LineChart 기반 포트폴리오 7일 수익률
- ✅ Toast 시스템 (success/error/info)
- ✅ ErrorBoundary + NotFound 404
- ✅ AssetCard/List/News 스켈레톤 로더
- ✅ 관심목록 ↑↓ 재정렬 + localStorage 영속화

## 디자인 가이드

- Figma Make 원본 유지 (다크 + 퍼플 액센트)
- 브랜드: `#8B5CF6` (indigo-violet)
- 상승/하락: `#10B981` / `#EF4444` (바이낸스 스타일)
- 폰트: Inter (본문), JetBrains Mono (숫자)
- 캔들 차트: Canvas 기반, Binance 스타일, MA7/MA25 오버레이
