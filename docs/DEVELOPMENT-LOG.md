# Development Log

ticoin 프로젝트의 세션별 개발 일지. 무엇을 했고, 왜 했고, 무엇에 막혔고, 어떻게 풀었는지의 기록.

---

## Session 1 — 2026-04-14: 초기 스캐폴드

### 목표
Figma AI(Figma Make)로 디자인한 FinGram 스타일 주식/코인 대시보드를 실제 풀스택 프로젝트로 전환. 백엔드와 프론트엔드를 분리한 모노레포 구조로 `C:\Users\USER\Desktop\포트폴리오\ticoin`에 생성.

### 기술 선택
- **Java 21 + Spring Boot 3.4** (사용자 지정)
- **PostgreSQL 16** + Flyway 대신 초기엔 JPA `ddl-auto: update`
- **React 18 + Vite 6 + Tailwind CSS 3 + Zustand + React Router 6** (사용자 지정)
- **Docker Compose** — postgres + backend + frontend 3-티어

### 의사결정
- **로그인 제외** (사용자 지시) — 나중에 추가
- **CoinMarketCap 뉴스가 유료** → CryptoCompare News API로 대체. `.env.example`에 CMC_API_KEY 슬롯은 남겨둠
- **주식 시세**: Yahoo Finance 비공식 API(`query1.finance.yahoo.com`)가 당시엔 키 없이 작동해서 사용
- **디자인**: Figma Make 파일을 직접 읽을 수 없었지만 사용자가 공유한 스크린샷과 파일 구조로부터 FinGram 레이아웃을 재현

### 결과물
- Backend: 컨트롤러 4개 + 외부 API 클라이언트 3개 + JPA 엔티티 2개
- Frontend: 6개 페이지 + Canvas 기반 CandleChart + Sidebar/Header/BottomNav + mock 폴백 데이터
- Docker Compose 기본 스택

### 메모
- 이 시점의 프론트는 아직 **스켈레톤** 수준 — mock 폴백 데이터가 있어서 백엔드 없이도 화면이 뜨지만, 실제 CRUD 없음
- Yahoo Finance가 앞으로 막힐 거라는 건 이때는 몰랐음

---

## Session 2 — 2026-04-15 (새벽): v0.2.0 Enhancement

### 목표
v0.1 스캐폴드에 프로덕션 품질 기능 추가. 사용자가 04:00 예약 작업으로 요청.

### 계획
1. Backend: GlobalExceptionHandler / DTO 검증 / Flyway / Actuator / OpenAPI / WebSocket / 통합 테스트 / Gradle wrapper
2. Frontend: AssetDetailModal / WebSocket 훅 / 디바운스 검색 / LineChart / Toast / ErrorBoundary / 404 / 스켈레톤 / 정렬
3. Docs + Notion 요약
4. Git develop → main merge → develop 복귀

### 예약 작업 실패
04:00에 예약 작업이 시작했으나 **첫 Bash 호출에서 권한 프롬프트로 멈춤**. `cd ticoin && git status && git branch --show-current && ls -la` 같은 복합 `&&` 명령이 `settings.local.json` 허용 패턴에 정확히 매칭되지 않아 세션이 약 1분 만에 종료됨. 고도화 파일은 **하나도 생성되지 않았고** git도 초기화되지 않은 상태.

### 수동 재구현
오전에 사용자가 로그를 보고 수동 진행 지시. 동일한 범위를 한 세션에 완수:
- Backend 7개 작업 전부
- Frontend 9개 작업 전부
- README 갱신, 메모리 추가, Notion 요약 페이지 생성
- 단계별 Conventional Commits로 분할 커밋

### 주요 기술 포인트
- **WebSocket STOMP**: `WebSocketConfig` + `PriceStreamService`의 `@Scheduled(fixedDelay=15000)`로 15초마다 CoinGecko 재조회 → `/topic/prices` 브로드캐스트. 이 때는 개별 심볼 채널 없이 전체 피드 배열을 한 번에 push
- **AssetDetailModal 애니메이션**: CSS `fadeIn` / `scaleIn` keyframes만 사용 (framer-motion 미도입)
- **스켈레톤 로더**: 페이지별 전용(`AssetCardSkeleton`, `ListSkeleton`, `NewsSkeleton`) 분리. 기존 `animate-pulse` 단일 div는 제거

### 교훈
- 예약 작업의 권한 프롬프트는 **복합 명령에서 발생**. 다음 예약은 `settings.local.json`에 `Bash(*)`를 넓게 허용하고 deny 리스트로 차단하는 쪽이 안전
- 권한 실패 후에도 아침에 수동으로 같은 범위를 돌리면 오히려 빠름 (컨텍스트가 신선해서)

---

## Session 3 — 2026-04-15 (오전): v0.3.0 Fullstack + AWS 준비

### 목표
"현재 프론트엔드는 단순 스켈레톤" 이라는 사용자 평가에 대응. 실제로 동작하는 풀스택으로 끌어올리고 AWS 운영 배포 준비.

### Phase 1 — Backend 기초 강화
**Device Identity**: 로그인 없이 기기별 데이터 격리가 핵심. 설계:
- `X-Device-Id` 헤더 → `DeviceIdFilter`가 요청 속성 + MDC에 저장
- `@DeviceId` 커스텀 어노테이션 + `DeviceIdArgumentResolver`로 컨트롤러에서 단순 주입
- Portfolio / Watchlist / PriceAlert 엔티티 전부 `device_id` 컬럼 추가, 파생 쿼리(`findByDeviceIdOrderByCreatedAtDesc`)로 스코프

**Price Alerts**: 사용자가 원한 진짜 기능.
- Entity: `PriceAlert { deviceId, symbol, condition (ABOVE/BELOW), target, triggered, triggeredAt }`
- Scheduled checker: `PriceAlertService.@Scheduled(fixedDelay=20s)` → 활성 알림 전부 조회 → 현재가 맵 대조 → 조건 충족 시 `SimpMessagingTemplate.convertAndSend("/topic/alerts/{deviceId}", payload)`
- Flyway V2 마이그레이션으로 `device_id` 컬럼 + `price_alert` 테이블을 기존 V1 위에 무중단 적용

**Multi-profile**: `application-local.yml`은 컬러 콘솔 + `show-sql: true`, `application-prod.yml`은 Tomcat 튜닝 + Prometheus exposure + liveness/readiness probe. `logback-spring.xml`에서 `<springProfile>`로 분기

**기타**: Graceful shutdown, `springBoot.buildInfo` 플러그인으로 `/actuator/info`에 빌드 시각 노출

### Phase 2 — Frontend 실구현
- `lib/device.js` — `crypto.randomUUID()`로 기기 UUID 생성, localStorage 영속
- Axios request interceptor가 모든 API에 `X-Device-Id` 자동 주입
- `alertStore` (Zustand): CRUD + 발동 이력 스택
- `useLivePrices` 확장: `/topic/prices` (전체 피드) + `/topic/alerts/{deviceId}` (내 알림) 이중 구독
- Toast 연동: 알림 발동 시 우상단 슬라이드
- `/alerts` 페이지: 폼(ABOVE/BELOW + target) + 리스트 + 최근 발동 배너 + 삭제
- Portfolio / Watchlist에서 mock 폴백 제거, 실제 DB만 사용, 실패 시 에러 Toast

### Phase 3 — AWS 준비
**프런트 런타임 환경변수 주입**이 핵심. 보통 Vite는 빌드 타임에 `VITE_*` 변수를 박아버리지만 그러면 이미지가 환경에 묶임. 해결:
- `nginx.conf.template`에 `${BACKEND_URL}` placeholder
- `docker-entrypoint.sh`가 컨테이너 시작 시 `envsubst`로 `default.conf` 생성
- 같은 이미지를 dev/staging/prod에 그대로 재사용 가능

**`docker-compose.prod.yml`**: 이미지 태그 환경변수 주입, 메모리 리밋, JVM 컨테이너 옵션(`-XX:MaxRAMPercentage=75.0`), readiness probe 기반 헬스체크

**`deploy/aws-deploy.md`**: EC2 단일 호스트(~$20/월), ECS Fargate(~$70/월), App Runner(~$60/월) 3가지 경로별 단계별 가이드 + 월 비용 추정 + 운영 체크리스트 + 롤백 절차

### 중간 사고: CryptoCompare 유료화
Docker로 올린 후 프로필 페이지 뉴스가 빈 배열. 로그 확인:
```
CryptoCompare news fetch failed: class LinkedHashMap cannot be cast to class List
```
직접 CryptoCompare API 호출해 보니:
```json
{"Response":"Error","Message":"You need a valid auth key or api key..."}
```
v0.1 시점에 무료였던 API가 **그새 auth key 요구**로 바뀜. 핫픽스:
1. `CryptoCompareClient`에 에러 응답 가드 (`"Error".equals(resp.get("Response"))` 체크)
2. `RedditNewsClient` 신규 — Reddit `r/CryptoCurrency/top.json?t=day`는 User-Agent만 있으면 키 불필요
3. `NewsService`가 CryptoCompare 결과가 비면 자동으로 Reddit 폴백

결과: 프로필 뉴스에 Reddit 상위 포스트가 표시되어 UX는 유지됨.

### Git 워크플로
사용자 지시 "develop 브랜치에서 구현하고 main까지 커밋 푸쉬해. 그리고 다시 develop 브랜치로 돌아오도록":
1. `git init` + main 브랜치 초기 커밋
2. `git checkout -b develop`
3. 작업을 Conventional Commits로 단계 분할 커밋
4. `git checkout main && git merge develop --no-ff`
5. remote가 없어서 push 스킵 (로그에 기록)
6. `git checkout develop` 복귀

이 패턴이 이후 v0.4에서도 그대로 재사용됨.

---

## Session 4 — 2026-04-15 (오후): v0.4.0 UX 대수정

### 배경
사용자가 스크린샷과 함께 13개 항목 피드백:
1. 차트 인터벌 버튼 일부가 변경 안 됨
2. 댓글 버튼 클릭해도 댓글창 안 열림
3. 실시간 가격이 너무 느림, "거래소처럼 실시간"으로
4. 검색 자동완성
5. 트렌딩 카드 클릭 시 차트 이동
6. 심볼 입력을 드롭다운으로
7. 평단가 호가 단위 (1000만원→1만, 100원→1원 등)
8. 0.00XX 소수점 가격도 같은 규칙
9. 가격 알림도 같은 규칙
10. 프로필 이미지 / 각 버튼 비활성화
11. 좌측 상단 로고 클릭 → 홈
12. 헤더 + 버튼 / 알림 버튼 비활성화
13. 각 버튼에 백엔드 코드 포함 구현

### 가장 어려웠던 항목: 실시간 가격 (#3)
서버에서 15초 간격으로 브로드캐스트하는 구조는 "정적으로 멈춰있는 것 같다"는 피드백. 옵션:
- A. 서버 간격을 3~5초로 단축 → CoinGecko 레이트 리밋 위험 + 여전히 거래소 수준 아님
- B. 프론트에서 가짜 tick 애니메이션 → 미봉책
- C. **프론트가 Binance WebSocket에 직결**

선택: **C**. Binance `wss://stream.binance.com:9443/stream?streams=btcusdt@ticker/ethusdt@ticker/...`는 CORS 허용 + 키 불필요 + 초당 수 회 pushing. 직결하면 실측 `74343.28 → 74343.29` 단위의 ms 단위 변동이 UI에 반영됨.

구현:
- `lib/binance.js`: ticoin symbol → Binance USDT pair 매핑 (BTC→BTCUSDT 등)
- `hooks/useBinanceTicker.js`: 심볼 배열을 받아 combined stream 하나에 구독, 응답에서 `d.c` (close price)만 꺼내 `marketStore.updatePrice`
- `marketStore.updatePrice`가 flash 방향 계산 로직을 갖고 있어서 AssetCard가 900ms 동안 색상 강조

주식(STOCK 타입)은 Binance에 없어서 제외. Yahoo가 401을 내기 시작해서 사실상 코인만 남은 상황과 부합.

### 두 번째 난관: 차트 인터벌 (#1)
CoinGecko `/coins/{id}/ohlc`는 granularity가 고정됨 (days=1 → 30min candles, days=7~30 → 4h, >90 → 1d). 즉 **15분봉 / 1시간봉을 구별해서 못 내려줌**. 그래서 사용자 체감상 "일부 인터벌에서 변화 없음".

해결: **Binance `/api/v3/klines`에 직접 호출**. `interval` 파라미터로 1m/5m/15m/1h/4h/1d/1w 모두 가능. `useBinanceKlines` 훅 신규:
```
https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=15m&limit=100
```
CORS 허용, 키 불필요, 즉시 반환.

### 세 번째 난관: CandleChart 캔버스가 비어있음
Binance 데이터는 정상 도착하는데 화면에 차트가 안 그려짐. DevTools로 확인:
- `canvas.width` = 0
- `canvas.getBoundingClientRect().width` = 794

범인: `CandleChart`의 초기 `useEffect`가 `rect.width * dpr`로 canvas 내부 width를 설정하는데, **첫 렌더 시점에 `rect.width`가 0**. React가 DOM을 커밋했지만 브라우저가 아직 레이아웃을 끝내지 않은 타이밍이 존재함.

해결: **`ResizeObserver`로 부모 크기를 추적**하도록 전면 수정. 부모 wrap div에 ref, ResizeObserver가 관찰, 크기가 > 0일 때만 canvas에 반영. 이후 interval이 바뀌거나 창 크기가 바뀌어도 자동으로 재그림.

### 심볼 드롭다운 + 호가 단위 (#6~9)
**`SymbolSelect` 컴포넌트**: `marketStore.feed`를 읽어 `<select>`로 렌더. 각 옵션 텍스트에 `BTC · Bitcoin ($74,296.74)` 처럼 현재가까지 포함해 사용자가 헷갈리지 않도록.

**`PriceInput` 컴포넌트 + `getPriceStep(price)` 유틸**: 참조 가격을 받아 lookup 테이블로 step 결정.
```
10,000,000+ → 10,000
1,000,000+  → 1,000
100,000+    → 100
10,000+     → 10
1,000+      → 10
100+        → 1
10+         → 0.1
1+          → 0.01
0.1+        → 0.001
0.01+       → 0.0001
0.001+      → 0.00001
else        → 0.0000001
```
`<input type="number" step={...} min="0">` 로 HTML 레벨에서 음수 차단 + 변경 핸들러에서 `< 0` 거부.

심볼이 바뀌면 ref price가 바뀌므로 step이 자동으로 재계산 — 거래소 호가창의 느낌.

### 댓글 시스템 (#2, #13)
Backend:
- `Comment` 엔티티 (id, deviceId, symbol, author, content, createdAt)
- `CommentController`: GET `/api/comments?symbol=BTC`, POST, DELETE (본인만)
- Flyway V3 마이그레이션으로 `comment` 테이블 신규

Frontend:
- `CommentPanel` 컴포넌트: AssetCard 푸터의 댓글 버튼 토글
- `profileStore.profile.nickname`을 author로 사용
- Enter로 전송, 본인 댓글만 삭제

### 프로필 전면 구현 (#10)
Backend:
- `Profile` 엔티티 (deviceId unique, nickname, bio, avatarUrl — 2048자까지 base64 가능)
- `ProfileService.getOrCreate(deviceId)` 패턴 — 첫 조회 시 guest_XXXXXX 기본값 생성

Frontend:
- `profileStore` (Zustand): load / update
- 편집 모달: 아바타 파일 선택 → FileReader → base64 (500KB 제한), 닉네임, 자기소개
- 설정 메뉴 4개 버튼 전부 활성화:
  - 계정 설정 → 모달 (기기 ID, 가입일, 로그인 미지원 안내)
  - 알림 받기 → 토글 + Toast
  - 다크 모드 → 토글 (Toast로 라이트 모드 개발 중 안내)
  - 도움말 → 모달 (FAQ 3개)
  - 로그아웃 → confirm + Toast

### 네비게이션 + 헤더 (#5, #11, #12)
- Sidebar 로고를 `<NavLink to="/">`로 래핑
- Header에 `QuickCreateDropdown` (+ 버튼) + `NotificationDropdown` (🔔 버튼). 둘 다 외부 클릭으로 닫힘 (document mousedown)
- QuickCreate 메뉴: 포트폴리오/관심목록/알림/검색 4개 빠른 이동
- Notification: `alertStore.triggered` 실시간 알림 목록 + "모두 읽음" + "모든 알림 보기"

### 검증 단계에서 만난 CRLF 이슈
Docker frontend 재빌드 후 컨테이너가 즉시 재시작 루프:
```
exec /docker-entrypoint.sh: no such file or directory
```
파일은 존재함. 원인: Windows에서 작성한 shell script가 CRLF로 저장되어 있어서 Linux 컨테이너가 shebang `#!/bin/sh\r`를 `/bin/sh\r` 바이너리 탐색으로 해석 → 존재하지 않음 → "no such file or directory". Docker 에러 메시지가 오해를 유발하는 전형적인 사례.

해결: `Dockerfile`에 `RUN sed -i 's/\r$//' /docker-entrypoint.sh` 추가. 근본 해결은 `.gitattributes`에 `*.sh text eol=lf`지만 당장은 Dockerfile 수정으로 충분.

### 결과
Docker frontend / Vite dev 서버 모두 v0.4.0 정상 기동. 사용자 확인 완료.

### 회고
- **외부 API 직결은 양날의 검**: 서버 부하/레이트 리밋을 피할 수 있지만 거래소 정책 변경 시 즉시 영향. Binance가 언젠가 CORS를 막으면 백엔드 프록시로 대체해야 함
- **tick step lookup**이 단순하지만 강력. 사용자 경험이 확 올라감
- **ResizeObserver 기반 canvas**는 모든 canvas 차트의 표준 패턴이 되어야 함 — React 초기 렌더 + CSS 플렉스 조합에서 자주 터지는 문제
- **CRLF 문제는 Windows 개발자의 공짜 30분**. 처음 Dockerfile 작성할 때 `.gitattributes`부터 깔아두는 게 맞음

---

## Git 브랜치 & 버전 요약

| 버전 | 날짜 | Merge Commit | 주제 |
|---|---|---|---|
| v0.1.0 | 2026-04-14 | `2f181e4` (초기) | 스캐폴드 |
| v0.2.0 | 2026-04-15 새벽 | `6aba80c` | 품질/검증/문서 |
| v0.3.0 | 2026-04-15 오전 | `41fe4f1` | 실구현 + AWS 준비 |
| v0.4.0 | 2026-04-15 오후 | `0b3658e` | UX 대수정 + 실시간 |

항상 `develop`에서 개발 → `main --no-ff` 병합 → `develop` 복귀 패턴을 유지. Remote 없으므로 push는 스킵됨.
