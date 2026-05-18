# Ticoin Codex 작업 지침

Ticoin은 업비트 우선 실시간 가상자산 시세, 미국 주식 시세, 소셜 피드, 포트폴리오, 관심목록, 가격 알림, AI 종목 분석을 제공하는 React/Spring Boot 대시보드입니다.

## 작업 시작 전 Read 규칙

- 모든 작업 전 루트 `AGENTS.md`를 먼저 읽습니다.
- 변경 범위와 관련된 `.md` 문서를 먼저 읽습니다. 예: 아키텍처 변경은 `docs/ARCHITECTURE.md`, 배포 변경은 `deploy/aws-deploy.md`, 변경 이력 정리는 `docs/CHANGELOG.md`.
- 사용되는 Codex Skill이 있으면 해당 `SKILL.md`를 먼저 읽습니다.
- Figma, GitHub, OpenAI 관련 작업은 각각 연결된 플러그인/스킬 지침을 먼저 읽고 작업합니다.
- 새로 생성된 Skill 또는 Markdown 문서가 있으면 작업 전에 읽고 기존 지침과 충돌하는지 확인합니다.

## 기술 스택

### Backend

- Java 21, Spring Boot 3.4.1, Gradle 8.11
- Spring Web, WebFlux WebClient, Spring Data JPA, Hibernate
- PostgreSQL 16, Flyway, `ddl-auto: validate`
- Spring Security, JWT, OAuth2 Google/Kakao
- WebSocket/STOMP, SockJS
- Caffeine Cache, Spring Actuator, springdoc-openapi
- 외부 API: Upbit, Yahoo Finance, CoinGecko fallback, CryptoCompare, Reddit, Google News, OpenAI

### Frontend

- React 18.3, Vite 6, JavaScript JSX
- Tailwind CSS 3.4, CSS variables, dark mode class strategy
- Zustand stores: market, toast, alert, auth, profile, theme
- React Router 6, Axios, i18next, lucide-react
- Canvas candle chart, STOMP/SockJS, exchange WebSocket hooks
- Playwright E2E

## 프로젝트 구조

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
└── websocket/    STOMP 설정과 시세 스트리밍
```

### Frontend

```text
frontend/src/
├── api/          Axios API 모듈
├── components/   재사용 UI 컴포넌트
├── hooks/        커스텀 훅
├── i18n/         ko, en, ja 번역
├── layouts/      RootLayout
├── lib/          유틸리티
├── pages/        라우트 화면
├── stores/       Zustand store
└── styles/       Tailwind/CSS 토큰
```

## 실행 명령

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

## 포트

| 서비스 | 포트 |
| --- | --- |
| Frontend Vite | 5175 |
| Frontend Docker/nginx | 5174 |
| Backend | 8090 |
| PostgreSQL Docker | 5434 -> 5432 |

## 공통 규칙

- 코드 주석을 작성하지 않습니다.
- 사용자에게 보이는 에러 메시지는 한국어로 작성합니다.
- 커밋 메시지는 한국어 설명과 prefix를 사용합니다. 예: `feat: 업비트 시세 연동`
- 프론트엔드 경로 별칭은 `@`가 `./src`를 가리킵니다.
- 기존 사용자의 변경을 되돌리지 않습니다.

## Backend 규칙

- DI는 `@RequiredArgsConstructor`와 `private final` 필드를 사용합니다.
- Controller는 얇게 유지하고 Service에 위임합니다.
- 성공 응답은 도메인 DTO를 직접 반환합니다.
- DTO는 Java record를 사용합니다.
- Entity는 JPA `@Entity`, `@Table`, Lombok을 사용합니다.
- PK는 `GenerationType.IDENTITY`를 사용합니다.
- Flyway 마이그레이션으로 스키마를 관리하고 Hibernate는 validate로 둡니다.
- 커스텀 예외 남발 없이 필요한 경우 `RuntimeException` 계열을 사용하고 전역 핸들러에서 한국어 메시지로 응답합니다.

## Frontend 규칙

- 컴포넌트는 `.jsx` 파일과 `export default function ComponentName()` 패턴을 사용합니다.
- TypeScript를 도입하지 않습니다.
- Hooks, state, effects, handlers, JSX 순서로 구성합니다.
- Tailwind CSS 인라인 클래스를 기본으로 사용합니다.
- 조건부 클래스는 `clsx`와 `tailwind-merge`를 사용합니다.
- React Query는 사용하지 않고 API 호출 결과를 Zustand 또는 로컬 상태에 저장합니다.
- 버튼과 툴 UI에는 가능한 lucide-react 아이콘을 사용합니다.

## 데이터 기준

- 코인 KRW 마켓은 업비트를 우선 데이터 소스로 사용합니다.
- 내부 코인 심볼은 `KRW-BTC` 형식을 사용합니다.
- 화면 표시는 문맥에 따라 `BTC/KRW` 또는 `BTC`로 변환할 수 있습니다.
- 주식 데이터는 Yahoo Finance 경로를 유지합니다.
- 단순 시세 조회 결과는 DB에 저장하지 않습니다.

## AI 분석 기준

- 이전 AI 제공자의 클라이언트, 설정, 화면 문구를 사용하지 않습니다.
- AI 분석은 OpenAI Responses API 기반으로 구현합니다.
- 서버 환경변수는 `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_URL`을 사용합니다.
- API 키는 백엔드에서만 사용하며 프론트엔드에 노출하지 않습니다.

## Git Workflow

- 기본 브랜치는 `main`입니다.
- 작업 브랜치는 `codex` 접두사를 사용합니다.
- 권장 흐름은 새 브랜치에서 작업 후 push 및 PR 생성입니다.

```text
main
develop
feat/*
fix/*
codex*
```
