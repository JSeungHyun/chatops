import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { ChatRoom } from '@/components/chat/ChatRoom';
import { ChatList } from '@/components/chat/ChatList';
import { NewChatModal } from '@/components/chat/NewChatModal';
import { useChatStore } from '@/stores/chatStore';
import { useUiStore } from '@/stores/uiStore';

export function ChatPage() {
  const [showNewChat, setShowNewChat] = useState(false);
  const currentRoom = useChatStore((s) => s.currentRoom);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

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
