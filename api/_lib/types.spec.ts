import { describe, expect, it } from 'vitest'
import { isLocale, resolveLocale } from './types.js'

describe('isLocale', () => {
  it('accepts only the supported tags', () => {
    expect(isLocale('en')).toBe(true)
    expect(isLocale('zh-TW')).toBe(true)
    expect(isLocale('zh-CN')).toBe(false)
    expect(isLocale(undefined)).toBe(false)
  })
})

describe('resolveLocale', () => {
  it('prefers an explicit query parameter', () => {
    expect(resolveLocale('zh-TW', 'en-GB,en;q=0.9')).toBe('zh-TW')
  })

  it('takes the first entry when the query parameter repeats', () => {
    expect(resolveLocale(['zh-TW', 'en'])).toBe('zh-TW')
  })

  it('falls back to Accept-Language and widens regional tags', () => {
    expect(resolveLocale(undefined, 'zh-Hant-TW,zh;q=0.9')).toBe('zh-TW')
    expect(resolveLocale(undefined, 'en-AU,en;q=0.8')).toBe('en')
  })

  it('respects the order of the header', () => {
    expect(resolveLocale(undefined, 'zh-HK,en-US;q=0.7')).toBe('zh-TW')
    expect(resolveLocale(undefined, 'en-US,zh-TW;q=0.7')).toBe('en')
  })

  it('defaults to English for unsupported or missing input', () => {
    expect(resolveLocale(undefined, 'fr-FR,de;q=0.8')).toBe('en')
    expect(resolveLocale()).toBe('en')
    expect(resolveLocale('klingon')).toBe('en')
  })
})
