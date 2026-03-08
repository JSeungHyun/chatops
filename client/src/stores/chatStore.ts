import { create } from 'zustand';
import type { ChatRoom, Message } from '../types/chat';

const LAST_ROOM_KEY_PREFIX = 'chatops_last_room:';

export function saveLastRoomId(userId: string, roomId: string) {
  try {
    localStorage.setItem(`${LAST_ROOM_KEY_PREFIX}${userId}`, roomId);
  } catch {
    // localStorage unavailable (e.g. private browsing)
  }
}

export function getLastRoomId(userId: string): string | null {
  try {
    return localStorage.getItem(`${LAST_ROOM_KEY_PREFIX}${userId}`);
  } catch {
    return null;
  }
}

export function clearLastRoomId(userId: string) {
  try {
    localStorage.removeItem(`${LAST_ROOM_KEY_PREFIX}${userId}`);
  } catch {
    // ignore
  }
}

interface ChatState {
  rooms: ChatRoom[];
  currentRoom: ChatRoom | null;
  messages: Message[];
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  isLoadingMessages: boolean;
  setRooms: (rooms: ChatRoom[]) => void;
  setCurrentRoom: (room: ChatRoom | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  prependMessages: (messages: Message[]) => void;
  resetMessages: () => void;
  setCurrentPage: (page: number) => void;
  setTotalPages: (total: number) => void;
  setHasMore: (hasMore: boolean) => void;
  setIsLoadingMessages: (loading: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  rooms: [],
  currentRoom: null,
  messages: [],
  currentPage: 1,
  totalPages: 0,
  hasMore: false,
  isLoadingMessages: false,
  setRooms: (rooms) => set({ rooms }),
  setCurrentRoom: (room) => set({ currentRoom: room }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  prependMessages: (messages) =>
    set((state) => ({ messages: [...messages, ...state.messages] })),
  resetMessages: () =>
    set({ messages: [], currentPage: 1, totalPages: 0, hasMore: false }),
  setCurrentPage: (currentPage) => set({ currentPage }),
  setTotalPages: (totalPages) => set({ totalPages }),
  setHasMore: (hasMore) => set({ hasMore }),
  setIsLoadingMessages: (isLoadingMessages) => set({ isLoadingMessages }),
}));
