# ticoin · 주식 & 코인

Figma AI 디자인 기반으로 만든 주식/코인 실시간 소셜 대시보드.

## 기술 스택

**Frontend**
- React 18 + Vite 6
- Tailwind CSS 3
- Zustand (상태관리)
- React Router 6
- Axios
- lucide-react (아이콘)
- Canvas 기반 커스텀 캔들스틱 차트 (Binance 스타일)

**Backend**
- Java 21
- Spring Boot 3.4
- Spring Data JPA
- Spring WebFlux (WebClient, 외부 API 호출용)
- PostgreSQL 16
- Caffeine Cache (외부 API 응답 캐싱)
- Lombok
- Gradle

**Infra**
- Docker Compose (postgres + backend + frontend)
- Nginx (프론트엔드 서빙 + API 프록시)

## 외부 API

| 데이터 | 1순위 | 대체 |
| --- | --- | --- |
| 코인 시세 | **CoinGecko** (무료, 키 불필요) | — |
| 코인 OHLC | **CoinGecko `/coins/{id}/ohlc`** | — |
| 주식 시세 | **Yahoo Finance** `query1.finance.yahoo.com` (비공식, 무료) | Alpha Vantage |
| 주식 차트 | **Yahoo Finance** `/v8/finance/chart` | — |
| 암호화폐 뉴스 | **CryptoCompare News API** (무료) | CoinMarketCap (유료), RSS |

> CoinMarketCap 뉴스는 Pro 플랜에만 열려 있어 기본적으로 **CryptoCompare**를 사용. 필요시 `CMC_API_KEY` 환경변수로 전환 가능.

## 구조

```
ticoin/
├── backend/        # Spring Boot (Java 21, port 8090)
│   ├── src/main/java/com/ticoin/
│   │   ├── client/      # 외부 API 클라이언트
│   │   ├── config/      # CORS, WebClient
│   │   ├── controller/  # REST 엔드포인트
│   │   ├── dto/         # 응답 DTO (records)
│   │   ├── entity/      # JPA 엔티티
│   │   ├── repository/
│   │   └── service/
│   └── Dockerfile
├── frontend/       # React + Vite (port 5174)
│   ├── src/
│   │   ├── api/         # axios 래퍼
│   │   ├── components/  # 재사용 컴포넌트
│   │   │   └── charts/  # CandleChart, MiniChart
│   │   ├── layouts/     # RootLayout
│   │   ├── pages/       # Home, Search, Trending, Portfolio, Watchlist, Profile
│   │   ├── stores/      # zustand (marketStore)
│   │   ├── lib/         # utils (cn, fmtPrice, ...)
│   │   └── styles/      # tailwind globals
│   └── Dockerfile
└── docker-compose.yml
```

## 실행

### Docker Compose (전체)
```bash
docker compose up -d --build
# frontend → http://localhost:5174
# backend  → http://localhost:8090
# postgres → localhost:5433
```

### 로컬 개발 (Vite HMR + Spring Boot)
```bash
# 1. Postgres만 Docker로
docker compose up -d postgres

# 2. 백엔드
cd backend
./gradlew bootRun

# 3. 프론트엔드 (새 터미널)
cd frontend
npm install
npm run dev
# → http://localhost:5174
```

프론트엔드 Vite 서버는 `/api` 요청을 `http://localhost:8090`으로 프록시합니다.

## 주요 엔드포인트

| Method | Path | 설명 |
| --- | --- | --- |
| GET | `/api/market/feed` | 전체 피드 (코인 + 주식) |
| GET | `/api/market/coins` | 코인 목록 |
| GET | `/api/market/stocks` | 주식 목록 |
| GET | `/api/market/trending` | 트렌딩 |
| GET | `/api/market/candles?symbol=X&type=CRYPTO&interval=1D` | OHLC 캔들 |
| GET | `/api/market/search?q=...` | 검색 |
| GET | `/api/news?category=BTC` | 뉴스 |
| GET/POST/DELETE | `/api/portfolio` | 포트폴리오 CRUD |
| GET/POST/PATCH/DELETE | `/api/watchlist` | 관심목록 CRUD |

## 페이지

| Path | 설명 |
| --- | --- |
| `/` | 피드 (StoryBar + AssetCard 리스트) |
| `/search` | 검색 + 트렌딩/최근 검색 탭 |
| `/trending` | 최고 상승, 실시간 랭킹, 하락 종목 |
| `/portfolio` | 총자산, 자산배분 도넛, 보유자산 CRUD |
| `/watchlist` | 관심자산, 목표가, 알림 토글 |
| `/profile` | 프로필, 뉴스 피드, 설정 |

## 디자인 가이드

- Figma Make 원본 디자인 그대로 유지 (다크 + 퍼플 액센트)
- 주색상 브랜드: `#8B5CF6` (indigo-violet)
- 상승/하락: `#10B981` / `#EF4444` (바이낸스 스타일)
- 캔들 차트는 Canvas 기반으로 직접 구현 (Binance 스타일, MA7/MA25 오버레이 포함)
