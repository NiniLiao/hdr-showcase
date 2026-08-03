import type { Service } from '../../api/_lib/types'

export type {
  CaseStudy,
  ContactPayload,
  ContactReceipt,
  DisciplineId,
  Locale,
  Localized,
  Service,
  Spec,
  Stat,
} from '../../api/_lib/types'

export { DEFAULT_LOCALE, LOCALES, isLocale } from '../../api/_lib/types'

export type ServiceSummary = Omit<Service, 'caseStudies' | 'description' | 'capabilities'>
