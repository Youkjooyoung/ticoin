# Architecture

ticoin 시스템 구조 개요. 각 레이어의 책임, 데이터 흐름, 주요 의사결정.

---

## 1. 큰 그림

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (SPA)                         │
│                                                              │
│  ┌──────────┐  ┌────────┐  ┌────────────┐  ┌─────────────┐ │
│  │  React   │  │Zustand │  │ React Router│  │ Tailwind   │ │
│  │  18      │  │stores  │  │     6      │  │  CSS 3     │ │
│  └──────────┘  └────────┘  └────────────┘  └─────────────┘ │
│         │                                                    │
│         ├── axios (/api/*)  ──┐                             │
│         ├── SockJS (/ws)    ──┼── Vite dev proxy / Nginx    │
│         ├── Binance WS      ──┼── direct to binance.com     │
│         └── Binance REST    ──┘                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
          ┌────────────┴──────────────┐
          │                           │
┌─────────▼──────────┐     ┌──────────▼──────────┐
│  Nginx (frontend)   │    │  External APIs       │
│  port 80/5174       │    │  - api.binance.com   │
│  - static SPA       │    │  - api.coingecko.com │
│  - /api → backend   │    │  - query1.yahoo.com  │
│  - /ws → backend    │    │  - www.reddit.com    │
│  - /healthz         │    └──────────────────────┘
└─────────┬──────────┘
          │
┌─────────▼─────────────────────────────────────┐
│         Spring Boot backend (8090)             │
│                                                │
│  ┌─────────────────┐  ┌──────────────────┐   │
│  │ Controllers     │  │  WebSocket (STOMP)│   │
│  │ /api/market     │  │  /ws              │   │
│  │ /api/portfolio  │  │  /topic/prices    │   │
│  │ /api/watchlist  │  │  /topic/alerts/*  │   │
│  │ /api/alerts     │  └──────────────────┘   │
│  │ /api/comments   │                          │
│  │ /api/profile    │  ┌──────────────────┐   │
│  │ /api/news       │  │ Scheduled tasks  │   │
│  └────────┬────────┘  │ - PriceStream    │   │
│           │           │ - PriceAlert     │   │
│  ┌────────▼────────┐  └──────────────────┘   │
│  │ Services        │                          │
│  │ + device-scoped │  ┌──────────────────┐   │
│  └────────┬────────┘  │ External clients │   │
│           │           │ - CoinGecko      │   │
│  ┌────────▼────────┐  │ - Yahoo Finance  │   │
│  │ JPA Repositories│  │ - CryptoCompare  │   │
│  └────────┬────────┘  │ - Reddit         │   │
│           │           └──────────────────┘   │
│  ┌────────▼────────┐                          │
│  │  Caffeine cache │                          │
│  │  (60s TTL)      │                          │
│  └─────────────────┘                          │
└───────────┬────────────────────────────────────┘
            │ JDBC
┌───────────▼────────┐
│  PostgreSQL 16      │
│  - portfolio        │
│  - watchlist        │
│  - price_alert      │
│  - comment          │
│  - profile          │
│  - flyway_schema_history│
└─────────────────────┘
```

---

## 2. 레이어별 책임

### 2.1 Frontend

**React 18 + Vite 6 + Tailwind CSS 3** — shadcn/ui 없이 Tailwind 유틸리티만 사용. 컴포넌트 단위 파일 분할, 페이지별 라우팅.

**상태 관리**: Zustand 스토어 4개
- `marketStore` — 피드/코인/주식/트렌딩 + `flashes` (가격 변동 플래시 맵) + `updatePrice` / `mergeFeed`
- `alertStore` — 가격 알림 CRUD + 발동 이력 스택 (최근 5)
- `toastStore` — success/error/info 3초 토스트
- `profileStore` — 기기별 프로필 load/update

**라우팅**: React Router 6. `RootLayout`에서 Sidebar + BottomNav + Header 공통, 페이지만 Outlet. 7개 라우트 (Home/Search/Trending/Portfolio/Watchlist/Alerts/Profile) + 404.

**실시간 가격 흐름**:
1. `useBinanceTicker(symbols)` 훅이 `wss://stream.binance.com:9443/stream?streams=...` 단일 combined stream 구독
2. ticker 이벤트 수신 → `fromBinanceSymbol(d.s)`로 심볼 복원 → `marketStore.updatePrice(symbol, newPrice)`
3. updatePrice가 직전 가격과 비교해 `flashes[symbol] = 'up'|'down'` 설정
4. 600ms 후 `flashes[symbol]` 제거 → AssetCard의 `transition-colors duration-300`이 원래 색으로 복귀
5. 결과: 초당 수 회 가격 깜빡임 — 실제 거래소 수준의 반응성

**차트 흐름**:
1. `AssetCard` 내부에서 `useBinanceKlines(symbol, interval)` 훅 호출
2. Binance REST `/api/v3/klines?symbol=...&interval=...&limit=100`
3. 응답 배열을 `{time, open, high, low, close, volume}` 형태로 매핑
4. `<CandleChart data={candles} />`에 전달
5. `CandleChart`는 Canvas 2D로 직접 그림 (라이브러리 미사용) — ResizeObserver로 부모 크기 추적 후 dpr 보정

**레이아웃 토큰 (Tailwind config)**:
- `brand`: `#8B5CF6` (indigo-violet) + `brand-dark` `#7C3AED` + `brand-light` `#A78BFA` + `brand-soft` `#1E1B3A`
- `up`: `#10B981` / `down`: `#EF4444` (Binance 스타일, 한국식 빨=상승 아님에 주의)
- `bg` / `bg-elev` / `bg-soft` — 다크 전용 3단계 서피스
- 폰트: Inter (본문), JetBrains Mono (숫자)

### 2.2 Backend

**Spring Boot 3.4 + Java 21 + Gradle**. 모듈화는 최소화 — 의도적으로 "low-code" 접근. 패키지 루트 `com.ticoin`.

**패키지 구조**:
```
com.ticoin/
├── TicoinApplication.java        # @EnableCaching + @EnableScheduling
├── config/
│   ├── WebConfig                 # CORS + WebClient + ArgumentResolver 등록
│   ├── DeviceIdFilter            # OncePerRequestFilter + MDC
│   └── DeviceIdArgumentResolver  # @DeviceId 커스텀 어노테이션
├── controller/                   # REST 엔드포인트만, 로직 없음
├── service/                      # @Transactional, 비즈니스 로직
├── repository/                   # JpaRepository 파생 쿼리만
├── entity/                       # JPA 엔티티 (Lombok @Builder)
├── dto/                          # record — 요청/응답 DTO
├── exception/
│   ├── ErrorResponse             # record
│   └── GlobalExceptionHandler    # @RestControllerAdvice
├── client/                       # 외부 API WebClient wrappers
│   ├── CoinGeckoClient
│   ├── YahooFinanceClient        # 현재 401, 사실상 비활성
│   ├── CryptoCompareClient       # 유료화 후 폴백만
│   └── RedditNewsClient          # CryptoCompare 실패 시 주력
└── websocket/
    ├── WebSocketConfig           # STOMP /ws
    └── PriceStreamService        # @Scheduled 브로드캐스트
```

**Device Identity**: 인증 없이 기기별 격리. `X-Device-Id` 헤더를 `DeviceIdFilter`가 MDC에 저장, `@DeviceId` 커스텀 argument resolver가 컨트롤러 파라미터에 주입. 엔티티들은 `device_id` 컬럼을 가지며 모든 쿼리가 이 값으로 스코프된다.

```java
public interface PortfolioRepository extends JpaRepository<Portfolio, Long> {
    List<Portfolio> findByDeviceIdOrderByCreatedAtDesc(String deviceId);
    long deleteByIdAndDeviceId(Long id, String deviceId);
}
```

커스텀 JPQL/Specification 없이 **파생 쿼리만** 사용 — Spring Data JPA의 method name 파싱만으로 충분. 이게 low-code의 핵심.

**Caching**: Caffeine 로컬 캐시, 60초 TTL. `CoinGeckoClient.fetchMarkets`, `fetchTrending`, `fetchOhlc`에 `@Cacheable`. 외부 API 레이트 리밋 방어.

**Scheduled jobs**:
- `PriceStreamService.broadcastPrices()` — 15초 주기로 `MarketService.getFeed()` 재조회 후 `/topic/prices`로 브로드캐스트 (백엔드 backup 채널. 실제로는 프론트가 Binance 직결을 주로 씀)
- `PriceAlertService.checkAlerts()` — 20초 주기로 `triggered=false`인 알림 전체 조회, 현재가 맵 대조, 조건 충족 시 `/topic/alerts/{deviceId}`로 개별 푸시

**Database**: PostgreSQL 16 + **Flyway** 마이그레이션. `ddl-auto: validate`로 엔티티와 스키마 불일치 시 기동 실패.

현재까지 마이그레이션:
- `V1__init.sql` — portfolio, watchlist 테이블
- `V2__device_identity_and_alerts.sql` — device_id 컬럼 추가 + price_alert 테이블 + watchlist 유니크 제약 재설정
- `V3__comments_and_profile.sql` — comment, profile 테이블

기존 DB 위에 덮어도 무중단으로 스키마 진화.

### 2.3 Infrastructure

**Docker Compose** 3-티어 (`postgres` + `backend` + `frontend`). `depends_on` + healthcheck 체인으로 기동 순서 보장.

**Frontend Dockerfile**: multi-stage (Node builder + Nginx runner). 핵심은 **런타임 환경 변수 주입** — Vite 빌드는 환경 변수를 정적으로 박아버리는 게 기본이지만, `nginx.conf.template`에 `${BACKEND_URL}` 토큰을 두고 컨테이너 시작 시 `docker-entrypoint.sh`에서 `envsubst`로 `default.conf`를 생성하는 방식으로 **같은 이미지를 환경별 재사용** 가능.

**Backend Dockerfile**: `gradle:8.11-jdk21` → `eclipse-temurin:21-jre-alpine`. `bootJar` 산출물 `app.jar` 복사.

**Nginx**: frontend 컨테이너 내에서 SPA 정적 서빙 + `/api` → `backend:8090/api` 프록시 + `/ws` WebSocket 프록시 + `/healthz` ALB 헬스체크 + `/actuator` 투과.

---

## 3. 주요 데이터 흐름

### 3.1 사용자가 홈에 접속했을 때

1. 브라우저 → `GET /` → Nginx → `index.html`
2. 번들된 JS 로드 → `App.jsx` 렌더 → `RootLayout` → `Home`
3. `Home`의 `useEffect`가 `loadFeed()` 호출
4. `loadFeed` → `axios.get('/api/market/feed')` → Vite dev proxy/Nginx → `backend:8090/api/market/feed`
5. `MarketController.feed()` → `MarketService.getFeed()` → `CoinGeckoClient.fetchMarkets(DEFAULT_COINS)` (캐시 히트 시 즉시 반환)
6. 응답 받은 `feed` 배열이 `marketStore`에 저장 → Home이 리렌더 → `StoryBar` + `AssetCard` 리스트
7. 동시에 `useLivePrices()`가 SockJS + STOMP로 backend `/ws` 구독 (알림 용도)
8. 동시에 `useBinanceTicker(cryptoSymbols)`가 Binance combined stream 구독 → 초당 수 회 `updatePrice` 호출 → AssetCard 실시간 깜빡임

### 3.2 사용자가 포트폴리오를 추가할 때

1. Portfolio 페이지 → "+ 추가" → 폼 열림
2. `SymbolSelect`에서 BTC 선택 → `form.symbol = 'BTC'` + `refPrice = priceMap['BTC'].price`
3. `PriceInput`이 `refPrice`에 따라 `step` 자동 계산 (예: $74000대 → step=10)
4. 사용자 "수량 0.5, 평단가 60000" 입력 → 저장 클릭
5. `portfolioApi.create(payload)` → axios가 `X-Device-Id` 자동 주입 → `POST /api/portfolio`
6. `DeviceIdFilter`가 헤더 추출 → request attribute + MDC에 저장
7. `PortfolioController.create(@DeviceId String deviceId, @Valid @RequestBody PortfolioCreateRequest)`
8. `PortfolioService.create(deviceId, req)` → `Portfolio.builder()...` → `portfolioRepository.save(p)`
9. JPA가 INSERT → 응답으로 생성된 엔티티 반환
10. 프론트가 `holdings` 상태에 prepend → 토스트 "BTC을(를) 추가했습니다"

### 3.3 가격 알림 발동 흐름

1. 사용자가 `/alerts`에서 "BTC ABOVE $80,000" 등록
2. `PriceAlertService.create()` → INSERT → `triggered=false`로 저장
3. `@Scheduled(fixedDelay=20s)` 주기 도달 → `checkAlerts()` 실행
4. `alertRepository.findByTriggeredFalse()` → 활성 알림 전체 조회
5. `marketService.getFeed()` → 현재 가격 맵 생성 (CoinGecko 캐시 히트면 즉시)
6. 각 알림 순회 → `current.compareTo(target) >= 0` 체크
7. 조건 충족 → `alert.setTriggered(true)` + `triggeredAt = now` → JPA dirty checking으로 UPDATE
8. `messagingTemplate.convertAndSend("/topic/alerts/" + deviceId, payload)`
9. 해당 `deviceId`로 SockJS 구독 중인 브라우저가 수신
10. `useLivePrices`의 구독 콜백에서 `alertStore.pushTriggered(evt)` + `toastStore.success(...)`
11. 우상단 Toast + 알림 드롭다운에 빨간 dot

---

## 4. 주요 의사결정 기록

### 4.1 왜 Binance 직결인가?
백엔드 브로드캐스트 15초 간격은 "실제 거래소 느낌"에 못 미침. CoinGecko는 무료 레이트 리밋 때문에 1초 주기로 호출 불가. Binance WebSocket은 초당 수 회 tick을 무료로 public stream으로 제공하므로 **프론트엔드에서 직접 구독**하는 게 가장 단순하고 빠름.

트레이드오프: Binance가 CORS를 막으면 즉시 영향. 백업으로 backend `/topic/prices` (15초 폴링)도 유지해서 이중화.

### 4.2 왜 Device ID인가, 왜 인증 없나?
사용자 요구: "로그인/회원가입 기능은 제외 (추후 예정)". 하지만 포트폴리오/관심목록은 기기별로 격리돼야 함. 해결:
- 브라우저 `crypto.randomUUID()`로 기기별 UUID 생성, localStorage 영속
- 모든 API 요청에 `X-Device-Id` 헤더 자동 주입 (axios interceptor)
- 백엔드는 이 값을 "가상 user_id"로 취급, 모든 조회/수정 쿼리에 스코프로 포함

나중에 진짜 인증을 추가하면 `DeviceIdFilter` 자리에 `SecurityFilter` 넣고 `@AuthenticationPrincipal`로 대체만 하면 됨. 구조는 그대로 유지.

### 4.3 왜 Spring Data 파생 쿼리만 쓰는가?
사용자 지시: "low-code로 구현". JPQL/Criteria/Specification은 모두 추가 코드가 필요. 파생 쿼리(메서드 이름 기반)는 **코드가 메서드 시그니처 한 줄**. 복잡한 쿼리가 필요하면 그때 가서 @Query를 고려하되, 현재까지는 모든 CRUD가 파생 쿼리로 해결됨.

### 4.4 왜 Tailwind만, shadcn/ui는 안 쓰는가?
Figma Make 원본이 shadcn 기반이었지만 그대로 가져오려면 Radix UI 의존성이 많고 번들 크기가 커짐. 사용자가 지정한 Tailwind + React로 컴포넌트를 자체 작성하는 게 유지보수상 더 단순. 모달/드롭다운은 순수 React state + CSS로 충분.

### 4.5 왜 PostgreSQL인가?
사용자 지정. 외에도:
- JSONB 컬럼이 필요할 때 대비 (프로필 확장 등)
- Flyway + PostgreSQL은 가장 문서화가 잘된 조합
- RDS / Aurora 전환이 쉬움
- 주식/코인 OHLC 히스토리를 저장하게 되면 timescaledb 확장도 선택지

---

## 5. 성능 / 확장성 고려사항

### 5.1 현재 부하 수준
개인/포트폴리오 프로젝트 수준. 동시 사용자 ~10명 가정.

### 5.2 캐시 전략
- Caffeine 60초 TTL이 CoinGecko 레이트 리밋(분당 10~30콜) 방어의 1차 방어선
- Spring `@Cacheable` 키: `markets(ids)`, `trending`, `ohlc(id + days)`
- 캐시 히트 시 외부 API 호출 없이 즉시 반환

### 5.3 DB 인덱스
- `portfolio (device_id)` — 사용자 조회
- `watchlist (device_id, symbol)` unique — 중복 방지 + 조회 최적
- `price_alert (device_id)` + `(triggered) WHERE triggered = false` 부분 인덱스 — 스케줄러 조회 최적화
- `comment (symbol)` — 종목별 댓글 조회

### 5.4 WebSocket 확장
현재는 Spring `SimpleBrokerMessageHandler` — 단일 인스턴스 메모리 기반. 여러 인스턴스로 확장하려면 RabbitMQ/Redis broker relay 필요하지만 현재 규모엔 불필요.

### 5.5 프론트 번들
- Vite 코드 스플리팅 자동 (페이지별 청크)
- Binance WebSocket은 심볼 변경 시 재연결 (상대적으로 비쌈) — `symbolsKey = symbols.join(',')`로 메모이즈
- `marketStore.flashes` 정리는 setTimeout + 함수형 set으로 stale closure 방지

---

## 6. 보안 / 운영 체크리스트

- [x] CORS allowed-origins는 환경변수 (`TICOIN_CORS_ORIGINS`)로 외재화
- [x] DB 패스워드는 환경변수, `.env.prod.example`만 커밋
- [x] Actuator `/info`는 build info까지만 노출, `/env`/`/heapdump`는 비활성
- [x] `ddl-auto: validate` — 앱이 스키마를 함부로 수정하지 않음
- [x] `management.endpoint.health.probes.enabled` — liveness/readiness 분리 (ECS/ALB용)
- [x] Graceful shutdown — 배포 시 in-flight 요청 보호
- [x] Prod logback은 한 줄 포맷 → CloudWatch Logs Insight 쿼리 친화
- [ ] Rate limiting (Bucket4j 등) — 현재 미적용, 공개 서비스화 시 필수
- [ ] 인증 도입 — 현재는 device_id 기반, Cognito/Spring Security로 전환 예정
- [ ] HTTPS 종단 — ALB + ACM 또는 Caddy (deploy/aws-deploy.md 참조)
- [ ] CSP 헤더 — Nginx 설정 추가 예정

---

## 7. 알려진 한계 / 기술 부채

1. **Yahoo Finance 401**: 비공식 API가 인증을 요구하기 시작 → 주식 시세 사실상 비활성. **Finnhub 또는 Alpha Vantage로 전환 필요**
2. **CryptoCompare 유료화**: 뉴스 API가 auth key를 요구 → Reddit 폴백으로 운영 중. Reddit은 뉴스가 아니라 "토론"이라 품질이 다름. **NewsData.io 같은 전용 뉴스 API 평가 필요**
3. **주식 차트 데이터 소스 없음**: Binance는 코인만 있음. 주식은 Yahoo가 막혀서 현재 fallback mock 표시. **Finnhub candles API로 교체 필요**
4. **로그인 없음**: 여러 기기에서 동일 포트폴리오 공유 불가. 기기 데이터 이관 기능도 없음. **인증 도입과 함께 데이터 병합 기능도 필요**
5. **Binance에 의존**: 프론트가 Binance WebSocket/REST에 직결하므로 Binance가 서비스 차단 시 즉시 영향. **백엔드 프록시 경로(이미 존재)로 폴백하는 로직 추가 필요**
6. **테스트 커버리지 낮음**: backend 통합 테스트 2개뿐, frontend 테스트 0개. **Vitest + React Testing Library 도입 예정**
7. **Gradle Wrapper jar 미포함**: 바이너리 파일이라 문서에만 안내. 개발 환경 세팅 시 1회 `gradle wrapper` 실행 필요
8. **단일 Postgres 인스턴스**: 복제/백업 없음. RDS 전환 시 자동 백업 활성화
