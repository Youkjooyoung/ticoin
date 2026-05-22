# Work History by Date

Ticoin 작업 이력을 날짜별로 정리한 문서입니다. Git 로그와 기존 개발 문서를 기준으로 작성했습니다.

## 2026-04-14

- 초기 풀스택 스캐폴드를 생성했습니다.
- Backend는 Spring Boot 3.4, Java 21, PostgreSQL, JPA, 기본 Market/News/Portfolio/Watchlist API로 시작했습니다.
- Frontend는 React 18, Vite 6, Tailwind CSS, Zustand, React Router 기반 대시보드 화면을 구성했습니다.
- Docker Compose로 postgres, backend, frontend 개발 스택을 구성했습니다.

## 2026-04-15

- v0.2 품질 작업을 진행했습니다.
- Global exception handler, DTO validation, Flyway, Actuator, OpenAPI, WebSocket STOMP, backend controller tests를 추가했습니다.
- Asset detail modal, live price hook, debounce search, portfolio line chart, toast, error boundary, 404, skeleton loader, watchlist reorder를 추가했습니다.
- v0.3 풀스택 기능을 확장했습니다.
- Device ID 기반 portfolio/watchlist/alert 격리, price alert CRUD와 scheduled checker, local/prod profile, logback, build info를 추가했습니다.
- Frontend에 device id util, alert store, live alert toast, real CRUD page flow를 연결했습니다.
- AWS 배포 준비 문서와 production docker compose, nginx runtime env injection을 추가했습니다.
- CryptoCompare auth 요구 변화에 대응해 Reddit news fallback을 추가했습니다.
- v0.4 UX 대수정을 진행했습니다.
- Binance WebSocket ticker, Binance kline chart, symbol dropdown, price step input, comments, profile editing, quick create, notification dropdown을 추가했습니다.
- CandleChart 초기 width 0 문제를 ResizeObserver로 보완했습니다.
- Docker frontend CRLF 문제를 Dockerfile에서 보정했습니다.

## 2026-04-16

- 프로젝트 작업 규칙 문서를 생성했습니다.
- 이후 작업에서 assistant 전용 설정을 Codex 기준 문서로 전환해야 하는 정리 대상이 남았습니다.

## 2026-04-17

- 개발 인프라, 인증, 소셜 피드, AI 분석, 뉴스, PWA, 테마, 다국어, Playwright 스캐폴딩을 확장했습니다.
- JWT와 OAuth2 Google/Kakao 인증 스택을 추가했습니다.
- Post, Like, Follow 기반 소셜 피드 도메인과 UI를 추가했습니다.
- Google News RSS와 Reddit 썸네일 대응을 추가했습니다.
- PWA, light/dark theme, ko/en/ja i18n을 추가했습니다.
- Playwright E2E 초기 스펙을 추가했습니다.
- Figma v8 디자인 레퍼런스 스냅샷을 저장소에 추가했습니다.

## 2026-05-18

- `AGENTS.md` 기준의 Codex 작업 지침으로 프로젝트 문서를 정리했습니다.
- 이전 assistant-tooling 파일과 참조를 제거했습니다.
- AI 분석을 OpenAI Responses API 기준으로 전환했습니다.
- 잘못 들어간 거래소 특화 연동을 되돌리고 Binance live crypto data 방향을 복구했습니다.
- Binance ticker/kline hook을 복원했습니다.
- CoinGecko seed/fallback, Yahoo stocks, OpenAI analysis 중심으로 문서를 다시 작성했습니다.

## 2026-05-20

- Binance 전체 USDT spot market discovery를 backend `BinanceClient`로 확장했습니다.
- CoinGecko는 Binance REST 실패 시 crypto seed fallback으로 유지했습니다.
- WebSocket ticker 옆에 Binance REST ticker correction polling을 추가해 화면 가격 지연을 줄였습니다.
- local email/password login과 registration을 추가했습니다.
- OAuth provider 지원은 유지했습니다.
- Search, Profile, Login 화면 흐름을 실제 auth state 기준으로 조정했습니다.
- 로그인 버튼 노출과 로그인 화면 레이아웃을 보정했습니다.

## 2026-05-22

- 자동화 점검으로 최신 작업 브랜치 상태와 Git 활동을 확인했습니다.
- Claude/Gemini 문자열 흔적을 재검색했고, 최신 브랜치에는 현재 남은 항목이 없음을 확인했습니다.
- Frontend build와 backend test 실행 가능성을 점검했습니다.
- 새 이슈와 고도화 우선순위를 `docs/AUTOMATION-REVIEW-2026-05-22.md`에 정리했습니다.
