import { validateInput, sanitizeInput } from '@/lib/security'

describe('Security utilities', () => {
  describe('validateInput', () => {
    it('should validate normal text input', () => {
      expect(validateInput('Hello world')).toBe(true)
    })

    it('should reject input with script tags', () => {
      expect(validateInput('<script>alert("xss")</script>')).toBe(false)
    })

    it('should reject input with javascript: protocol', () => {
      expect(validateInput('javascript:alert("xss")')).toBe(false)
    })

    it('should reject input with onload events', () => {
      expect(validateInput('<img onload="alert(\'xss\')" src="x">')).toBe(false)
    })

    it('should accept input with safe HTML', () => {
      expect(validateInput('<p>Safe HTML</p>')).toBe(true)
    })

    it('should handle empty input', () => {
      expect(validateInput('')).toBe(true)
    })

    it('should handle null and undefined', () => {
      expect(validateInput(null as any)).toBe(false)
      expect(validateInput(undefined as any)).toBe(false)
    })
  })

  describe('sanitizeInput', () => {
    it('should sanitize script tags', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe('')
    })

    it('should sanitize javascript: protocol', () => {
      expect(sanitizeInput('javascript:alert("xss")')).toBe('')
    })

    it('should preserve safe text', () => {
      expect(sanitizeInput('Hello world')).toBe('Hello world')
    })

    it('should preserve safe HTML', () => {
      expect(sanitizeInput('<p>Safe HTML</p>')).toBe('<p>Safe HTML</p>')
    })

    it('should handle empty input', () => {
      expect(sanitizeInput('')).toBe('')
    })

    it('should handle null and undefined', () => {
      expect(sanitizeInput(null as any)).toBe('')
      expect(sanitizeInput(undefined as any)).toBe('')
    })
  })
})
