export const REDIS_KEYS = {
  USER_STATUS: (userId: string) => `user:${userId}:status`,
  UNREAD_COUNT: (userId: string, roomId: string) => `unread:${userId}:${roomId}`,
  ROOM_MESSAGES: (roomId: string) => `room:${roomId}:messages`,
  ROOM_TYPING: (roomId: string) => `room:${roomId}:typing`,
} as const;

export const REDIS_CHANNELS = {
  CHAT: (roomId: string) => `chat:${roomId}`,
} as const;

export const REDIS_TTL = {
  USER_STATUS: 300,
  ROOM_MESSAGES: 3600,
  ROOM_TYPING: 5,
} as const;
