import { create } from "zustand";
import { persist } from "zustand/middleware";
import { loadMessagesFromStorage, saveMessagesToStorage } from "@/lib/storage/index";
import type { Message } from "@/types/message";

interface MessageState {
  messages: Record<string, Message[]>; // chatId -> messages
  loadMessages: (chatId: string) => Message[];
  saveMessages: (chatId: string, messages: Message[]) => void;
  clearMessages: (chatId: string) => void;
}

export const useMessageStore = create<MessageState>()(
  persist<MessageState>(
    (set, get) => ({
      messages: {},
      loadMessages: (chatId: string) => {
        const loaded = loadMessagesFromStorage(chatId) ?? [];
        set(state => ({
          messages: { ...state.messages, [chatId]: loaded }
        }));
        return loaded;
      },
      saveMessages: (chatId: string, messages: Message[]) => {
        saveMessagesToStorage(chatId, messages);
        set(state => ({
          messages: { ...state.messages, [chatId]: messages }
        }));
      },
      clearMessages: (chatId: string) => {
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