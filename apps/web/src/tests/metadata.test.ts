import { describe, it, expect } from 'vitest'
import { buildMetadata } from '@/lib/metadata'

describe('buildMetadata hreflang', () => {
  it('generates ms and en alternates for ms locale', () => {
    const meta = buildMetadata({ title: 'Test', description: 'Desc', locale: 'ms', slug: 'test' })
    expect(meta.alternates?.languages).toHaveProperty('ms')
    expect(meta.alternates?.languages).toHaveProperty('en')
  })
  it('generates ms and en alternates for en locale', () => {
    const meta = buildMetadata({ title: 'Test', description: 'Desc', locale: 'en', slug: 'test' })
    expect(meta.alternates?.languages).toHaveProperty('ms')
    expect(meta.alternates?.languages).toHaveProperty('en')
  })
  it('includes title and description in result', () => {
    const meta = buildMetadata({ title: 'Bersama Test', description: 'Test desc', locale: 'ms' })
    expect(String(meta.title)).toContain('Bersama Test')
    expect(meta.description).toBe('Test desc')
  })
})
