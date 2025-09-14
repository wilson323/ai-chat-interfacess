import { generateFallbackChatId } from '@/lib/api/fastgpt';

describe('FastGPT API utilities', () => {
  describe('generateFallbackChatId', () => {
    it('should generate a valid chat ID', () => {
      const chatId = generateFallbackChatId();
      expect(chatId).toBeDefined();
      expect(typeof chatId).toBe('string');
      expect(chatId.length).toBeGreaterThan(0);
    });

    it('should generate unique chat IDs', () => {
      const chatId1 = generateFallbackChatId();
      const chatId2 = generateFallbackChatId();
      expect(chatId1).not.toBe(chatId2);
    });

    it('should generate chat ID with correct business format', () => {
      const chatId = generateFallbackChatId();
      // Should be a local fallback ID format: local_timestamp_randomstring
      expect(chatId).toMatch(/^local_\d+_[a-z0-9]+$/);
    });

    it('should contain local prefix for fallback identification', () => {
      const chatId = generateFallbackChatId();
      expect(chatId.startsWith('local_')).toBe(true);
    });

    it('should contain timestamp for uniqueness', () => {
      const chatId = generateFallbackChatId();
      const parts = chatId.split('_');
      expect(parts).toHaveLength(3);
      expect(parts[0]).toBe('local');
      expect(parts[1]).toMatch(/^\d+$/); // timestamp
      expect(parts[2]).toMatch(/^[a-z0-9]+$/); // random string
    });
  });
});
