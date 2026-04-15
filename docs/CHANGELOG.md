# Changelog

ticoin 프로젝트의 버전별 변경사항. 최신 버전이 위에 있습니다.

Conventional Commits 규칙에 따라 `feat` / `fix` / `chore` / `docs` / `test` / `refactor`로 분류.

---

## [0.4.0] — 2026-04-15 (오후)

사용자 피드백 기반 **대규모 UX 수정** + 실시간 거래소급 가격 반영.

### feat(frontend)
- **Binance WebSocket 직결** (`useBinanceTicker`): 초당 수 회 가격 업데이트. 실제 거래소 수준의 반응성. 서버 broadcast(15초) 대신 브라우저가 `wss://stream.binance.com:9443/stream`에 직접 구독
- **Binance REST klines** (`useBinanceKlines`): 15M / 1H / 4H / 1D / 1W 인터벌별로 실제 OHLC 데이터 로드. CORS 허용, 키 불필요
- **`SymbolSelect` 컴포넌트**: `marketStore.feed`에서 심볼 목록을 읽어 `<select>` 드롭다운으로 렌더. 각 옵션에 현재가까지 표시
- **`PriceInput` 컴포넌트**: 참조가격에 따라 `step` 자동 계산 (1000만↑→1만, 100원→1원, 0.01→0.0001 등), `min="0"`으로 음수 차단
- **`getPriceStep(price)`** 유틸: 가격 크기별 호가 단위 계산 lookup
- **`CommentPanel`** + 백엔드 댓글 API: AssetCard 댓글 버튼 클릭 시 슬라이드-아웃, Enter로 전송, 본인 댓글만 삭제 가능
- **`QuickCreateDropdown`**: 헤더 `+` 버튼 — 포트폴리오/관심목록/알림/검색 4개 빠른 이동 메뉴
- **`NotificationDropdown`**: 헤더 🔔 버튼 — `alertStore.triggered` 실시간 알림 목록, "모두 읽음", "모든 알림 보기"
- **Sidebar 로고 `<NavLink to="/">`**: 좌측 상단 "ticoin" 클릭 시 홈으로
- **Search 자동완성**: 입력 즉시 (비-디바운스) 상위 8개 드롭다운, 클릭 시 `AssetDetailModal`
- **Trending 카드 클릭** → `AssetDetailModal`
- **`ProfileStore` + 편집 모달**: 닉네임 / 자기소개 / 아바타 업로드 (FileReader→base64, 500KB 제한). 설정 메뉴 4개 버튼 전부 활성화 (계정 설정 / 알림 토글 / 다크 모드 / 도움말 / 로그아웃 모달)
- **가격 flash 펄스**: Binance 가격 변동 시 900ms 동안 상승/하락 색상 강조 (marketStore `updatePrice` + `flashes` 맵)

### feat(backend)
- **`Comment` 엔티티** + `CommentController` / `CommentService` / `CommentRepository` — 심볼별 device-scoped 댓글
- **`Profile` 엔티티** + `ProfileController` / `ProfileService` — 기기별 닉네임/자기소개/아바타 (getOrCreate 패턴)
- **Flyway V3** (`V3__comments_and_profile.sql`): `comment`, `profile` 테이블 생성. 기존 V1+V2 위에 자동 적용
- **DTOs**: `CommentCreateRequest`, `ProfileUpdateRequest` (record + jakarta validation)

### fix
- **`CandleChart` canvas width=0 버그**: 최초 `useEffect` 실행 시점에 `getBoundingClientRect()`가 0을 반환하는 타이밍 이슈. **`ResizeObserver`로 부모 크기를 추적**하도록 전면 수정
- **Docker frontend CRLF 버그**: `docker-entrypoint.sh`가 Windows CRLF로 커밋되어 Linux 컨테이너에서 `exec: no such file or directory` 실패. Dockerfile에 `sed -i 's/\r$//'` 추가

### chore
- `.claude/launch.json` — Preview 패널용 Vite dev 서버 설정 (port 5175, strictPort로 Docker 5174와 공존)

### docs
- `docs/CHANGELOG.md`, `docs/DEVELOPMENT-LOG.md`, `docs/ARCHITECTURE.md` 신규 작성

### 추가/수정된 파일

**Backend (11개 신규 + 1개 수정)**
- `entity/Comment.java`, `entity/Profile.java`
- `repository/CommentRepository.java`, `repository/ProfileRepository.java`
- `service/CommentService.java`, `service/ProfileService.java`
- `controller/CommentController.java`, `controller/ProfileController.java`
- `dto/CommentCreateRequest.java`, `dto/ProfileUpdateRequest.java`
- `db/migration/V3__comments_and_profile.sql`

**Frontend (15개 신규 + 13개 수정)**
- 신규: `lib/price.js`, `lib/binance.js`, `hooks/useBinanceKlines.js`, `hooks/useBinanceTicker.js`, `components/SymbolSelect.jsx`, `components/PriceInput.jsx`, `components/CommentPanel.jsx`, `components/NotificationDropdown.jsx`, `components/QuickCreateDropdown.jsx`, `stores/profileStore.js`
- 수정: `api/market.js`, `stores/marketStore.js`, `components/Sidebar.jsx`, `components/Header.jsx`, `components/AssetCard.jsx`, `components/charts/CandleChart.jsx`, `pages/Home.jsx`, `Search.jsx`, `Trending.jsx`, `Portfolio.jsx`, `Watchlist.jsx`, `Alerts.jsx`, `Profile.jsx`, `vite.config.js`

### Git 이력
```
0b3658e merge: ticoin v0.4.0 ux fixes (realtime binance, dropdowns, comments, profile)
6528bb2 fix(infra): strip crlf from docker-entrypoint.sh during build
23fa67b chore: add preview launch config for ticoin frontend dev server
f15bfb7 feat(frontend): pages with symbol dropdown, price tick step, search autocomplete, trending click, profile editor
0ec7b1f feat(frontend): sidebar logo link, active header dropdowns, asset card comments and live klines, resizeobserver chart
e68b6f5 feat(frontend): add binance realtime hooks, shared symbol/price/comment/notification components
fdecffb feat(backend): add comments and profile endpoints with flyway v3
```

---

## [0.3.0] — 2026-04-15

스켈레톤을 **진짜 동작하는 앱**으로 전환 + AWS 운영 배포 준비.

### feat(backend)
- **Device Identity 필터**: `X-Device-Id` 헤더 기반 `DeviceIdFilter` + `@DeviceId` argument resolver. 로그인 없이 기기별 데이터 격리. MDC 로깅에 `deviceId` 자동 주입
- **Price Alerts**: `PriceAlert` 엔티티 + CRUD 컨트롤러 + `@Scheduled(fixedDelay=20s)` 체커 서비스. 목표가 도달 시 `/topic/alerts/{deviceId}` WebSocket 푸시 (Condition = ABOVE / BELOW)
- **Flyway V2**: `V2__device_identity_and_alerts.sql`. V1 위에 무중단으로 `device_id` 컬럼 추가 + `price_alert` 테이블 생성 + watchlist 유니크 제약 재설정
- **Portfolio/Watchlist 재작성**: 파생 쿼리 (`findByDeviceIdOrderByCreatedAtDesc`, `deleteByIdAndDeviceId`)로 low-code, 전부 device_id 스코프
- **Multi-profile**: `application-local.yml` / `application-prod.yml` 분리. 모든 주요 값 환경변수 외재화 (`SPRING_PROFILES_ACTIVE`, `DB_*`, `TICOIN_CORS_ORIGINS`, `TICOIN_WS_INTERVAL_MS`, `TICOIN_ALERT_INTERVAL_MS`)
- **`logback-spring.xml`**: local은 컬러 콘솔 + MDC deviceId, prod는 CloudWatch-friendly 한 줄 포맷
- **Build Info**: `springBoot.buildInfo` → `/actuator/info`에 버전·빌드 시각 노출
- **Graceful shutdown** + `management.endpoint.health.probes.enabled` (liveness/readiness 분리)

### feat(frontend)
- **Device ID 유틸** (`lib/device.js`): localStorage UUID 자동 생성·캐시
- **Axios interceptor**: 모든 API 요청에 `X-Device-Id` 자동 주입
- **`alertStore`** (Zustand): CRUD + 발동된 알림 이력 (최근 5개)
- **`useLivePrices` 확장**: `/topic/prices` + `/topic/alerts/{deviceId}` 이중 구독. 알림 시 Toast
- **가격 flash 펄스** (초기 버전): `mergeFeed`가 이전 가격과 비교해 `flashes` 맵 업데이트, AssetCard에서 색상 강조
- **Alerts 페이지** (`/alerts`): ABOVE/BELOW 조건 등록, 최근 발동 이력, 삭제
- **Mock 폴백 제거**: Portfolio/Watchlist가 실제 DB만 사용. 실패 시 Toast

### feat(infra / AWS)
- **`nginx.conf.template`** + `docker-entrypoint.sh` + `envsubst`: `BACKEND_URL` 런타임 주입 — 이미지 재빌드 없이 환경 전환
- **`docker-compose.prod.yml`**: 이미지 태그 주입 가능, 메모리 리밋, readiness probe, JVM 컨테이너 옵션 (`-XX:MaxRAMPercentage=75.0`)
- **`/healthz`**: Nginx ALB 헬스체크용
- **`.env.prod.example`**: 안전한 기본값 + 주석
- **`deploy/aws-deploy.md`**: EC2 / ECS Fargate / App Runner 3가지 경로별 단계별 가이드 (월 비용, 체크리스트, 롤백)

### fix
- **CryptoCompare API 유료화 대응**: `/data/v2/news/`가 auth key를 요구하기 시작해 타입 캐스팅 예외 발생. 에러 응답 가드 + **Reddit r/CryptoCurrency 폴백**(`RedditNewsClient`) 자동 전환

---

## [0.2.0] — 2026-04-15 (새벽)

v0.1 스캐폴드에 품질 향상 작업. 실제로는 **04:00 예약 작업이 권한 프롬프트로 실패**해서 다음날 수동으로 동일 범위 재구현함.

### feat(backend)
- **Global exception handler**: `@RestControllerAdvice` + `ErrorResponse` record (400/404/500 통합, `MethodArgumentNotValidException`은 필드별 에러 목록)
- **DTO 유효성 검증**: `PortfolioCreateRequest`, `WatchlistCreateRequest` records with `@NotBlank`, `@DecimalMin`, `@Size`. 컨트롤러에서 `@Valid`. 엔티티 직접 받지 않음
- **Flyway 마이그레이션** 도입 + `ddl-auto: validate`. `V1__init.sql`에 portfolio, watchlist 테이블 생성
- **Actuator + springdoc-openapi**: `/actuator/health`, `/swagger-ui.html`, `/v3/api-docs`
- **WebSocket STOMP** (`WebSocketConfig` + `PriceStreamService`): `/ws` SockJS 엔드포인트, `/topic/prices` 15초 주기 브로드캐스트
- **통합 테스트**: `MarketControllerTest`, `PortfolioControllerTest` (MockMvc + H2 프로파일)
- **Gradle wrapper properties** (jar 바이너리는 별도 안내)

### feat(frontend)
- **AssetDetailModal**: AssetCard 클릭 시 fade-in + scale-in. 큰 CandleChart (380px), 24h 스탯 그리드, 관심목록/포트폴리오 추가 버튼
- **`useLivePrices`** WebSocket 훅 (`@stomp/stompjs` + `sockjs-client`)
- **`useDebounce`** (300ms) + Search 통합
- **`LineChart`** (SVG) + Portfolio 7일 수익률 섹션
- **Toast 시스템** (`stores/toastStore.js` + `<ToastContainer />`): success/error/info, 3초 자동 닫힘
- **ErrorBoundary** (클래스형) + **NotFound 404** 페이지, App.jsx 루트 래핑
- **스켈레톤 로더**: `AssetCardSkeleton`, `ListSkeleton`, `NewsSkeleton`
- **Watchlist ↑↓ 재정렬** + `localStorage['ticoin-watchlist-order']` 영속화

### fix
- **StockModal 자동 스크롤 버그**: (이전 `stock-dashboard-react` 프로젝트 경험 이식) 내부 `.chat-message-list`에 자체 scrollTop 제한, `modalBodyRef` + `useLayoutEffect`로 `scrollTop=0` 반복 리셋, `overflow-anchor: none`

---

## [0.1.0] — 2026-04-14

초기 스캐폴드. Figma AI로 만든 디자인(FinGram 기반)을 풀스택 프로젝트로 전환.

### feat(backend)
- Spring Boot 3.4 + Java 21 + PostgreSQL 16 + Gradle 기본 구조
- `entity/Portfolio`, `entity/Watchlist` JPA 엔티티
- 컨트롤러 4개: `MarketController`, `NewsController`, `PortfolioController`, `WatchlistController`
- 외부 API 클라이언트 3개: `CoinGeckoClient`, `YahooFinanceClient`, `CryptoCompareClient`
- `@Cacheable` Caffeine 60초 TTL
- CORS 설정, `application.yml` 기본값

### feat(frontend)
- React 18 + Vite 6 + Tailwind CSS 3 + Zustand + React Router 6
- 페이지 6개: Home / Search / Trending / Portfolio / Watchlist / Profile
- 컴포넌트: Sidebar, BottomNav, Header, StoryBar, AssetCard
- 차트: Canvas 기반 `CandleChart` (Binance 스타일, MA7/MA25, 볼륨), SVG `MiniChart`
- `marketStore` (zustand) + mock 폴백 데이터
- Axios + Vite `/api` 프록시
- lucide-react 아이콘, Figma 원본 다크 + 퍼플(#8B5CF6) 팔레트

### feat(infra)
- `docker-compose.yml` (postgres + backend + frontend)
- Backend Dockerfile (gradle build + alpine jre)
- Frontend Dockerfile (nginx 정적 서빙)

### 알려진 한계
- CoinMarketCap 뉴스 API는 Pro 전용이라 무료로 사용 불가 → CryptoCompare로 대체 (추후 유료화 문제로 v0.3에서 Reddit 폴백 추가됨)
- Yahoo Finance `query1.finance.yahoo.com/v7/finance/quote` 비공식 API가 점점 401을 내기 시작 (v0.3 이후 프론트가 Binance 직결로 우회)
