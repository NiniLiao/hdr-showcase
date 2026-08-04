export type DisciplineId = 'transportation' | 'water' | 'buildings' | 'energy'

export const MARKET_IDS = ['health', 'civic', 'science', 'industrial', 'urban'] as const
export type MarketId = (typeof MARKET_IDS)[number]

export const LOCALES = ['en', 'zh-TW'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'en'

export type Localized<T = string> = Record<Locale, T>

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value)
}

/** Resolves `?lang=` first, then an Accept-Language header, then the default. */
export function resolveLocale(lang?: string | string[], header?: string): Locale {
  const requested = Array.isArray(lang) ? lang[0] : lang
  if (isLocale(requested)) return requested

  const tags = (header ?? '')
    .split(',')
    .map((part) => part.split(';')[0]!.trim())
    .filter(Boolean)

  for (const tag of tags) {
    if (isLocale(tag)) return tag
    const lower = tag.toLowerCase()
    if (lower.startsWith('zh')) return 'zh-TW'
    if (lower.startsWith('en')) return 'en'
  }
  return DEFAULT_LOCALE
}

export interface Spec {
  label: string
  value: string
}

export interface CaseStudy {
  id: string
  name: string
  location: string
  method: string
  completed: number
  value: string
  summary: string
}

export interface Service {
  slug: DisciplineId
  code: string
  name: string
  tagline: string
  description: string
  capabilities: string[]
  markets: MarketId[]
  specs: Spec[]
  caseCount: number
  caseStudies: CaseStudy[]
}

/** A hero slide: one project, framed as a story rather than a spec. */
export interface Highlight {
  id: string
  slug: DisciplineId
  market: MarketId
  location: string
  headline: string
  blurb: string
  linkLabel: string
  /** Basename under /hero. Omit to fall back to the drawn plate. */
  image?: string
  imageAlt?: string
  /** Sourced background on the discipline the photo stands for. */
  caption?: string
  sourceUrl?: string
}

export interface Stat {
  label: string
  value: string
  note: string
}

/* ---- source shapes: localised, never sent to the client as-is ---- */

export interface SourceSpec {
  label: Localized
  value: Localized
}

export interface SourceCaseStudy {
  id: string
  name: Localized
  location: Localized
  method: Localized
  completed: number
  value: string
  summary: Localized
}

export interface SourceService {
  slug: DisciplineId
  code: string
  name: Localized
  tagline: Localized
  description: Localized
  capabilities: Localized<string[]>
  markets: MarketId[]
  specs: SourceSpec[]
  caseCount: number
  caseStudies: SourceCaseStudy[]
}

export interface SourceHighlight {
  id: string
  slug: DisciplineId
  market: MarketId
  location: Localized
  headline: Localized
  blurb: Localized
  linkLabel: Localized
  image?: string
  imageAlt?: Localized
  caption?: Localized
  sourceUrl?: string
}

export interface SourceStat {
  label: Localized
  value: string
  note: Localized
}

/* ---- contact ---- */

export interface ContactPayload {
  name: string
  email: string
  organisation?: string
  discipline: DisciplineId | 'general'
  message: string
  locale?: Locale
}

export interface ContactReceipt {
  reference: string
  office: string
  respondBy: string
}
