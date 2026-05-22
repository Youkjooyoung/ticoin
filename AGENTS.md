# Ticoin Codex 작업 지침

Ticoin은 Binance 실시간 코인 시세, Yahoo Finance 주식 시세, 소셜 피드, 포트폴리오, 관심목록, 가격 알림, OpenAI 기반 AI 분석을 제공하는 React/Spring Boot 대시보드입니다.

## 작업 시작 전 Read 규칙

- 모든 작업 전 루트 `AGENTS.md`를 먼저 읽습니다.
- 작업 범위와 관련된 `.md` 문서를 먼저 읽습니다. 아키텍처 변경은 `docs/ARCHITECTURE.md`, 배포 변경은 `deploy/aws-deploy.md`, 변경 이력은 `docs/CHANGELOG.md`를 확인합니다.
- 사용하는 Codex Skill이 있으면 해당 `SKILL.md`를 먼저 읽습니다.
- Figma, GitHub, OpenAI 관련 작업은 해당 플러그인/스킬 지침을 먼저 읽고 진행합니다.
- 새로 생성된 Skill 또는 Markdown 문서가 있으면 작업 전에 읽고 현재 작업 규칙에 반영합니다.

## Tech Stack

### Backend

- Java 21, Spring Boot 3.4.1, Gradle 8.11
- Spring Web, WebFlux WebClient, Spring Data JPA, Hibernate
- PostgreSQL 16, Flyway, `ddl-auto: validate`
- Spring Security, JWT, OAuth2 Google/Kakao
- WebSocket/STOMP, SockJS
- Caffeine Cache, Spring Actuator, springdoc-openapi
- External APIs: CoinGecko, Yahoo Finance, CryptoCompare, Reddit, Google News, OpenAI

### Frontend

- React 18.3, Vite 6, JavaScript JSX
- Tailwind CSS 3.4, CSS variables, dark mode class strategy
- Zustand stores: market, toast, alert, auth, profile, theme
- React Router 6, Axios, i18next, lucide-react
- Canvas candle chart, STOMP/SockJS, Binance WebSocket hooks
- Playwright E2E

## Project Structure

### Backend

```text
backend/src/main/java/com/ticoin/
├── client/       외부 API 클라이언트
├── config/       Spring 설정
├── controller/   REST API 엔드포인트
├── dto/          Java record DTO
├── entity/       JPA 엔티티
├── exception/    전역 예외 처리
├── repository/   Spring Data JPA
├── security/     JWT/OAuth2
├── service/      비즈니스 로직
└── websocket/    STOMP 설정과 가격 스트리밍
```

### Frontend

```text
frontend/src/
├── api/          Axios API 모듈
├── components/   UI 컴포넌트
├── hooks/        실시간/데이터 훅
├── i18n/         ko, en, ja 번역
├── layouts/      RootLayout
├── lib/          유틸리티
├── pages/        라우트 페이지
├── stores/       Zustand store
└── styles/       Tailwind/CSS 토큰
```

## Commands

```bash
docker compose up -d --build
docker compose up -d postgres
cd backend && ./gradlew bootRun
cd backend && ./gradlew test
cd frontend && npm install && npm run dev
cd frontend && npm run build
cd frontend && npx playwright test
docker compose -f docker-compose.prod.yml up -d --build
```

## Ports

| Service | Port |
| --- | --- |
| Frontend Vite | 5175 |
| Frontend Docker/nginx | 5174 |
| Backend | 8090 |
| PostgreSQL Docker | 5434 -> 5432 |

## Coding Rules

- 코드 주석을 새로 작성하지 않습니다.
- 사용자-facing 에러 메시지는 한국어를 사용합니다.
- 커밋 메시지는 한국어 설명과 prefix를 사용합니다. 예: `feat: 실시간 코인 시세 개선`
- 프론트엔드 경로 별칭은 `@`를 `./src`로 사용합니다.
- 관련 없는 변경은 되돌리지 않습니다.

## Backend Rules

- DI는 `@RequiredArgsConstructor`와 `private final` 필드를 사용합니다.
- Controller는 얇게 유지하고 Service에 위임합니다.
- DTO는 Java record를 사용합니다.
- Entity는 JPA `@Entity`, `@Table`, Lombok을 사용합니다.
- Flyway migration과 Hibernate validate 규칙을 유지합니다.
- 커스텀 예외보다 `RuntimeException`과 전역 예외 처리 패턴을 우선합니다.

## Frontend Rules

- 컴포넌트는 `.jsx`와 `export default function ComponentName()` 패턴을 사용합니다.
- TypeScript는 사용하지 않습니다.
- Hooks, state, effects, handlers, JSX 순서로 배치합니다.
- Tailwind CSS 인라인 클래스를 사용합니다.
- 조건부 클래스는 `clsx`와 `tailwind-merge`를 사용합니다.
- React Query는 사용하지 않고 API 호출 결과를 Zustand에 반영합니다.
- UI 아이콘은 가능하면 `lucide-react`를 사용합니다.

## Market Data Rules

- 코인 실시간 가격과 캔들은 Binance REST/WebSocket을 사용합니다.
- 백엔드의 코인 기본 피드는 CoinGecko를 초기 데이터와 fallback으로 사용합니다.
- 주식 시세와 차트는 Yahoo Finance 경로를 유지합니다.
- 내부 코인 심볼은 `BTC`, `ETH`, `XRP` 같은 티커를 사용합니다.
- 화면 표시는 `BTC/USDT` 같은 Binance 거래쌍을 사용합니다.
- 단순 시세 조회 데이터는 DB에 저장하지 않습니다.

## AI Rules

- AI 분석은 OpenAI Responses API 기준으로 유지합니다.
- 서버 환경변수는 `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_URL`를 사용합니다.
- API 키는 프론트엔드에 노출하지 않습니다.

## Git Workflow

- 기본 배포 브랜치는 `main`입니다.
- Codex 작업 브랜치는 `codex` 접두사를 사용합니다.
- 작업 완료 후 검증, 커밋, push, PR 생성까지 진행합니다.
