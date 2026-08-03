export type DisciplineId = 'transportation' | 'water' | 'buildings' | 'energy'

export interface CaseStudy {
  id: string
  name: string
  location: string
  method: string
  completed: number
  value: string
  summary: string
}

export interface Spec {
  label: string
  value: string
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

export interface ContactPayload {
  name: string
  email: string
  organisation?: string
  discipline: DisciplineId | 'general'
  message: string
}

export interface ContactReceipt {
  reference: string
  office: string
  respondBy: string
}
