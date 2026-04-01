import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { ChatRoom } from '@/components/chat/ChatRoom';
import { ChatList } from '@/components/chat/ChatList';
import { NewChatModal } from '@/components/chat/NewChatModal';
import { useChatStore, getLastRoomId, clearLastRoomId } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import { requestNotificationPermission } from '@/utils/notification';

export function ChatPage() {
  const [showNewChat, setShowNewChat] = useState(false);
  const { roomId: urlRoomId } = useParams<{ roomId?: string }>();
  const navigate = useNavigate();
  const currentRoom = useChatStore((s) => s.currentRoom);
  const rooms = useChatStore((s) => s.rooms);
  const setCurrentRoom = useChatStore((s) => s.setCurrentRoom);
  const user = useAuthStore((s) => s.user);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const hasRestoredRef = useRef(false);

  // Request browser notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Navigate to room when browser notification is clicked
  useEffect(() => {
    const handler = (e: Event) => {
      const roomId = (e as CustomEvent<{ roomId: string }>).detail.roomId;
      const room = useChatStore.getState().rooms.find((r) => r.id === roomId);
      if (room) {
        setCurrentRoom(room);
        navigate(`/chat/${roomId}`, { replace: true });
      }
    };
    window.addEventListener('navigate-to-room', handler);
    return () => window.removeEventListener('navigate-to-room', handler);
  }, [navigate, setCurrentRoom]);

  // Restore last room after rooms are loaded
  useEffect(() => {
    if (hasRestoredRef.current || rooms.length === 0 || currentRoom || !user) return;
    hasRestoredRef.current = true;

    const targetRoomId = urlRoomId || getLastRoomId(user.id);
    if (!targetRoomId) return;

    const room = rooms.find((r) => r.id === targetRoomId);
    if (room) {
      setCurrentRoom(room);
      if (!urlRoomId) {
        navigate(`/chat/${room.id}`, { replace: true });
      }
    } else {
      // Room not found (deleted/kicked) — clean up silently
      clearLastRoomId(user.id);
      if (urlRoomId) {
        navigate('/chat', { replace: true });
      }
    }
  }, [rooms, currentRoom, user, urlRoomId, navigate, setCurrentRoom]);

  const handleSelectRoom = () => {
    // On mobile, close sidebar when a room is selected
    if (window.innerWidth < 1024) {
      toggleSidebar();
    }
  };

  return (
    <div className="flex h-screen bg-white" onClick={undefined}>
      <Sidebar onNewChat={() => setShowNewChat(true)}>
        <ChatList onSelectRoom={handleSelectRoom} />
      </Sidebar>

      {/* Main chat area */}
      <main className="flex min-w-0 flex-1 flex-col">
        <ChatRoom />
      </main>

      {/* New chat modal */}
      <NewChatModal
        isOpen={showNewChat}
        onClose={() => setShowNewChat(false)}
      />

      {/* Mobile: show back button overlay when room is selected */}
      {currentRoom && (
        <button
          onClick={toggleSidebar}
          className="fixed left-4 top-4 z-10 rounded-lg bg-white/80 p-2 shadow-md backdrop-blur-sm lg:hidden"
          aria-label="Open sidebar"
        >
          <svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}
    </div>
  );
}
