import { create } from "zustand";
import { persist } from "zustand/middleware";
import { loadMessagesFromStorage, saveMessagesToStorage } from "@/lib/storage/index";
import type { Message } from "@/types/message";
import type { ConversationAgentType } from "@/types/agent"

interface MessageState {
  messages: Record<string, Message[]>; // chatId -> messages
  loadMessages: (chatId: ConversationAgentType) => Message[];
  saveMessages: (chatId: ConversationAgentType, messages: Message[]) => void;
  clearMessages: (chatId: ConversationAgentType) => void;
}

export const useMessageStore = create<MessageState>()(
  persist<MessageState>(
    (set, get) => ({
      messages: {},
      loadMessages: (chatId: ConversationAgentType) => {
        const loaded = loadMessagesFromStorage(chatId) ?? [];
        set(state => ({
          messages: { ...state.messages, [chatId]: loaded }
        }));
        return loaded;
      },
      saveMessages: (chatId: ConversationAgentType, messages: Message[]) => {
        saveMessagesToStorage(chatId, messages);
        set(state => ({
          messages: { ...state.messages, [chatId]: messages }
        }));
      },
      clearMessages: (chatId: ConversationAgentType) => {
        set(state => {
          const newMessages = { ...state.messages };
          delete newMessages[chatId];
          return { messages: newMessages };
        });
      }
    }),
    { name: "message-storage" }
  )
); 