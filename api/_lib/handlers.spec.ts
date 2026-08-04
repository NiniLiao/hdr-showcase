import { describe, expect, it } from 'vitest'
import { getHighlights, getService, getStats, listServices, submitContact } from './handlers.js'
import type { ContactReceipt, Service } from './types.js'

describe('listServices', () => {
  it('returns every discipline in English by default', () => {
    const { status, body } = listServices()

    expect(status).toBe(200)
    expect(body.locale).toBe('en')
    expect(body.services).toHaveLength(4)
    expect(body.services.map((service) => service.code)).toEqual(['TRB', 'WER', 'SBA', 'EPS'])
  })

  it('localises names and spec labels', () => {
    const { body } = listServices(undefined, 'zh-TW')

    expect(body.services[0]!.name).toBe('交通與橋梁工程')
    expect(body.services[0]!.specs[0]!.label).toBe('最大跨距')
  })

  it('omits heavy fields from the summary payload', () => {
    const [first] = listServices().body.services

    expect(first).not.toHaveProperty('caseStudies')
    expect(first).not.toHaveProperty('description')
    expect(first).not.toHaveProperty('capabilities')
  })

  it('keeps market tags on the summary so the second filter axis works', () => {
    const [first] = listServices().body.services

    expect(first!.markets).toContain('urban')
    expect(first!.markets.length).toBeGreaterThan(1)
  })

  it('covers every market across the four services', () => {
    const covered = new Set(listServices().body.services.flatMap((service) => service.markets))

    expect([...covered].sort()).toEqual(['civic', 'health', 'industrial', 'science', 'urban'])
  })

  it('filters on name, tagline, code and capabilities', () => {
    expect(listServices('bridge').body.services).toHaveLength(1)
    expect(listServices('EPS').body.services[0]!.slug).toBe('energy')
    expect(listServices('offshore').body.services[0]!.slug).toBe('energy')
    expect(listServices('nothing at all').body.services).toHaveLength(0)
  })

  it('searches the localised text, not the source text', () => {
    expect(listServices('耐震', 'zh-TW').body.services[0]!.slug).toBe('transportation')
    expect(listServices('耐震', 'en').body.services).toHaveLength(0)
  })
})

describe('getService', () => {
  it('returns the full record including case studies', () => {
    const { status, body } = getService('water')
    const service = body as Service

    expect(status).toBe(200)
    expect(service.slug).toBe('water')
    expect(service.capabilities.length).toBeGreaterThan(0)
    expect(service.caseStudies[0]!.name).toBe('Pure Water programme')
  })

  it('localises case study copy', () => {
    const service = getService('water', 'zh-TW').body as Service

    expect(service.caseStudies[0]!.location).toBe('美國聖地牙哥')
    expect(service.caseStudies[0]!.value).toBe('$1.8B')
  })

  it('404s with a localised message that echoes the slug', () => {
    const missing = getService('rockets')
    expect(missing.status).toBe(404)
    expect(missing.body).toEqual({ error: 'No service matches “rockets”.' })

    expect(getService('rockets', 'zh-TW').body).toEqual({ error: '找不到符合「rockets」的服務。' })
  })
})

describe('getStats', () => {
  it('returns the three credentials in order', () => {
    const stats = getStats().body.stats

    expect(stats).toHaveLength(3)
    expect(stats.map((stat) => stat.value)).toEqual(['No. 6', '15K+', '200+'])
  })

  it('keeps figures stable across locales and translates the notes', () => {
    const en = getStats().body.stats
    const zh = getStats('zh-TW').body.stats

    expect(en.map((stat) => stat.value)).toEqual(zh.map((stat) => stat.value))
    expect(zh[1]!.label).toBe('員工股東')
  })
})

describe('getHighlights', () => {
  it('returns one hero slide per featured discipline', () => {
    const { status, body } = getHighlights()

    expect(status).toBe(200)
    expect(body.highlights).toHaveLength(3)
    expect(body.highlights.map((highlight) => highlight.slug)).toEqual([
      'transportation',
      'water',
      'buildings',
    ])
  })

  it('points every slide at a service that actually exists', () => {
    const slugs = new Set(listServices().body.services.map((service) => service.slug))

    for (const highlight of getHighlights().body.highlights) {
      expect(slugs.has(highlight.slug)).toBe(true)
    }
  })

  it('carries a photo basename and a localised alt for every slide', () => {
    for (const highlight of getHighlights().body.highlights) {
      expect(highlight.image).toBeTruthy()
      expect(highlight.imageAlt).toBeTruthy()
    }

    const zh = getHighlights('zh-TW').body.highlights
    expect(zh[0]!.image).toBe('architecture')
    expect(zh[0]!.imageAlt).toContain('玻璃帷幕辦公大樓')
  })

  it('carries a sourced caption and a link back to hdrinc.com', () => {
    const [en] = getHighlights().body.highlights
    const [zh] = getHighlights('zh-TW').body.highlights

    expect(en!.caption).toContain('predictive analytics')
    expect(zh!.caption).toContain('預測分析')
    expect(en!.sourceUrl).toBe('https://www.hdrinc.com/services/architecture')
    expect(zh!.sourceUrl).toBe(en!.sourceUrl)
  })

  it('points every caption at a real HDR services page', () => {
    for (const highlight of getHighlights().body.highlights) {
      expect(highlight.caption!.length).toBeGreaterThan(80)
      expect(highlight.sourceUrl).toMatch(/^https:\/\/www\.hdrinc\.com\/services\//)
    }
  })

  it('localises the narrative copy', () => {
    const [first] = getHighlights('zh-TW').body.highlights

    expect(first!.location).toBe('美國紐約')
    expect(first!.headline).toContain('桁架')
    expect(first!.linkLabel).toContain('Kosciuszko')
  })
})

describe('submitContact', () => {
  const valid = {
    name: 'Nini',
    email: 'nini@example.com',
    discipline: 'energy' as const,
    message: 'We need an interconnection study.',
  }

  it('accepts a complete enquiry and routes it to a regional office', () => {
    const { status, body } = submitContact(valid)
    const receipt = body as ContactReceipt

    expect(status).toBe(201)
    expect(receipt.office).toBe('Denver, Colorado')
    expect(receipt.reference).toMatch(/^HDR-\d{4}-[A-Z0-9]{5}$/)
    expect(receipt.respondBy).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('routes an unknown discipline to the default office', () => {
    const receipt = submitContact({ ...valid, discipline: 'general' }).body as ContactReceipt
    expect(receipt.office).toBe('Omaha, Nebraska')
  })

  it('localises the office name', () => {
    const receipt = submitContact({ ...valid, locale: 'zh-TW' }).body as ContactReceipt
    expect(receipt.office).toBe('科羅拉多州丹佛')
  })

  it.each([
    [null, 'Send a JSON body.'],
    [{ ...valid, name: '  ' }, 'Enter your name.'],
    [{ ...valid, email: 'nini@example' }, 'Enter a valid email address.'],
    [{ ...valid, message: 'too short' }, 'Tell us a little more — at least a sentence.'],
  ])('rejects invalid input (%#)', (input, message) => {
    const { status, body } = submitContact(input)

    expect(status).toBe(400)
    expect(body).toEqual({ error: message })
  })

  it('applies a shorter minimum message length for Chinese', () => {
    const zh = { ...valid, locale: 'zh-TW' as const, message: '想蓋一座橋' }

    expect(submitContact(zh).status).toBe(400)
    expect(submitContact({ ...zh, message: '我們想蓋一座跨河橋' }).status).toBe(201)
  })

  it('returns validation errors in the requested locale', () => {
    const { body } = submitContact({ ...valid, locale: 'zh-TW', email: 'nope' })
    expect(body).toEqual({ error: '請填寫正確的 email。' })
  })
})
