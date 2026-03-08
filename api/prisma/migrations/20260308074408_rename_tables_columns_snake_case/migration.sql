-- ============================================================================
-- Prisma Schema Update: snake_case 테이블/컬럼 RENAME + COMMENT 추가
-- 데이터 보존을 위해 DROP+CREATE 대신 ALTER RENAME 사용
-- ============================================================================

-- ============================================================================
-- Step 1: FK 제약조건 DROP (테이블/컬럼 RENAME 전에 먼저 제거)
-- ============================================================================
ALTER TABLE "ChatRoomMember" DROP CONSTRAINT "ChatRoomMember_userId_fkey";
ALTER TABLE "ChatRoomMember" DROP CONSTRAINT "ChatRoomMember_roomId_fkey";
ALTER TABLE "Message" DROP CONSTRAINT "Message_userId_fkey";
ALTER TABLE "Message" DROP CONSTRAINT "Message_roomId_fkey";
ALTER TABLE "ReadReceipt" DROP CONSTRAINT "ReadReceipt_userId_fkey";
ALTER TABLE "ReadReceipt" DROP CONSTRAINT "ReadReceipt_messageId_fkey";

-- ============================================================================
-- Step 2: 테이블명 변경
-- ============================================================================
ALTER TABLE "User" RENAME TO "account_info";
ALTER TABLE "ChatRoom" RENAME TO "chat_room";
ALTER TABLE "ChatRoomMember" RENAME TO "chat_room_member";
ALTER TABLE "Message" RENAME TO "message";
ALTER TABLE "ReadReceipt" RENAME TO "read_receipt";

-- ============================================================================
-- Step 3: 컬럼명 변경 (camelCase -> snake_case)
-- ============================================================================
-- account_info
ALTER TABLE "account_info" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "account_info" RENAME COLUMN "updatedAt" TO "updated_at";

-- chat_room
ALTER TABLE "chat_room" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "chat_room" RENAME COLUMN "updatedAt" TO "updated_at";

-- chat_room_member
ALTER TABLE "chat_room_member" RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "chat_room_member" RENAME COLUMN "roomId" TO "room_id";
ALTER TABLE "chat_room_member" RENAME COLUMN "joinedAt" TO "joined_at";

-- message
ALTER TABLE "message" RENAME COLUMN "fileUrl" TO "file_url";
ALTER TABLE "message" RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "message" RENAME COLUMN "roomId" TO "room_id";
ALTER TABLE "message" RENAME COLUMN "createdAt" TO "created_at";

-- read_receipt
ALTER TABLE "read_receipt" RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "read_receipt" RENAME COLUMN "messageId" TO "message_id";
ALTER TABLE "read_receipt" RENAME COLUMN "readAt" TO "read_at";

-- ============================================================================
-- Step 4: PK 제약조건 RENAME (5개)
-- ============================================================================
ALTER INDEX "User_pkey" RENAME TO "account_info_pkey";
ALTER INDEX "ChatRoom_pkey" RENAME TO "chat_room_pkey";
ALTER INDEX "ChatRoomMember_pkey" RENAME TO "chat_room_member_pkey";
ALTER INDEX "Message_pkey" RENAME TO "message_pkey";
ALTER INDEX "ReadReceipt_pkey" RENAME TO "read_receipt_pkey";

-- ============================================================================
-- Step 5: UNIQUE 인덱스 RENAME (3개)
-- ============================================================================
ALTER INDEX "User_email_key" RENAME TO "account_info_email_key";
ALTER INDEX "ChatRoomMember_userId_roomId_key" RENAME TO "chat_room_member_user_id_room_id_key";
ALTER INDEX "ReadReceipt_userId_messageId_key" RENAME TO "read_receipt_user_id_message_id_key";

-- ============================================================================
-- Step 6: 일반 인덱스 RENAME (2개)
-- ============================================================================
ALTER INDEX "Message_roomId_createdAt_idx" RENAME TO "message_room_id_created_at_idx";
ALTER INDEX "ReadReceipt_messageId_idx" RENAME TO "read_receipt_message_id_idx";

-- ============================================================================
-- Step 7: FK 제약조건 재생성 (새 테이블/컬럼명 기준, 6개)
-- ============================================================================
ALTER TABLE "chat_room_member" ADD CONSTRAINT "chat_room_member_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "account_info"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "chat_room_member" ADD CONSTRAINT "chat_room_member_room_id_fkey"
  FOREIGN KEY ("room_id") REFERENCES "chat_room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "message" ADD CONSTRAINT "message_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "account_info"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "message" ADD CONSTRAINT "message_room_id_fkey"
  FOREIGN KEY ("room_id") REFERENCES "chat_room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "read_receipt" ADD CONSTRAINT "read_receipt_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "account_info"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "read_receipt" ADD CONSTRAINT "read_receipt_message_id_fkey"
  FOREIGN KEY ("message_id") REFERENCES "message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================================================
-- Step 8: Enum 타입명 변경
-- ============================================================================
ALTER TYPE "RoomType" RENAME TO "room_type";
ALTER TYPE "MessageType" RENAME TO "message_type";

-- ============================================================================
-- Step 9: 테이블/컬럼 COMMENT 추가
-- ============================================================================
COMMENT ON TABLE "account_info" IS '사용자 계정 정보';
COMMENT ON COLUMN "account_info"."id" IS '사용자 고유 식별자 (UUID)';
COMMENT ON COLUMN "account_info"."email" IS '이메일 주소 (로그인 ID, 고유값)';
COMMENT ON COLUMN "account_info"."nickname" IS '사용자 닉네임 (표시 이름)';
COMMENT ON COLUMN "account_info"."avatar" IS '프로필 이미지 URL';
COMMENT ON COLUMN "account_info"."password" IS '비밀번호 (해시 저장)';
COMMENT ON COLUMN "account_info"."created_at" IS '계정 생성 일시';
COMMENT ON COLUMN "account_info"."updated_at" IS '계정 정보 수정 일시';

COMMENT ON TABLE "chat_room" IS '채팅방 (1:1 또는 그룹)';
COMMENT ON COLUMN "chat_room"."id" IS '채팅방 고유 식별자 (UUID)';
COMMENT ON COLUMN "chat_room"."name" IS '채팅방 이름 (그룹 채팅 시 사용)';
COMMENT ON COLUMN "chat_room"."type" IS '채팅방 유형 (DIRECT: 1:1, GROUP: 그룹)';
COMMENT ON COLUMN "chat_room"."created_at" IS '채팅방 생성 일시';
COMMENT ON COLUMN "chat_room"."updated_at" IS '채팅방 정보 수정 일시';

COMMENT ON TABLE "chat_room_member" IS '채팅방 참여 멤버 (다대다 조인 테이블)';
COMMENT ON COLUMN "chat_room_member"."id" IS '멤버십 고유 식별자 (UUID)';
COMMENT ON COLUMN "chat_room_member"."user_id" IS '참여 사용자 ID (FK -> account_info.id)';
COMMENT ON COLUMN "chat_room_member"."room_id" IS '참여 채팅방 ID (FK -> chat_room.id)';
COMMENT ON COLUMN "chat_room_member"."joined_at" IS '채팅방 참여 일시';

COMMENT ON TABLE "message" IS '채팅 메시지';
COMMENT ON COLUMN "message"."id" IS '메시지 고유 식별자 (UUID)';
COMMENT ON COLUMN "message"."content" IS '메시지 본문 내용';
COMMENT ON COLUMN "message"."type" IS '메시지 유형 (TEXT, IMAGE, FILE)';
COMMENT ON COLUMN "message"."file_url" IS '첨부 파일 URL (MinIO 경로)';
COMMENT ON COLUMN "message"."user_id" IS '발신자 ID (FK -> account_info.id)';
COMMENT ON COLUMN "message"."room_id" IS '대상 채팅방 ID (FK -> chat_room.id)';
COMMENT ON COLUMN "message"."created_at" IS '메시지 전송 일시';

COMMENT ON TABLE "read_receipt" IS '메시지 읽음 확인 기록';
COMMENT ON COLUMN "read_receipt"."id" IS '읽음 기록 고유 식별자 (UUID)';
COMMENT ON COLUMN "read_receipt"."user_id" IS '읽은 사용자 ID (FK -> account_info.id)';
COMMENT ON COLUMN "read_receipt"."message_id" IS '읽은 메시지 ID (FK -> message.id)';
COMMENT ON COLUMN "read_receipt"."read_at" IS '메시지 읽은 일시';
