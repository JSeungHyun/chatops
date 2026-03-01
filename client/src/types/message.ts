import type { User } from './user';

export type MessageType = 'TEXT' | 'IMAGE' | 'FILE';

export interface Message {
  id: string;
  content: string;
  type: MessageType;
  fileUrl?: string;
  userId: string;
  roomId: string;
  createdAt: string;
  user: Pick<User, 'id' | 'email' | 'nickname' | 'avatar'>;
}
