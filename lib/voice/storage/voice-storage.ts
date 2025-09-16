/**
 * 语音存储服务实现
 * 管理语音文件和配置的存储
 */

import { IVoiceStorage, VoiceConfig } from '@/types/voice';

export class VoiceStorage implements IVoiceStorage {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'VoiceStorage';
  private readonly DB_VERSION = 1;
  private readonly AUDIO_STORE = 'audio';
  private readonly CONFIG_STORE = 'config';

  constructor() {
    this.initDB();
  }

  /**
   * 初始化IndexedDB
   */
  private async initDB(): Promise<void> {
    // 服务端渲染保护
    if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
      console.warn('IndexedDB not available in server environment');
      return;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        reject(new Error('无法打开语音存储数据库'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 创建音频存储
        if (!db.objectStoreNames.contains(this.AUDIO_STORE)) {
          const audioStore = db.createObjectStore(this.AUDIO_STORE, {
            keyPath: 'id',
          });
          audioStore.createIndex('userId', 'userId', { unique: false });
          audioStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // 创建配置存储
        if (!db.objectStoreNames.contains(this.CONFIG_STORE)) {
          db.createObjectStore(this.CONFIG_STORE, {
            keyPath: 'userId',
          });
        }
      };
    });
  }

  /**
   * 保存音频文件
   */
  async saveAudio(
    audioBlob: Blob,
    metadata: Record<string, unknown>
  ): Promise<string> {
    // 服务端渲染保护
    if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
      throw new Error('IndexedDB not available in server environment');
    }

    if (!this.db) {
      await this.initDB();
    }

    const id = this.generateId();
    const audioData = await this.blobToArrayBuffer(audioBlob);

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.AUDIO_STORE], 'readwrite');
      const store = transaction.objectStore(this.AUDIO_STORE);

      const audioRecord = {
        id,
        audioData,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          size: audioBlob.size,
          type: audioBlob.type,
        },
      };

      const request = store.add(audioRecord);

      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(new Error('保存音频文件失败'));
    });
  }

  /**
   * 获取音频文件
   */
  async getAudio(id: string): Promise<Blob | null> {
    // 服务端渲染保护
    if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
      return null;
    }

    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.AUDIO_STORE], 'readonly');
      const store = transaction.objectStore(this.AUDIO_STORE);
      const request = store.get(id);

      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          const blob = new Blob([result.audioData], {
            type: result.metadata.type,
          });
          resolve(blob);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => reject(new Error('获取音频文件失败'));
    });
  }

  /**
   * 删除音频文件
   */
  async deleteAudio(id: string): Promise<void> {
    // 服务端渲染保护
    if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
      return;
    }

    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.AUDIO_STORE], 'readwrite');
      const store = transaction.objectStore(this.AUDIO_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('删除音频文件失败'));
    });
  }

  /**
   * 保存语音配置
   */
  async saveConfig(config: VoiceConfig): Promise<void> {
    // 服务端渲染保护
    if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
      return;
    }

    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [this.CONFIG_STORE],
        'readwrite'
      );
      const store = transaction.objectStore(this.CONFIG_STORE);
      const request = store.put(config);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('保存语音配置失败'));
    });
  }

  /**
   * 获取语音配置
   */
  async getConfig(userId: string): Promise<VoiceConfig | null> {
    // 服务端渲染保护
    if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
      return null;
    }

    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.CONFIG_STORE], 'readonly');
      const store = transaction.objectStore(this.CONFIG_STORE);
      const request = store.get(userId);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => reject(new Error('获取语音配置失败'));
    });
  }

  /**
   * 删除语音配置
   */
  async deleteConfig(userId: string): Promise<void> {
    // 服务端渲染保护
    if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
      return;
    }

    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [this.CONFIG_STORE],
        'readwrite'
      );
      const store = transaction.objectStore(this.CONFIG_STORE);
      const request = store.delete(userId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('删除语音配置失败'));
    });
  }

  /**
   * 清理过期音频文件
   */
  async cleanupExpiredAudio(
    maxAge: number = 7 * 24 * 60 * 60 * 1000
  ): Promise<void> {
    // 服务端渲染保护
    if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
      return;
    }

    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.AUDIO_STORE], 'readwrite');
      const store = transaction.objectStore(this.AUDIO_STORE);
      const index = store.index('timestamp');
      const cutoffTime = new Date(Date.now() - maxAge).toISOString();

      const range = IDBKeyRange.upperBound(cutoffTime);
      const request = index.openCursor(range);

      request.onsuccess = event => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => reject(new Error('清理过期音频文件失败'));
    });
  }

  /**
   * 获取存储统计信息
   */
  async getStorageStats(): Promise<{
    audioCount: number;
    totalSize: number;
    configCount: number;
  }> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [this.AUDIO_STORE, this.CONFIG_STORE],
        'readonly'
      );

      let audioCount = 0;
      let totalSize = 0;
      let configCount = 0;
      let completed = 0;

      const checkComplete = () => {
        completed++;
        if (completed === 2) {
          resolve({ audioCount, totalSize, configCount });
        }
      };

      // 统计音频文件
      const audioStore = transaction.objectStore(this.AUDIO_STORE);
      const audioRequest = audioStore.openCursor();

      audioRequest.onsuccess = event => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          audioCount++;
          totalSize += cursor.value.metadata.size || 0;
          cursor.continue();
        } else {
          checkComplete();
        }
      };

      audioRequest.onerror = () => reject(new Error('获取音频统计失败'));

      // 统计配置
      const configStore = transaction.objectStore(this.CONFIG_STORE);
      const configRequest = configStore.count();

      configRequest.onsuccess = () => {
        configCount = configRequest.result;
        checkComplete();
      };

      configRequest.onerror = () => reject(new Error('获取配置统计失败'));
    });
  }

  /**
   * 将Blob转换为ArrayBuffer
   */
  private async blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(new Error('Blob转换失败'));
      reader.readAsArrayBuffer(blob);
    });
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
