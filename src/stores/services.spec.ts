import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useServicesStore } from './services'
import { stubFetch } from '@/test/helpers'

describe('services store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.unstubAllGlobals()
  })

  it('loads summaries and stats, and reaches the ready state', async () => {
    stubFetch()
    const store = useServicesStore()

    expect(store.listStatus).toBe('idle')
    await store.load('en')

    expect(store.listStatus).toBe('ready')
    expect(store.summaries).toHaveLength(1)
    expect(store.stats[0]!.value).toBe('1,400+')
    expect(store.error).toBeNull()
  })

  it('requests the active locale', async () => {
    const { calls } = stubFetch()
    const store = useServicesStore()

    await store.load('zh-TW')

    expect(calls).toContain('/api/services?lang=zh-TW')
    expect(calls).toContain('/api/stats?lang=zh-TW')
  })

  it('surfaces the server error message and stays recoverable', async () => {
    stubFetch({ failList: true })
    const store = useServicesStore()

    await store.load('en')

    expect(store.listStatus).toBe('error')
    expect(store.error).toBe('Upstream is down.')
  })

  it('filters the visible list without refetching', async () => {
    const { calls } = stubFetch()
    const store = useServicesStore()
    await store.load('en')
    const before = calls.length

    store.setFilter('water')
    expect(store.visible).toHaveLength(0)

    store.setFilter('transportation')
    expect(store.visible).toHaveLength(1)

    store.setFilter('all')
    expect(store.visible).toHaveLength(1)
    expect(calls.length).toBe(before)
  })

  it('caches a detail record so reopening costs nothing', async () => {
    const { calls } = stubFetch()
    const store = useServicesStore()
    await store.load('en')

    await store.open('transportation')
    const afterFirst = calls.filter((url) => url.includes('/api/services/')).length

    store.close()
    await store.open('transportation')

    expect(calls.filter((url) => url.includes('/api/services/')).length).toBe(afterFirst)
    expect(store.detailStatus).toBe('ready')
    expect(store.openService?.caseStudies).toHaveLength(1)
  })

  it('clears the openSlug on close', async () => {
    stubFetch()
    const store = useServicesStore()
    await store.load('en')

    await store.open('transportation')
    expect(store.openSlug).toBe('transportation')

    store.close()
    expect(store.openSlug).toBeNull()
    expect(store.openService).toBeNull()
  })

  it('empties the detail cache when the locale changes', async () => {
    const { calls } = stubFetch()
    const store = useServicesStore()

    await store.switchLocale('en')
    await store.open('transportation')
    const englishDetailCalls = calls.filter((url) => url.includes('lang=en')).length

    await store.switchLocale('zh-TW')

    expect(store.locale).toBe('zh-TW')
    expect(calls.filter((url) => url.includes('lang=zh-TW')).length).toBeGreaterThan(0)
    expect(englishDetailCalls).toBeGreaterThan(0)
  })

  it('derives one flagship project per discipline once details land', async () => {
    stubFetch()
    const store = useServicesStore()

    await store.load('en')
    expect(store.flagships).toHaveLength(0)

    await store.loadAllDetails()
    expect(store.flagships).toHaveLength(1)
    expect(store.flagships[0]!.study.name).toBe('Kosciuszko Bridge')
  })

  it('prefetches quietly and swallows failures', async () => {
    stubFetch()
    const store = useServicesStore()
    await store.load('en')

    store.prefetch('nope')
    await Promise.resolve()

    expect(store.error).toBeNull()
  })
})
