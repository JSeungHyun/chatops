# ChatOps - 실시간 채팅 서비스

WebSocket 기반 1:1/그룹 채팅 시스템. 코드보다 **인프라 설계/운영 경험**에 초점을 둔 사이드 프로젝트.

## 핵심 기능

- 1:1 / 그룹 실시간 채팅 (WebSocket)
- 메시지 읽음 처리
- 온라인/오프라인 상태 표시
- 읽지 않은 메시지 수 배지
- 오프라인 유저 푸시 알림
- 이미지/파일 전송
- 타이핑 인디케이터

## 아키텍처

```
Client (React + Socket.io)
         │
         ▼
┌─────────────────┐
│     Nginx       │  리버스 프록시, WebSocket 업그레이드, 로드밸런싱
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌────────┐
│ API #1 │ │ API #2 │  NestJS (Docker replicas: 2)
└───┬────┘ └───┬────┘
    └────┬─────┘
         │
    ┌────┼──────────┬──────────────┐
    ▼    ▼          ▼              ▼
  Redis  PostgreSQL  RabbitMQ      MinIO
  Pub/Sub  메인 DB    이벤트 큐    파일 저장소
  +Cache             ┌──┴──┐
                     ▼     ▼
                 Consumer Consumer
                 (알림)   (읽음)
         │
    Prometheus → Grafana  (모니터링)
```

## 기술 스택

| 레이어 | 기술 |
|--------|------|
| Frontend | React, Socket.io-client, Zustand (Vite) |
| Backend | NestJS (TypeScript) |
| ORM | Prisma |
| 실시간 통신 | Socket.io |
| DB | PostgreSQL 16 |
| 캐시 / Pub/Sub | Redis 7 |
| 메시지 큐 | RabbitMQ 3 |
| 파일 저장소 | MinIO (S3 호환) |
| 리버스 프록시 | Nginx |
| 모니터링 | Prometheus + Grafana |
| CI/CD | Jenkins |
| 컨테이너 | Docker / Docker Compose |

## 프로젝트 구조

```
chatops/
├── client/          # Frontend (React + Vite)
├── api/             # Backend (NestJS)
├── workers/         # MQ Consumer 워커
│   ├── notification/    # 오프라인 푸시 알림
│   ├── read-receipt/    # 읽음 처리
│   └── file-process/   # 이미지 리사이징, 썸네일
├── nginx/           # 리버스 프록시 설정
├── monitoring/      # Prometheus + Grafana 설정
└── jenkins/         # CI/CD 파이프라인
```

## 로컬 개발환경

| 항목 | 환경 |
|------|------|
| OS | WSL2 Ubuntu 24.04 |
| Node.js | 24 (nvm) |
| 패키지 매니저 | pnpm (corepack) |
| 컨테이너 | Docker Desktop (WSL2 백엔드) |

## 시작하기

### 개발 모드 (인프라만 Docker, API/Client는 로컬)

```bash
# 1. 인프라 컨테이너
docker compose -f docker-compose.dev.yml up -d

# 2. API 서버 (터미널 1)
cd api
pnpm install
pnpm run start:dev

# 3. 프론트엔드 (터미널 2)
cd client
pnpm install
pnpm run dev

# 4. DB 마이그레이션 (최초 1회 또는 스키마 변경 시)
cd api && npx prisma migrate dev

# 5. 시드 데이터 (최초 1회)
npx prisma db seed
```

### 전체 Docker 실행

```bash
docker compose up -d --build
docker compose exec api npx prisma migrate deploy
docker compose exec api npx prisma db seed
```

## 주요 URL

### 개발 모드

| 서비스 | URL |
|--------|-----|
| 프론트엔드 | http://localhost:5173 |
| API 서버 | http://localhost:3000 |
| RabbitMQ 관리 콘솔 | http://localhost:15672 |
| MinIO 콘솔 | http://localhost:9001 |

### 전체 Docker 실행

| 서비스 | URL |
|--------|-----|
| 프론트엔드 (Nginx) | http://localhost |
| API (Nginx 경유) | http://localhost/api |
| Grafana 대시보드 | http://localhost:3000 |
| Prometheus | http://localhost:9090 |

## 핵심 플로우

**메시지 전송**: 클라이언트 → WebSocket → PostgreSQL 저장 → Redis Pub/Sub 브로드캐스트 → 실시간 전달

**오프라인 알림**: Redis 온라인 상태 확인 → 오프라인이면 RabbitMQ → Notification Consumer → 푸시 알림

**읽음 처리**: 채팅방 진입 → RabbitMQ → Read Receipt Consumer → DB 업데이트 → 상대방에게 실시간 전달

**파일 전송**: 업로드 → MinIO 원본 저장 → RabbitMQ → File Process Consumer → 리사이징 후 MinIO 저장
