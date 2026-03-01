# CLAUDE.md — ChatOps 실시간 채팅 서비스

## 프로젝트 개요

실시간 채팅 서비스(ChatOps)는 WebSocket 기반 1:1/그룹 채팅 시스템이다.
코드보다 **인프라 설계/운영 경험**에 초점을 둔 사이드 프로젝트이며, 1인 개발이다.

### 핵심 기능
- 1:1 / 그룹 실시간 채팅 (WebSocket)
- 메시지 읽음 처리
- 온라인/오프라인 상태 표시
- 읽지 않은 메시지 수 배지
- 오프라인 유저 푸시 알림
- 이미지/파일 전송
- 타이핑 인디케이터

---

## 로컬 개발환경

| 항목 | 환경 |
|------|------|
| OS | WSL2 Ubuntu 24.04 (Windows) |
| Node.js | 24 (nvm) |
| 패키지 매니저 | pnpm (corepack) |
| 컨테이너 | Docker Desktop (WSL2 백엔드) |
| IDE | VS Code + Remote WSL 확장 |

---

## 기술 스택

| 레이어 | 기술 | 비고 |
|--------|------|------|
| Frontend | React, Socket.io-client, Zustand | Vite 기반 |
| Backend | NestJS (Node.js) | TypeScript |
| ORM | Prisma | PostgreSQL 연동 |
| 실시간 통신 | Socket.io | WebSocket + fallback |
| DB | PostgreSQL 16 | 유저, 채팅방, 메시지 영구 저장 |
| 캐시 / Pub/Sub | Redis 7 | 온라인 상태, 읽지 않은 수, 서버 간 메시지 동기화 |
| 메시지 큐 | RabbitMQ 3 | 알림, 읽음 처리, 파일 후처리 |
| 파일 저장소 | MinIO | S3 호환 오브젝트 스토리지 |
| 리버스 프록시 | Nginx | WebSocket 업그레이드, 로드밸런싱 |
| 모니터링 | Prometheus + Grafana | 메트릭 수집 + 대시보드 |
| CI/CD | Jenkins | git push → 자동 빌드/배포 |
| 컨테이너 | Docker / Docker Compose | 전체 서비스 컨테이너화 |

---

## 패키지 구조

```
chatops/
├── docker-compose.yml
├── docker-compose.dev.yml            # 개발용 (인프라만)
├── .env
├── .env.dev                          # 개발용 환경 변수
├── .dockerignore
├── .nvmrc                            # Node.js 24
├── nginx/
│   └── nginx.conf                    # 리버스 프록시 + WebSocket 설정
│
├── client/                           # Frontend (React)
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.ts
│   ├── public/
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── api/                      # API 호출 모듈
│       │   └── axios.ts
│       ├── socket/                   # Socket.io 클라이언트 설정
│       │   └── socket.ts
│       ├── stores/                   # Zustand 상태 관리
│       │   ├── authStore.ts
│       │   ├── chatStore.ts
│       │   └── uiStore.ts
│       ├── hooks/                    # 커스텀 훅
│       │   ├── useChat.ts
│       │   ├── useSocket.ts
│       │   └── useOnlineStatus.ts
│       ├── components/               # UI 컴포넌트
│       │   ├── chat/
│       │   │   ├── ChatRoom.tsx
│       │   │   ├── ChatList.tsx
│       │   │   ├── MessageBubble.tsx
│       │   │   ├── MessageInput.tsx
│       │   │   ├── TypingIndicator.tsx
│       │   │   └── FileUpload.tsx
│       │   ├── common/
│       │   │   ├── Avatar.tsx
│       │   │   ├── Badge.tsx
│       │   │   └── OnlineStatus.tsx
│       │   └── layout/
│       │       ├── Sidebar.tsx
│       │       └── Header.tsx
│       ├── pages/
│       │   ├── LoginPage.tsx
│       │   ├── ChatPage.tsx
│       │   └── SettingsPage.tsx
│       ├── types/                    # TypeScript 타입 정의
│       │   ├── chat.ts
│       │   ├── user.ts
│       │   └── message.ts
│       └── utils/
│           ├── format.ts
│           └── constants.ts
│
├── api/                              # Backend (NestJS)
│   ├── Dockerfile
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── .npmrc                        # shamefully-hoist=true
│   ├── tsconfig.json
│   ├── nest-cli.json
│   ├── prisma/
│   │   ├── schema.prisma             # DB 스키마 정의
│   │   ├── migrations/               # 마이그레이션 파일
│   │   └── seed.ts                   # 시드 데이터
│   └── src/
│       ├── main.ts                   # 앱 엔트리포인트
│       ├── app.module.ts             # 루트 모듈
│       │
│       ├── common/                   # 공통 모듈
│       │   ├── guards/
│       │   │   └── jwt-auth.guard.ts
│       │   ├── decorators/
│       │   │   └── current-user.decorator.ts
│       │   ├── filters/
│       │   │   └── ws-exception.filter.ts
│       │   ├── interceptors/
│       │   │   └── prometheus.interceptor.ts
│       │   └── dto/
│       │       └── pagination.dto.ts
│       │
│       ├── auth/                     # 인증 모듈
│       │   ├── auth.module.ts
│       │   ├── auth.controller.ts
│       │   ├── auth.service.ts
│       │   └── strategies/
│       │       └── jwt.strategy.ts
│       │
│       ├── user/                     # 유저 모듈
│       │   ├── user.module.ts
│       │   ├── user.controller.ts
│       │   ├── user.service.ts
│       │   └── dto/
│       │       ├── create-user.dto.ts
│       │       └── update-user.dto.ts
│       │
│       ├── chat/                     # 채팅 모듈 (핵심)
│       │   ├── chat.module.ts
│       │   ├── chat.controller.ts    # REST API (채팅방 CRUD, 메시지 조회)
│       │   ├── chat.service.ts       # 채팅 비즈니스 로직
│       │   ├── chat.gateway.ts       # Socket.io Gateway (실시간 통신)
│       │   └── dto/
│       │       ├── create-room.dto.ts
│       │       ├── send-message.dto.ts
│       │       └── join-room.dto.ts
│       │
│       ├── message/                  # 메시지 모듈
│       │   ├── message.module.ts
│       │   ├── message.service.ts
│       │   └── dto/
│       │       └── message-query.dto.ts
│       │
│       ├── redis/                    # Redis 모듈
│       │   ├── redis.module.ts
│       │   ├── redis.service.ts      # Pub/Sub, 캐싱, 온라인 상태
│       │   └── redis.constants.ts    # 키 네이밍 상수
│       │
│       ├── queue/                    # RabbitMQ 모듈
│       │   ├── queue.module.ts
│       │   ├── producers/
│       │   │   ├── notification.producer.ts
│       │   │   ├── read-receipt.producer.ts
│       │   │   └── file-process.producer.ts
│       │   └── dto/
│       │       ├── notification-event.dto.ts
│       │       └── read-receipt-event.dto.ts
│       │
│       ├── file/                     # 파일 업로드 모듈 (MinIO)
│       │   ├── file.module.ts
│       │   ├── file.controller.ts
│       │   ├── file.service.ts       # MinIO 업로드/다운로드
│       │   └── dto/
│       │       └── upload-file.dto.ts
│       │
│       └── metrics/                  # Prometheus 메트릭 모듈
│           ├── metrics.module.ts
│           ├── metrics.controller.ts # GET /metrics 엔드포인트
│           └── metrics.service.ts    # 커스텀 메트릭 등록
│
├── workers/                          # MQ Consumer 워커들
│   ├── notification/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── src/
│   │       ├── main.ts
│   │       ├── notification.consumer.ts   # 오프라인 푸시 알림 처리
│   │       └── notification.service.ts
│   │
│   ├── read-receipt/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── src/
│   │       ├── main.ts
│   │       ├── read-receipt.consumer.ts   # 읽음 처리 비동기 업데이트
│   │       └── read-receipt.service.ts
│   │
│   └── file-process/
│       ├── Dockerfile
│       ├── package.json
│       └── src/
│           ├── main.ts
│           ├── file-process.consumer.ts   # 이미지 리사이징, 썸네일 생성
│           └── file-process.service.ts
│
├── monitoring/                       # 모니터링 설정
│   ├── prometheus/
│   │   └── prometheus.yml            # 스크래핑 타겟 설정
│   ├── grafana/
│   │   └── dashboards/
│   │       └── chat-dashboard.json   # Grafana 대시보드 JSON
│   └── alerting/
│       └── rules.yml                 # 알림 룰 (큐 적체 등)
│
└── jenkins/                          # CI/CD
    └── Jenkinsfile                   # 파이프라인 정의
```

---

## 시스템 아키텍처

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
│ API #1 │ │ API #2 │  스케일아웃 (Docker replicas: 2)
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
    Prometheus → Grafana  (전체 모니터링)
```

---

## 핵심 플로우

### 메시지 전송
1. 클라이언트가 WebSocket으로 메시지 전송
2. API Server가 PostgreSQL에 메시지 저장
3. Redis Pub/Sub로 브로드캐스트 (채널 = `chat:{roomId}`)
4. 해당 채팅방의 모든 접속자에게 실시간 전달

### 오프라인 알림
1. 메시지 도착 시 Redis에서 수신자 온라인 상태 확인
2. 오프라인이면 RabbitMQ `notification.queue`에 이벤트 발행
3. Notification Consumer가 푸시 알림 처리

### 읽음 처리
1. 유저가 채팅방 진입 시 RabbitMQ `read-receipt.queue`에 이벤트 발행
2. Read Receipt Consumer가 DB 업데이트
3. 상대방에게 읽음 상태 실시간 전달

### 파일 전송
1. 클라이언트가 파일 업로드 → API Server → MinIO에 원본 저장
2. RabbitMQ `file-process.queue`에 썸네일 생성 이벤트 발행
3. File Process Consumer가 리사이징 후 MinIO에 저장
4. 채팅 메시지로 파일 URL 전달

---

## DB 스키마 (Prisma)

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  nickname  String
  avatar    String?
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  messages     Message[]
  chatRooms    ChatRoomMember[]
  readReceipts ReadReceipt[]
}

model ChatRoom {
  id        String   @id @default(uuid())
  name      String?
  type      RoomType @default(DIRECT)   // DIRECT | GROUP
  createdAt DateTime @default(now())

  members  ChatRoomMember[]
  messages Message[]
}

model ChatRoomMember {
  id       String   @id @default(uuid())
  userId   String
  roomId   String
  joinedAt DateTime @default(now())

  user User     @relation(fields: [userId], references: [id])
  room ChatRoom @relation(fields: [roomId], references: [id])

  @@unique([userId, roomId])
}

model Message {
  id        String      @id @default(uuid())
  content   String
  type      MessageType @default(TEXT)   // TEXT | IMAGE | FILE
  fileUrl   String?
  userId    String
  roomId    String
  createdAt DateTime    @default(now())

  user         User          @relation(fields: [userId], references: [id])
  room         ChatRoom      @relation(fields: [roomId], references: [id])
  readReceipts ReadReceipt[]

  @@index([roomId, createdAt])
}

model ReadReceipt {
  id        String   @id @default(uuid())
  userId    String
  messageId String
  readAt    DateTime @default(now())

  user    User    @relation(fields: [userId], references: [id])
  message Message @relation(fields: [messageId], references: [id])

  @@unique([userId, messageId])
}

enum RoomType {
  DIRECT
  GROUP
}

enum MessageType {
  TEXT
  IMAGE
  FILE
}
```

---

## Redis 키 네이밍 규칙

| 키 패턴 | 용도 | TTL |
|---------|------|-----|
| `user:{userId}:status` | 온라인/오프라인 상태 | 300초 (5분) |
| `unread:{userId}:{roomId}` | 읽지 않은 메시지 수 | 없음 |
| `room:{roomId}:messages` | 최근 메시지 캐싱 (List, 최대 50건) | 3600초 (1시간) |
| `room:{roomId}:typing` | 타이핑 중인 유저 목록 (Set) | 5초 |
| Pub/Sub 채널: `chat:{roomId}` | 서버 간 메시지 브로드캐스트 | - |

---

## RabbitMQ 큐 정의

| 큐 이름 | Exchange | Routing Key | 용도 |
|---------|----------|-------------|------|
| `notification.queue` | `chat.exchange` | `notification` | 오프라인 유저 푸시 알림 |
| `read-receipt.queue` | `chat.exchange` | `read-receipt` | 읽음 처리 비동기 업데이트 |
| `file-process.queue` | `chat.exchange` | `file-process` | 이미지 리사이징, 썸네일 생성 |

---

## Prometheus 메트릭

| 메트릭 이름 | 타입 | 설명 |
|------------|------|------|
| `ws_connections_active` | Gauge | 현재 WebSocket 동시 접속자 수 |
| `messages_sent_total` | Counter | 전체 메시지 전송 수 |
| `messages_sent_per_room` | Counter | 채팅방별 메시지 수 |
| `api_request_duration_seconds` | Histogram | API 응답 시간 (p50, p95, p99) |
| `rabbitmq_queue_length` | Gauge | MQ 큐 대기 메시지 수 |
| `redis_memory_usage_bytes` | Gauge | Redis 메모리 사용량 |
| `file_upload_total` | Counter | 파일 업로드 수 |

---

## 환경 변수

### .env (Docker Compose 전체 실행용)
```env
DATABASE_URL=postgresql://chatops:chatops@postgres:5432/chatops
REDIS_HOST=redis
REDIS_PORT=6379
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=chatops-files
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=production
```

### .env.dev (로컬 개발용 — 인프라만 Docker, API/Client는 로컬)
```env
DATABASE_URL=postgresql://chatops:chatops@localhost:5432/chatops
REDIS_HOST=localhost
REDIS_PORT=6379
RABBITMQ_URL=amqp://guest:guest@localhost:5672
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=chatops-files
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
```

---

## 실행 방법

### 개발 모드 (일상 개발 시 사용)

인프라만 Docker로 올리고, API/Client는 로컬에서 핫 리로드로 실행한다.

```bash
# 1. 인프라 컨테이너 올리기
docker compose -f docker-compose.dev.yml up -d

# 2. API 서버 실행 (터미널 1)
cd api
pnpm install
pnpm run start:dev

# 3. 프론트엔드 실행 (터미널 2)
cd client
pnpm install
pnpm run dev

# 4. DB 마이그레이션 (최초 1회 또는 스키마 변경 시)
cd api
npx prisma migrate dev

# 5. 시드 데이터 (최초 1회)
npx prisma db seed
```

### docker-compose.dev.yml (개발용 인프라)
```yaml
services:
  postgres:
    image: postgres:16
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: chatops
      POSTGRES_PASSWORD: chatops
      POSTGRES_DB: chatops
    volumes:
      - pg_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"
      - "15672:15672"

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin

volumes:
  pg_data:
```

### 전체 Docker 실행 (배포/통합 테스트 시)

모든 서비스를 Docker로 올린다.

```bash
# 전체 서비스 빌드 및 실행
docker compose up -d --build

# DB 마이그레이션
docker compose exec api npx prisma migrate deploy

# 시드 데이터
docker compose exec api npx prisma db seed

# 로그 확인
docker compose logs -f api

# 서비스 중지
docker compose down
```

### docker-compose.yml (전체 실행)
```yaml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    depends_on:
      - api
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf

  api:
    build: ./api
    deploy:
      replicas: 2
    depends_on:
      - postgres
      - redis
      - rabbitmq
    env_file:
      - .env

  client:
    build: ./client
    depends_on:
      - api

  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: chatops
      POSTGRES_PASSWORD: chatops
      POSTGRES_DB: chatops
    volumes:
      - pg_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine

  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "15672:15672"

  worker-notification:
    build: ./workers/notification
    depends_on:
      - rabbitmq
    env_file:
      - .env

  worker-read-receipt:
    build: ./workers/read-receipt
    depends_on:
      - rabbitmq
    env_file:
      - .env

  worker-file-process:
    build: ./workers/file-process
    depends_on:
      - rabbitmq
      - minio
    env_file:
      - .env

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    ports:
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin

  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"

volumes:
  pg_data:
```

---

## 주요 URL

### 개발 모드
| 서비스 | URL |
|--------|-----|
| 프론트엔드 | http://localhost:5173 |
| API 서버 | http://localhost:3000 |
| PostgreSQL | localhost:5432 (user: chatops / pw: chatops) |
| RabbitMQ 관리 콘솔 | http://localhost:15672 (guest/guest) |
| MinIO 콘솔 | http://localhost:9001 (minioadmin/minioadmin) |

### 전체 Docker 실행 시
| 서비스 | URL |
|--------|-----|
| 프론트엔드 (Nginx) | http://localhost |
| API (Nginx 경유) | http://localhost/api |
| RabbitMQ 관리 콘솔 | http://localhost:15672 |
| MinIO 콘솔 | http://localhost:9001 |
| Grafana 대시보드 | http://localhost:3000 |
| Prometheus | http://localhost:9090 |

---

## 코딩 컨벤션

### 공통
- 언어: TypeScript (strict mode)
- 패키지 매니저: pnpm (`.npmrc`에 `shamefully-hoist=true` 설정)
- 코드 포맷: Prettier (singleQuote: true, trailingComma: 'all', semi: true)
- 린트: ESLint (NestJS 기본 설정)
- 커밋 메시지: Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`)

### Backend (NestJS)
- 모듈 단위로 폴더 분리 (auth, chat, user, redis, queue, file, metrics)
- 서비스 레이어에 비즈니스 로직 집중, 컨트롤러는 얇게 유지
- DTO 유효성 검사: class-validator + class-transformer
- 에러 처리: NestJS ExceptionFilter 사용
- WebSocket: `@WebSocketGateway()` 데코레이터 사용
- 환경 변수: `.env` 파일, `@nestjs/config` 모듈로 관리

### Frontend (React)
- 함수형 컴포넌트 + Hooks
- 상태 관리: Zustand (전역), useState (로컬)
- API 호출: axios 인스턴스 (interceptor로 토큰 자동 첨부)
- 컴포넌트 구조: pages > components > hooks > stores

### Docker
- 컨테이너 네이밍: `chatops-{서비스명}` (예: chatops-api, chatops-redis)
- `.dockerignore`에 node_modules, .git, .env.local 포함
- 멀티스테이지 빌드로 이미지 경량화

### Git 브랜치 전략
- `main`: 안정 배포 브랜치
- `develop`: 개발 통합 브랜치
- `feature/{기능명}`: 기능 개발 브랜치
- `hotfix/{이슈}`: 긴급 수정

---

## 개발 단계

| 단계 | 주차 | 작업 | 인프라 |
|------|------|------|--------|
| 1단계 | 1주차 | Docker Compose 환경 + API 서버 + PostgreSQL + 유저 인증 + 채팅방 CRUD | Docker, PostgreSQL |
| 2단계 | 2주차 | WebSocket 연동, 1:1/그룹 실시간 메시지 전송/수신 | Socket.io |
| 3단계 | 3주차 | Redis 도입 — Pub/Sub, 온라인 상태, 읽지 않은 메시지 캐싱 | Redis |
| 4단계 | 4주차 | RabbitMQ 도입 — 알림, 읽음 처리, 파일 후처리 Consumer | RabbitMQ |
| 5단계 | 5주차 | Nginx 리버스 프록시 + Jenkins CI/CD | Nginx, Jenkins |
| 6단계 | 6주차 | Prometheus + Grafana 모니터링 + MinIO 파일 스토리지 | Prometheus, Grafana, MinIO |
