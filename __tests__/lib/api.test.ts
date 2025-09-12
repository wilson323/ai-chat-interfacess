import { generateFallbackChatId } from '@/lib/api/fastgpt'

describe('FastGPT API utilities', () => {
  describe('generateFallbackChatId', () => {
    it('should generate a valid chat ID', () => {
      const chatId = generateFallbackChatId()
      expect(chatId).toBeDefined()
      expect(typeof chatId).toBe('string')
      expect(chatId.length).toBeGreaterThan(0)
    })

    it('should generate unique chat IDs', () => {
      const chatId1 = generateFallbackChatId()
      const chatId2 = generateFallbackChatId()
      expect(chatId1).not.toBe(chatId2)
    })

    it('should generate chat ID with correct format', () => {
      const chatId = generateFallbackChatId()
      // Should be a UUID-like string
      expect(chatId).toMatch(/^[a-f0-9-]+$/)
    })
  })
})
