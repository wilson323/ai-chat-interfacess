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
        // 先尝试从Zustand状态中获取
        const existingMessages = get().messages[chatId];
        if (existingMessages && existingMessages.length > 0) {
          console.log(`Found ${existingMessages.length} messages in Zustand state for chat ID: ${chatId}`);
          return existingMessages;
        }

        // 如果Zustand状态中没有，则从localStorage加载
        const loaded = loadMessagesFromStorage(chatId) ?? [];
        console.log(`Loaded ${loaded.length} messages from localStorage for chat ID: ${chatId}`);

        // 更新Zustand状态
        set(state => ({
          messages: { ...state.messages, [chatId]: loaded }
        }));
        return loaded;
      },
      saveMessages: (chatId: string, messages: Message[]) => {
        // 保存到localStorage
        saveMessagesToStorage(chatId, messages);
        console.log(`Saved ${messages.length} messages to localStorage for chat ID: ${chatId}`);

        // 更新Zustand状态
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
    {
      name: "message-storage",
      // 指定使用localStorage作为存储引擎
      storage: {
        getItem: (name) => {
          try {
            const str = localStorage.getItem(name);
            if (!str) return null;
            return JSON.parse(str);
          } catch (e) {
            console.error('Error loading from localStorage:', e);
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            localStorage.setItem(name, JSON.stringify(value));
          } catch (e) {
            console.error('Error saving to localStorage:', e);
          }
        },
        removeItem: (name) => {
          try {
            localStorage.removeItem(name);
          } catch (e) {
            console.error('Error removing from localStorage:', e);
          }
        }
      }
    }
  )
);