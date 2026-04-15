# AWS 배포 가이드

ticoin 프로젝트의 AWS 운영 배포 레퍼런스. 로컬에서 검증 완료된 `0.3.0` 이후 기준.

## 아키텍처 선택지

### Option A — EC2 단일 호스트 (가장 저렴, 추천 시작점)
- EC2 t3.small (2 vCPU, 2GB RAM)
- Security Group: 80/443 인바운드
- Docker + docker compose 설치
- Route 53 + ACM + ALB 또는 nginx로 HTTPS 종단
- 월 예상 비용: ~$15–25

### Option B — ECS Fargate + RDS
- ECR: `ticoin-backend`, `ticoin-frontend` 이미지
- RDS PostgreSQL 16 (db.t4g.micro)
- ECS Fargate task 2개 (backend 0.5 vCPU / 1GB, frontend 0.25 vCPU / 0.5GB)
- ALB → 타겟 그룹 2개 (backend 8090, frontend 80)
- 월 예상 비용: ~$60–90

### Option C — App Runner + RDS
- 가장 low-ops. ALB/ECS 직접 관리 불필요
- App Runner 서비스 2개 (backend/frontend) + RDS
- 월 예상 비용: ~$50–80

---

## Option A 단계별 (EC2)

### 1. EC2 인스턴스 준비
```bash
# Amazon Linux 2023 기준
sudo dnf update -y
sudo dnf install -y docker git
sudo systemctl enable --now docker
sudo usermod -aG docker ec2-user
# 재로그인 후
docker --version
```

### 2. 프로젝트 클론 + 환경변수 설정
```bash
git clone <repo> ticoin
cd ticoin
cp .env.prod.example .env.prod
vi .env.prod   # DB_PASSWORD, CORS_ORIGINS 수정
```

### 3. 이미지 빌드 + 기동
```bash
# 이미지 로컬 빌드
docker compose -f docker-compose.yml build

# 프로덕션 스택 기동 (로컬 빌드 이미지를 prod compose에서 사용)
docker tag ticoin-backend ticoin-backend:latest
docker tag ticoin-frontend ticoin-frontend:latest
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d

# 상태 확인
docker compose -f docker-compose.prod.yml ps
curl http://localhost/healthz
curl http://localhost/actuator/health
```

### 4. HTTPS (Let's Encrypt + nginx 또는 Caddy)
```bash
# 가장 간단: Caddy (자동 HTTPS)
sudo dnf install -y caddy
sudo tee /etc/caddy/Caddyfile <<'EOF'
ticoin.example.com {
    reverse_proxy localhost:80
}
EOF
sudo systemctl enable --now caddy
```

Route 53에서 A 레코드 → EC2 Elastic IP 지정 후 수분 내 HTTPS 활성화됨.

---

## Option B 단계별 (ECS Fargate)

### 1. ECR 리포지터리 생성 + 이미지 푸시
```bash
REGION=ap-northeast-2
ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
REGISTRY=$ACCOUNT.dkr.ecr.$REGION.amazonaws.com

aws ecr create-repository --repository-name ticoin-backend --region $REGION
aws ecr create-repository --repository-name ticoin-frontend --region $REGION
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $REGISTRY

# 빌드
docker compose build

# 태깅
docker tag ticoin-backend $REGISTRY/ticoin-backend:0.3.0
docker tag ticoin-frontend $REGISTRY/ticoin-frontend:0.3.0

# 푸시
docker push $REGISTRY/ticoin-backend:0.3.0
docker push $REGISTRY/ticoin-frontend:0.3.0
```

### 2. RDS PostgreSQL 16
- 서브넷 그룹 (같은 VPC)
- Security Group: ECS backend task의 SG에서 5432 허용
- Master: `ticoin_admin`
- 앱용 계정은 psql로 별도 생성 후 GRANT (`ticoin_app`)
- Flyway가 기동 시 자동 마이그레이션

### 3. ECS 서비스 정의
- 백엔드 task:
  - 포트 8090
  - 환경변수: `SPRING_PROFILES_ACTIVE=prod`, `DB_*` (Secrets Manager 참조), `CORS_ORIGINS`
  - Health check: `/actuator/health/readiness`
  - awslogs 드라이버 → CloudWatch Logs
- 프론트 task:
  - 포트 80
  - 환경변수: `BACKEND_URL=http://<backend-service-discovery>:8090`
- 두 서비스 모두 ALB 타겟 그룹에 등록, 호스트/경로 기반 라우팅

### 4. ALB + Route 53 + ACM
- ACM에서 `ticoin.example.com` 인증서 발급
- ALB 리스너: 443 → 타겟 그룹
- Route 53 A/alias → ALB

---

## 운영 체크리스트

- [ ] `.env.prod`에 강력한 `DB_PASSWORD` 설정
- [ ] CORS_ORIGINS에 실제 도메인만 나열
- [ ] Secrets Manager / SSM Parameter Store로 DB 자격증명 주입 (ECS 권장)
- [ ] CloudWatch Logs 보존 기간 설정 (7~30일)
- [ ] RDS 자동 백업 7일 이상
- [ ] Spring Boot `prod` 프로파일: ddl-auto=validate, show-sql=false, Actuator `/info` 에 민감정보 노출 여부 점검
- [ ] `/actuator/health/liveness` / `/readiness` ALB 타겟 헬스체크로 지정
- [ ] 프론트 캐시 정책: HTML no-cache, JS/CSS immutable 1y (nginx.conf.template에 이미 적용됨)
- [ ] SSL/TLS 완전 적용 (HTTP → HTTPS 리디렉션)
- [ ] 외부 API 레이트 리밋 모니터링 (CoinGecko 무료 플랜 분당 10~30콜)

## 롤백
```bash
# ECR 태그 기반
docker service update --image $REGISTRY/ticoin-backend:0.2.0 ticoin-backend
# 또는 ECS 콘솔에서 task definition revision 이전 버전으로 돌림
```

## 관측성
- `/actuator/metrics`, `/actuator/prometheus` (prod 프로파일에서 활성화됨)
- 권장: AWS Distro for OpenTelemetry sidecar 또는 CloudWatch Container Insights
