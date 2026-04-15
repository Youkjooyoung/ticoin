# Gradle Wrapper

`gradle-wrapper.jar` 바이너리는 리포지터리에 포함되지 않습니다. 최초 1회 로컬에서 생성해 주세요.

```bash
# 방법 1: 시스템 gradle이 있으면
cd backend
gradle wrapper --gradle-version 8.11

# 방법 2: Docker로 빌드 (wrapper 없이도 동작)
docker compose up -d --build
```

두 번째 방법(Docker)은 `gradle:8.11-jdk21` 이미지 내부의 gradle을 사용하므로 wrapper가 없어도 빌드가 가능합니다.
