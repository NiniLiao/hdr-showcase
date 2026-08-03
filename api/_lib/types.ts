export type DisciplineId = 'transportation' | 'water' | 'buildings' | 'energy'

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
  specs: Spec[]
  caseCount: number
  caseStudies: CaseStudy[]
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
  specs: SourceSpec[]
  caseCount: number
  caseStudies: SourceCaseStudy[]
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
