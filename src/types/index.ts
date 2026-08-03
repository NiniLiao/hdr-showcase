import type { Service } from '../../api/_lib/types'

export type {
  CaseStudy,
  ContactPayload,
  ContactReceipt,
  DisciplineId,
  Service,
  Spec,
  Stat,
} from '../../api/_lib/types'

export type ServiceSummary = Omit<Service, 'caseStudies' | 'description' | 'capabilities'>
