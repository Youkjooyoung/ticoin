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
| `/` | 피드 + StoryBar + **AssetDetailModal** + **가격 flash 펄스** (WS) |
| `/search` | **300ms 디바운스** 검색 + 트렌딩/최근 검색 탭 |
| `/trending` | 최고 상승 / 실시간 랭킹 / 하락 종목 |
| `/portfolio` | 총자산 + **7일 수익률 LineChart** + 자산배분 도넛 + 실제 DB CRUD + Toast |
| `/watchlist` | 관심자산 + 목표가 + 알림 토글 + ↑↓ 정렬 + 실제 DB CRUD |
| `/alerts` | **가격 알림 CRUD** + 발동된 알림 실시간 WS 푸시 |
| `/profile` | 프로필 + 크립토 뉴스 (Reddit 폴백) + 설정 |
| `*` | 404 NotFound 페이지 |

## v0.3.0 — 풀스택 구현 + AWS 운영 준비 (2026-04-15)

기존 스켈레톤을 진짜 동작하는 앱으로 만들고 AWS 운영 배포 준비까지 완료.

### Backend 강화
- **Device Identity** — `X-Device-Id` 헤더 필터 + `@DeviceId` argument resolver. 로그인 없이도 기기별 데이터 영속화
- **Price Alerts** — `price_alert` 테이블 + CRUD + `@Scheduled` 체커가 20초 주기로 목표가 검사, 도달 시 `/topic/alerts/{deviceId}` WebSocket 푸시
- **Flyway V2 마이그레이션** — `device_id` 컬럼 + alerts 테이블 + 유니크 제약 재설정 (device + symbol)
- **Portfolio/Watchlist 재작성** — 파생 쿼리(`findByDeviceIdOrderByCreatedAtDesc`)로 low-code, 전부 device_id 스코프
- **Multi-profile** — `application-local.yml` / `application-prod.yml` + 환경변수 외재화 (`SPRING_PROFILES_ACTIVE`, `DB_*`, `TICOIN_CORS_ORIGINS`, …)
- **logback-spring.xml** — local은 컬러 콘솔 + MDC deviceId, prod는 CloudWatch-friendly 한 줄 포맷
- **Build Info** — `springBoot.buildInfo` → `/actuator/info`에 버전·빌드 시각 노출
- **Graceful shutdown** + `management.endpoint.health.probes.enabled`로 liveness/readiness 분리
- **News fallback** — CryptoCompare 유료화 대응, Reddit r/CryptoCurrency 자동 폴백

### Frontend 실구현
- **Device ID util** — `lib/device.js`가 localStorage에 UUID 생성·캐시
- **Axios interceptor** — 모든 API 요청에 `X-Device-Id` 자동 주입
- **alertStore (Zustand)** — 알림 CRUD + 발동된 알림 히스토리 (최근 5개)
- **useLivePrices 확장** — `/topic/prices` 구독 + `/topic/alerts/{deviceId}` 구독 (발동 시 Toast)
- **가격 flash 펄스** — `mergeFeed`가 이전 가격과 비교해 변동 방향을 `flashes` 맵에 저장, `AssetCard`에서 900ms 동안 상승/하락 색상 강조
- **Alerts 페이지** (`/alerts`) — 목표가 ABOVE/BELOW 등록, 최근 발동 이력, 삭제
- **Mock 폴백 제거** — Portfolio/Watchlist가 이제 실제 DB만 사용, 에러 시 Toast로 알림
- **백엔드 연동 API 추가** — `alertApi` 래퍼

### AWS 운영 배포 준비
- **`docker-compose.prod.yml`** — 이미지 태그 주입 가능, 메모리 리밋, readiness probe, JVM 컨테이너 옵션
- **Nginx runtime env** — `nginx.conf.template` + `docker-entrypoint.sh` + `envsubst`로 `BACKEND_URL` 런타임 주입 (이미지 재빌드 없이 환경 전환)
- **프런트 `/healthz`** — ALB 타겟 헬스체크용
- **`.env.prod.example`** — 안전한 기본값
- **`deploy/aws-deploy.md`** — EC2 / ECS Fargate / App Runner 3가지 경로별 단계별 가이드
- **JVM 튜닝** — `-XX:MaxRAMPercentage=75.0` 컨테이너 친화 옵션
- **Prometheus endpoint** (prod 프로파일 전용) — 추후 CloudWatch Container Insights 연동 가능

### 주요 추가 파일
Backend: `DeviceIdFilter`, `DeviceIdArgumentResolver`, `PriceAlert`, `PriceAlertRepository`, `PriceAlertService`, `PriceAlertController`, `AlertCreateRequest`, `V2__device_identity_and_alerts.sql`, `application-local.yml`, `application-prod.yml`, `logback-spring.xml`, `RedditNewsClient`
Frontend: `lib/device.js`, `stores/alertStore.js`, `pages/Alerts.jsx`
Infra: `nginx.conf.template`, `docker-entrypoint.sh`, `docker-compose.prod.yml`, `.env.prod.example`, `deploy/aws-deploy.md`

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
