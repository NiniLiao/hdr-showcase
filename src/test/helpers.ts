import { mount, type VueWrapper } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { vi } from 'vitest'
import type { Component, Plugin } from 'vue'
import { messages } from '@/i18n'
import type { Locale, Service, ServiceSummary, Stat } from '@/types'

/** A throwaway i18n instance carrying the real message catalogue. */
export function makeI18n(locale: Locale = 'en') {
  return createI18n({ legacy: false, locale, fallbackLocale: 'en', messages })
}

interface MountOptions {
  props?: Record<string, unknown>
  slots?: Record<string, unknown>
  attachTo?: Element | string
  plugins?: Plugin[]
}

export function mountWith(
  component: Component,
  options: MountOptions = {},
  locale: Locale = 'en',
): VueWrapper {
  const { plugins = [], ...rest } = options

  return mount(component, {
    ...rest,
    global: { plugins: [makeI18n(locale), ...plugins] },
  } as Parameters<typeof mount>[1]) as VueWrapper
}

export const summaryFixture: ServiceSummary = {
  slug: 'transportation',
  code: 'TRB',
  name: 'Transportation and bridge engineering',
  tagline: 'Long-span crossings',
  specs: [{ label: 'Max span', value: '1.2 km' }],
  caseCount: 42,
}

export const serviceFixture: Service = {
  ...summaryFixture,
  description: 'From feasibility to construction engineering.',
  capabilities: ['Cable-stayed and segmental design'],
  caseStudies: [
    {
      id: 'kosciuszko',
      name: 'Kosciuszko Bridge',
      location: 'New York, USA',
      method: 'Cable-stayed',
      completed: 2019,
      value: '$873M',
      summary: 'Replacement of a 1939 truss.',
    },
  ],
}

export const statsFixture: Stat[] = [
  { label: 'Bridges delivered', value: '1,400+', note: 'Since 1917' },
]

export const receiptFixture = {
  reference: 'HDR-2026-ABCDE',
  office: 'San Diego, California',
  respondBy: '2026-08-05',
}

interface StubOptions {
  failList?: boolean
  contactError?: string
  contactDelay?: boolean
}

/** Records every request so tests can assert on caching and `?lang=`. */
export function stubFetch(overrides: StubOptions = {}) {
  const calls: string[] = []
  const bodies: unknown[] = []
  let releaseContact: (() => void) | null = null

  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    calls.push(url)
    if (init?.body) bodies.push(JSON.parse(String(init.body)))

    const reply = (body: unknown, ok = true, status = 200) =>
      ({ ok, status, json: async () => body }) as Response

    if (url.startsWith('/api/services?')) {
      if (overrides.failList) return reply({ error: 'Upstream is down.' }, false, 503)
      const locale = new URL(url, 'http://localhost').searchParams.get('lang')
      return reply({ locale, services: [summaryFixture] })
    }
    if (url.startsWith('/api/services/')) return reply(serviceFixture)
    if (url.startsWith('/api/stats')) return reply({ stats: statsFixture })

    if (url === '/api/contact') {
      if (overrides.contactDelay) {
        await new Promise<void>((resolve) => {
          releaseContact = resolve
        })
      }
      if (overrides.contactError) return reply({ error: overrides.contactError }, false, 400)
      return reply(receiptFixture, true, 201)
    }

    return reply({ error: 'No such endpoint.' }, false, 404)
  })

  vi.stubGlobal('fetch', fetchMock)

  return { fetchMock, calls, bodies, release: () => releaseContact?.() }
}
