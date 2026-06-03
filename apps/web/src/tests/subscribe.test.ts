import { describe, it, expect } from 'vitest'

// Test the validation logic extracted from subscribe route
function validateSubscribeInput(email: unknown, consent: unknown): { valid: boolean; code?: string } {
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return { valid: false, code: 'INVALID_EMAIL' }
  }
  if (!consent) {
    return { valid: false, code: 'NO_CONSENT' }
  }
  // PDPA: reject IC-number-like patterns
  if (/\d{12}/.test(email)) {
    return { valid: false, code: 'INVALID_EMAIL' }
  }
  return { valid: true }
}

describe('newsletter subscribe validation', () => {
  it('rejects missing email', () => {
    expect(validateSubscribeInput(undefined, true)).toMatchObject({ valid: false, code: 'INVALID_EMAIL' })
  })
  it('rejects email without @', () => {
    expect(validateSubscribeInput('notanemail', true)).toMatchObject({ valid: false })
  })
  it('rejects when consent is false', () => {
    expect(validateSubscribeInput('test@example.com', false)).toMatchObject({ valid: false, code: 'NO_CONSENT' })
  })
  it('accepts valid email with consent', () => {
    expect(validateSubscribeInput('supporter@example.com', true)).toMatchObject({ valid: true })
  })
  it('rejects 12-digit IC-like string in email field', () => {
    expect(validateSubscribeInput('123456789012@example.com', true)).toMatchObject({ valid: false })
  })
})
