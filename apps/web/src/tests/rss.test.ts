import { describe, it, expect } from 'vitest'

// Extract the pure function to test
function extractExcerpt(text: string): string {
  const sentences = text.replace(/<[^>]+>/g, '').split(/(?<=[.!?])\s+/)
  return sentences.slice(0, 2).join(' ').trim()
}

describe('extractExcerpt', () => {
  it('returns max 2 sentences', () => {
    const input = 'First sentence. Second sentence. Third sentence.'
    const result = extractExcerpt(input)
    expect(result.split(/(?<=[.!?])\s+/).length).toBeLessThanOrEqual(2)
  })
  it('strips HTML tags', () => {
    const input = '<p>First sentence.</p> <b>Second sentence.</b> Third sentence.'
    expect(extractExcerpt(input)).not.toContain('<')
  })
  it('handles single sentence', () => {
    expect(extractExcerpt('Only one sentence.')).toBe('Only one sentence.')
  })
  it('handles empty string', () => {
    expect(extractExcerpt('')).toBe('')
  })
})
