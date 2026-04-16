# Ticoin — 실시간 주식/암호화폐 소셜 대시보드

바이낸스 스타일 캔들차트, WebSocket 실시간 시세, AI 종목 분석 기능을 갖춘 소셜 대시보드
개발 버전: v0.3.0 (backend) / v0.2.0 (frontend)

---

## 프로젝트 버전 정보

| 항목 | 실제 버전 |
|------|-----------|
| Java | 21 (build.gradle toolchain) |
| Spring Boot | 3.4.1 (Gradle 8.11) |
| React | 18.3 |
| Vite | 6.0 |
| PostgreSQL | 16 |
| Flyway | Spring Boot BOM 관리 |
| jjwt | 0.12.6 |
| springdoc-openapi | 2.7.0 |
| Tailwind CSS | 3.4 |
| Zustand | 5 |
| i18next | 프론트엔드 다국어 (ko, en, ja) |

---

## Tech Stack

**Backend**
- Java 21, Spring Boot 3.4.1 (Gradle)
- Spring Data JPA + Hibernate (PostgreSQL 16, `ddl-auto: validate`)
- Spring WebFlux WebClient (외부 API 호출)
- Spring Security + JWT (jjwt 0.12.6) + OAuth2 (Google, Kakao)
- WebSocket/STOMP + SockJS (실시간 시세)
- Caffeine Cache (500 entries, 60s TTL)
- Flyway (DB 마이그레이션 V1~V6)
- Spring Actuator (health, info, metrics)
- springdoc-openapi 2.7.0 (Swagger UI)
- Lombok

**Frontend**
- React 18.3, Vite 6.0
- Tailwind CSS 3.4 (커스텀 디자인 토큰, CSS 변수, 다크모드)
- Zustand 5 (6개 Store: market, toast, alert, auth, profile, theme)
- React Router 6 (중첩 라우트, RootLayout)
- Axios (X-Device-Id + JWT 인터셉터)
- @stomp/stompjs + sockjs-client (STOMP)
- Binance WebSocket (wss://stream.binance.com 직접 연결)
- i18next + react-i18next (ko, en, ja)
- lucide-react (아이콘)
- Custom Canvas 캔들차트 (바이낸스 스타일, MA7/MA25)
- vite-plugin-pwa (PWA 지원)
- Playwright (E2E 테스트)
- clsx + tailwind-merge (클래스 합성)

**External APIs**
- CoinGecko, Yahoo Finance, CryptoCompare (시세)
- Reddit, Google News RSS (뉴스)
- Anthropic Claude API (AI 분석)

**Infra**
- Docker Compose (dev/prod 분리)
- GitHub Actions CI (Gradle build + Vite build + Playwright E2E + Docker image)
- Multi-stage Docker (gradle:8.11-jdk21 → temurin:21-jre-alpine / node:20-alpine → nginx:1.27-alpine)

---

## Project Structure

**Backend**
```
backend/src/main/java/com/ticoin/
├── client/           # 외부 API 클라이언트 (CoinGecko, Yahoo, CryptoCompare, Reddit, GoogleNews, Claude)
├── config/           # SecurityConfig, WebConfig, DeviceIdFilter, DeviceIdArgumentResolver
├── controller/       # Market, News, Portfolio, Watchlist, PriceAlert, Comment, Profile, Post, Auth, Ai
├── dto/              # Java records (요청/응답)
├── entity/           # JPA 엔티티 (Portfolio, Watchlist, PriceAlert, Comment, Profile, User, Post, PostLike, Follow)
├── exception/        # GlobalExceptionHandler + ErrorResponse
├── repository/       # Spring Data JPA 레포지토리
├── security/         # JwtAuthFilter, JwtService, OAuth2SuccessHandler
├── service/          # 비즈니스 로직
└── websocket/        # WebSocketConfig (STOMP) + PriceStreamService

backend/src/main/resources/
├── application.yml
├── application-local.yml
├── application-prod.yml
└── db/migration/     # Flyway V1~V6
```

**Frontend**
```
frontend/src/
├── api/              # axios.js (인터셉터), market.js, social.js
├── components/       # 20+ 컴포넌트 (charts/, skeletons/ 포함)
├── hooks/            # useLivePrices, useBinanceTicker, useBinanceKlines, useDebounce
├── i18n/             # ko.json, en.json, ja.json
├── layouts/          # RootLayout.jsx (Sidebar + Header + BottomNav)
├── lib/              # device.js, price.js, binance.js, utils.js, imageUtils.js, themeColors.js
├── pages/            # Home, Search, Trending, Portfolio, Watchlist, Alerts, Profile, Settings, Login, AuthCallback, NotFound
├── stores/           # Zustand: marketStore, toastStore, alertStore, authStore, profileStore, themeStore
└── styles/           # index.css (Tailwind + 커스텀 keyframes)
```

---

## Server Info

| 서비스 | 개발 포트 |
|--------|-----------|
| Frontend (Vite) | 5175 |
| Frontend (Docker/nginx) | 5174 |
| Backend | 8090 |
| PostgreSQL | 5433 (→ 5432) |

---

## Commands

```bash
# 전체 스택 (Docker)
docker compose up -d --build

# DB만
docker compose up -d postgres

# 백엔드 개발
cd backend && ./gradlew bootRun

# 프론트엔드 개발
cd frontend && npm install && npm run dev

# 백엔드 테스트
cd backend && ./gradlew test

# 프론트엔드 E2E
cd frontend && npx playwright test

# 프론트엔드 빌드
cd frontend && npm run build

# 프로덕션 배포
docker compose -f docker-compose.prod.yml up -d --build
```

---

## 코딩 컨벤션

### 공통 규칙

- **주석 금지**: 코드에 주석을 작성하지 않는다
- **에러 메시지 언어**: 한국어
- **커밋 메시지**: 한국어 설명 + prefix (`feat:`, `fix:`, `refactor:`, `chore:`)
- **경로 별칭**: 프론트엔드에서 `@` → `./src` (vite.config.js)

### 백엔드 규칙

#### 패키지 구조
```
client/       → 외부 API 호출 클라이언트
config/       → Spring 설정 (Security, Web, DeviceId)
controller/   → REST API 엔드포인트
dto/          → Java record (요청/응답 DTO)
entity/       → JPA 엔티티 (@Entity + Lombok)
exception/    → 예외 처리 (GlobalExceptionHandler + ErrorResponse)
repository/   → Spring Data JPA 인터페이스
security/     → JWT + OAuth2 (JwtAuthFilter, JwtService, OAuth2SuccessHandler)
service/      → 비즈니스 로직
websocket/    → WebSocket 설정 + 시세 스트리밍
```

#### DI 패턴
- `@RequiredArgsConstructor` + `private final` 필드 (전체 일관)

#### Controller 패턴
- `@RestController` + `@RequestMapping("/api/...")` + `@RequiredArgsConstructor`
- 성공 응답: 도메인 DTO 직접 반환 (ResponseEntity 래핑 없음)
- 얇은 컨트롤러: Service에 위임

#### DTO 패턴
- **Java record** 사용 (클래스 DTO 아님)
  ```java
  public record SendMessageRequest(String content, String type) {}
  ```

#### Entity 패턴
- JPA `@Entity` + `@Table` + Lombok (`@Getter`, `@Setter`, `@NoArgsConstructor`, `@AllArgsConstructor`, `@Builder`)
- `GenerationType.IDENTITY` PK
- `@PrePersist`로 타임스탬프 기본값
- `device_id` 컬럼 패턴 (비인증 디바이스 식별)

#### 에러 처리
- `@RestControllerAdvice` + `ErrorResponse` DTO
- 커스텀 예외 없이 RuntimeException 직접 throw

#### DB 마이그레이션
- Flyway (V1~V6), `ddl-auto: validate`

#### 캐싱
- Caffeine Cache (`@Cacheable`, `@CacheEvict`)
- 500 entries, 60초 TTL

### 프론트엔드 규칙

#### 컴포넌트 구조
- `export default function ComponentName()` (named export + function 선언)
- `.jsx` 확장자, TypeScript 미사용
- Hooks → useState → useEffect → 핸들러 → JSX 순서

#### 스타일링
- **Tailwind CSS** 인라인 클래스 (CSS Modules 아님)
- `clsx` + `tailwind-merge`로 조건부 클래스 합성
- 다크모드: `class` strategy
- CSS 변수로 디자인 토큰 관리 (tailwind.config.js)
- 폰트: Inter + JetBrains Mono

#### 상태 관리
- **Zustand** (전역 상태): 6개 Store (market, toast, alert, auth, profile, theme)
  - `create((set, get) => ({...}))` 패턴
  - async 액션 + try/catch + 폴백 데이터
- **서버 데이터**: API 호출 후 Store에 저장 (React Query 미사용)

#### API 호출
- Axios 인스턴스: `X-Device-Id` + JWT Bearer 인터셉터
- 401 시 자동 로그아웃
- API 모듈: 객체 리터럴 + 메소드별 엔드포인트, `r.data` 언래핑

#### 라우팅
- React Router 6 중첩 라우트
- `RootLayout.jsx`: Sidebar(데스크톱) + BottomNav(모바일) + Header 셸 + `<Outlet/>`
- 코드 스플리팅 미적용 (직접 import)

#### 다국어
- i18next (ko, en, ja), 브라우저 언어 자동 감지

#### WebSocket
- STOMP: `@stomp/stompjs` + `sockjs-client` (백엔드 시세)
- Binance: `wss://stream.binance.com` 직접 연결 (실시간 캔들/티커)
- 커스텀 훅: `useLivePrices`, `useBinanceTicker`, `useBinanceKlines`

### 파일/변수 네이밍

| 대상 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트/페이지 | PascalCase.jsx | `Home.jsx`, `CandleChart.jsx` |
| 훅 | camelCase + `use` 접두어 | `useLivePrices.js`, `useDebounce.js` |
| Store | camelCase + `Store` | `marketStore.js`, `authStore.js` |
| API 모듈 | camelCase | `market.js`, `social.js` |
| 유틸 | camelCase | `device.js`, `price.js`, `binance.js` |
| 레이아웃 | PascalCase | `RootLayout.jsx` |
| Java 클래스 | PascalCase + 역할 접미사 | `MarketController`, `JwtService` |
| Java record | PascalCase + Request/Response | `SendMessageRequest` |
| DB 테이블 | lower_snake_case | `price_alert`, `post_like` |

---

## Git Workflow

```
main        # 운영 배포 브랜치
develop     # 개발 통합 브랜치
feat/*      # 기능 개발
fix/*       # 버그 수정
```

**커밋 컨벤션**
```
feat: 실시간 캔들차트 구현
fix: WebSocket 연결 해제 버그 수정
refactor: MarketService 캐싱 로직 개선
chore: Docker 설정 업데이트
```

**CI/CD**: GitHub Actions (Gradle build + Vite build + Playwright E2E + Docker image build)

---

## 문서

- `README.md` — 프로젝트 개요, 기술 스택, 엔드포인트
- `docs/ARCHITECTURE.md` — 시스템 아키텍처, 데이터 플로우
- `docs/CHANGELOG.md` — 버전 변경 이력
- `docs/DEVELOPMENT-LOG.md` — 세션별 개발 로그
- `deploy/aws-deploy.md` — AWS 배포 가이드 (EC2/ECS/App Runner)
