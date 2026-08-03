import { findService, services, stats } from './data.js'
import { localizeService, localizeStat, pick } from './localize.js'
import { DEFAULT_LOCALE, isLocale } from './types.js'
import type { ContactPayload, ContactReceipt, DisciplineId, Locale, Localized, Service, Stat } from './types.js'

export interface HandlerResult<T> {
  status: number
  body: T
}

export type ServiceSummary = Omit<Service, 'caseStudies' | 'description' | 'capabilities'>

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const OFFICES: Record<DisciplineId | 'general', Localized> = {
  transportation: { en: 'Omaha, Nebraska', 'zh-TW': '內布拉斯加州奧馬哈' },
  water: { en: 'San Diego, California', 'zh-TW': '加州聖地牙哥' },
  buildings: { en: 'Minneapolis, Minnesota', 'zh-TW': '明尼蘇達州明尼亞波利斯' },
  energy: { en: 'Denver, Colorado', 'zh-TW': '科羅拉多州丹佛' },
  general: { en: 'Omaha, Nebraska', 'zh-TW': '內布拉斯加州奧馬哈' },
}

const ERRORS = {
  body: { en: 'Send a JSON body.', 'zh-TW': '請傳送 JSON 格式的內容。' },
  name: { en: 'Enter your name.', 'zh-TW': '請填寫姓名。' },
  email: { en: 'Enter a valid email address.', 'zh-TW': '請填寫正確的 email。' },
  message: {
    en: 'Tell us a little more — at least a sentence.',
    'zh-TW': '請多描述一些，至少一句話。',
  },
  notFound: { en: 'No service matches “%s”.', 'zh-TW': '找不到符合「%s」的服務。' },
} satisfies Record<string, Localized>

function summarise(service: Service): ServiceSummary {
  const { caseStudies: _c, description: _d, capabilities: _cap, ...rest } = service
  return rest
}

export function listServices(
  query?: string,
  locale: Locale = DEFAULT_LOCALE,
): HandlerResult<{ locale: Locale; services: ServiceSummary[] }> {
  const term = query?.trim().toLowerCase()

  const matched = services
    .map((service) => localizeService(service, locale))
    .filter((service) =>
      term
        ? [service.name, service.tagline, service.code, ...service.capabilities]
            .join(' ')
            .toLowerCase()
            .includes(term)
        : true,
    )

  return { status: 200, body: { locale, services: matched.map(summarise) } }
}

export function getService(
  slug: string,
  locale: Locale = DEFAULT_LOCALE,
): HandlerResult<Service | { error: string }> {
  const source = findService(slug)
  if (!source) {
    return { status: 404, body: { error: pick(ERRORS.notFound, locale).replace('%s', slug) } }
  }
  return { status: 200, body: localizeService(source, locale) }
}

export function getStats(locale: Locale = DEFAULT_LOCALE): HandlerResult<{ stats: Stat[] }> {
  return { status: 200, body: { stats: stats.map((stat) => localizeStat(stat, locale)) } }
}

export function submitContact(input: unknown): HandlerResult<ContactReceipt | { error: string }> {
  const payload = input as Partial<ContactPayload> | null
  const locale: Locale = isLocale(payload?.locale) ? payload.locale : DEFAULT_LOCALE
  const fail = (key: keyof typeof ERRORS) => ({ status: 400, body: { error: pick(ERRORS[key], locale) } })

  if (!payload || typeof payload !== 'object') return fail('body')
  if (!payload.name?.trim()) return fail('name')
  if (!payload.email || !EMAIL.test(payload.email)) return fail('email')
  const minLength = locale === 'zh-TW' ? 6 : 12
  if (!payload.message || payload.message.trim().length < minLength) return fail('message')

  const discipline = (payload.discipline ?? 'general') as DisciplineId | 'general'
  const office = pick(OFFICES[discipline] ?? OFFICES.general, locale)

  const respondBy = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const reference = `HDR-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`

  return { status: 201, body: { reference, office, respondBy } }
}
