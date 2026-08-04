import type { Service } from '../../api/_lib/types'

export type {
  CaseStudy,
  ContactPayload,
  ContactReceipt,
  DisciplineId,
  Highlight,
  Locale,
  Localized,
  MarketId,
  Service,
  Spec,
  Stat,
} from '../../api/_lib/types'

export { DEFAULT_LOCALE, LOCALES, MARKET_IDS, isLocale } from '../../api/_lib/types'

export type ServiceSummary = Omit<Service, 'caseStudies' | 'description' | 'capabilities'>
