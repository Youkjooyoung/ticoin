# Automation Review - 2026-05-22

## Scope

- 대상 브랜치: `codex-upbit-openai-ui-refactor`
- 기준 커밋: `2e72c8f` (`fix: 로그인 화면 레이아웃 개선`)
- 요청 범위: 새 이슈 점검, 고도화 우선순위, Git 활동 요약, 날짜별 작업 문서화, commit/push

## Current State

- 최신 활성 브랜치는 `codex-upbit-openai-ui-refactor`입니다.
- `main`은 `3a79814`에 머물러 있고, 2026-05-18/20 Codex 전환 작업은 별도 브랜치에 있습니다.
- 최신 브랜치에는 `AGENTS.md`가 있고 `.claude`, `CLAUDE.md`, Claude/Gemini 문자열 검색 결과는 없습니다.
- AI 분석은 `OpenAiClient`와 OpenAI Responses API 기준으로 정리되어 있습니다.

## New Issues Found

### P0 - Verification cannot run reproducibly

- `backend/gradle/wrapper/gradle-wrapper.properties`는 있으나 `gradlew`, `gradlew.bat`, `gradle-wrapper.jar`가 없습니다.
- 이 환경에는 전역 `gradle`도 없어 `backend` 테스트를 실행할 수 없습니다.
- 영향: CI가 별도 Gradle 설치에 의존하면 통과할 수 있지만, 로컬과 자동화에서 동일한 검증을 재현할 수 없습니다.

### P1 - Frontend build fails in the current sandboxed path

- 실행 명령: `cd frontend && npm.cmd run build`
- 실패 원인: Vite config load 중 esbuild가 `C:\Users\admin` 상위 디렉터리 scan을 시도했고 sandbox 권한으로 `EPERM`이 발생했습니다.
- 영향: 현재 자동화 환경에서 production build 검증이 막힙니다.
- 참고: `node -e "fs.readdirSync('../../../..')"`도 동일하게 `EPERM: scandir 'C:\Users\admin'`로 실패합니다.

### P1 - Main branch is behind the active Codex branch

- `main..codex-upbit-openai-ui-refactor`에는 5개 커밋이 있습니다.
- 영향: 배포/PR 기준 브랜치가 명확하지 않으면 main 기준 자동화가 오래된 코드와 문서를 대상으로 동작합니다.

### P2 - Stock market data remains less reliable than crypto

- Binance 확장은 crypto USDT spot market에 집중되어 있습니다.
- 주식 데이터는 Yahoo Finance 경로를 유지하므로 외부 정책 변화에 취약합니다.
- 우선순위는 crypto live UX 안정화 이후 Finnhub/Polygon/Alpha Vantage 같은 명시적 provider로 대체 검토입니다.

## Enhancement Priorities

1. 검증 재현성 복구
   - Gradle wrapper 실행 파일과 wrapper jar를 정상화합니다.
   - Frontend build가 sandbox/CI에서 상위 디렉터리 scan 없이 동작하는지 확인합니다.
   - 완료 기준: `backend` test, `frontend` build, Playwright smoke가 같은 명령으로 재현됩니다.

2. 브랜치/릴리스 흐름 정리
   - `codex-upbit-openai-ui-refactor`를 PR 또는 main merge 대상으로 확정합니다.
   - 자동화 기본 기준 브랜치를 최신 Codex 브랜치 또는 main 중 하나로 고정합니다.
   - 완료 기준: main과 작업 브랜치 차이를 설명 가능한 상태로 유지합니다.

3. Binance 전체 마켓 UX 안정화
   - 대량 USDT market list에서 검색, 카드 렌더링, WebSocket 구독 수를 제한/가상화합니다.
   - 완료 기준: 대량 심볼에서도 초기 로딩과 검색이 끊기지 않습니다.

4. 로그인/인증 테스트 보강
   - local login/register success/failure, provider disabled 상태, auth store persistence를 E2E 또는 API 테스트로 보강합니다.
   - 완료 기준: 로그인 진입 버튼과 레이아웃 회귀가 자동 테스트로 잡힙니다.

5. Stock data provider 명확화
   - Yahoo Finance 비공식 경로 fallback 정책을 문서화하고 대체 provider를 결정합니다.
   - 완료 기준: stock card/chart failure가 사용자에게 빈 화면으로 보이지 않습니다.

## Git Activity Summary

### 2026-05-18

- `665201c feat: 업비트와 OpenAI 기반 Codex 리팩토링`
- Codex 전환, OpenAI 기반 AI 분석, Binance 방향 복구, 문서 재작성 작업입니다.

### 2026-05-20

- `8e9f0a3 fix: Binance 실시간 코인 시세 복구`
- `3cea794 feat: Binance 전체 마켓과 로그인 플로우 개선`
- `4fb5652 fix: 로그인 진입 버튼 노출`
- `2e72c8f fix: 로그인 화면 레이아웃 개선`
- Binance 전체 마켓 확장, 로그인/회원가입 플로우 추가, 로그인 UI 회귀 보정 작업입니다.

### Branch Status

- `codex-upbit-openai-ui-refactor`는 `origin/codex-upbit-openai-ui-refactor`와 동기화된 상태에서 이번 문서화 작업을 시작했습니다.
- `main`은 2026-04-17의 Figma reference 추가 커밋에 머물러 있습니다.

## Validation Results

- `backend`: 실행 실패. Gradle wrapper 실행 파일과 wrapper jar가 없고 전역 `gradle`도 없습니다.
- `frontend`: 실행 실패. `npm.cmd run build`가 Vite config load 단계에서 sandbox 상위 디렉터리 접근 제한으로 실패했습니다.
- Claude/Gemini trace search: 최신 브랜치 기준 추가 흔적 없음.

## Commit/Push Plan

- 이번 커밋은 문서 변경만 포함합니다.
- 코드 변경은 검증 재현성 이슈를 별도 작업으로 분리합니다.
- push 대상은 `codex-upbit-openai-ui-refactor`입니다.
