import type { User } from './user';
import type { Message } from './message';

export type RoomType = 'DIRECT' | 'GROUP';

export interface ChatRoom {
  id: string;
  name?: string;
  type: RoomType;
  createdAt: string;
  updatedAt: string;
  members: ChatRoomMember[];
  messages?: Message[];
}

export interface ChatRoomMember {
  id: string;
  userId: string;
  roomId: string;
  joinedAt: string;
  user: Pick<User, 'id' | 'email' | 'nickname' | 'avatar'>;
}

export type { Message } from './message';
