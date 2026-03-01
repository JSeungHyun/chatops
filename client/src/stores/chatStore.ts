import { create } from 'zustand';
import type { ChatRoom, Message } from '../types/chat';

interface ChatState {
  rooms: ChatRoom[];
  currentRoom: ChatRoom | null;
  messages: Message[];
  setRooms: (rooms: ChatRoom[]) => void;
  setCurrentRoom: (room: ChatRoom | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  rooms: [],
  currentRoom: null,
  messages: [],
  setRooms: (rooms) => set({ rooms }),
  setCurrentRoom: (room) => set({ currentRoom: room }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
}));
