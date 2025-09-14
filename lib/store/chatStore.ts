import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  getAllChatSessions,
  saveMessagesToStorage,
  loadMessagesFromStorage,
  deleteChatSession,
} from '@/lib/storage/index';
import type { Message } from '@/types/message';
import type { ChatSessionIndexItem } from '@/lib/storage/shared/types';

interface ChatState {
  sessions: ChatSessionIndexItem[];
  addSession: (session: ChatSessionIndexItem) => void;
  removeSession: (sessionId: string) => void;
  updateSession: (session: ChatSessionIndexItem) => void;
  getSessionMessages: (sessionId: string) => Message[] | null;
  saveSessionMessages: (sessionId: string, messages: Message[]) => void;
}

export const useChatStore = create<ChatState>()(
  persist<ChatState>(
    (set, get) => ({
      sessions: getAllChatSessions() ?? [],
      addSession: (session: ChatSessionIndexItem) => {
        set({ sessions: [...get().sessions, session] });
      },
      removeSession: (sessionId: string) => {
        deleteChatSession(sessionId);
        set({ sessions: get().sessions.filter(s => s.id !== sessionId) });
      },
      updateSession: (session: ChatSessionIndexItem) => {
        set({
          sessions: get().sessions.map(s =>
            s.id === session.id ? session : s
          ),
        });
      },
      getSessionMessages: (sessionId: string) => {
        return loadMessagesFromStorage(sessionId);
      },
      saveSessionMessages: (sessionId: string, messages: Message[]) => {
        saveMessagesToStorage(sessionId, messages);
      },
    }),
    { name: 'chat-session-storage' }
  )
);
