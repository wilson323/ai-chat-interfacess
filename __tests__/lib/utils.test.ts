import { cn } from '@/lib/utils'

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2')
  })

  it('should handle conditional classes', () => {
    expect(cn('base', true && 'conditional')).toBe('base conditional')
    expect(cn('base', false && 'conditional')).toBe('base')
  })

  it('should handle undefined and null values', () => {
    expect(cn('base', undefined, null)).toBe('base')
  })

  it('should handle empty strings', () => {
    expect(cn('base', '')).toBe('base')
  })

  it('should handle arrays of classes', () => {
    expect(cn(['class1', 'class2'])).toBe('class1 class2')
  })

  it('should handle mixed arguments', () => {
    expect(cn('base', 'class1', true && 'conditional', false && 'hidden')).toBe('base class1 conditional')
  })
})
