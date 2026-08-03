import { findService, services, stats } from './data'
import type { ContactPayload, ContactReceipt, DisciplineId, Service, Stat } from './types'

export interface HandlerResult<T> {
  status: number
  body: T
}

type ServiceSummary = Omit<Service, 'caseStudies' | 'description' | 'capabilities'>

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const OFFICES: Record<DisciplineId | 'general', string> = {
  transportation: 'Omaha, Nebraska',
  water: 'San Diego, California',
  buildings: 'Minneapolis, Minnesota',
  energy: 'Denver, Colorado',
  general: 'Omaha, Nebraska',
}

function summarise(service: Service): ServiceSummary {
  const { caseStudies: _cases, description: _description, capabilities: _capabilities, ...rest } = service
  return rest
}

export function listServices(query?: string): HandlerResult<{ services: ServiceSummary[] }> {
  const term = query?.trim().toLowerCase()
  const matched = term
    ? services.filter((service) =>
        [service.name, service.tagline, service.code, ...service.capabilities]
          .join(' ')
          .toLowerCase()
          .includes(term),
      )
    : services

  return { status: 200, body: { services: matched.map(summarise) } }
}

export function getService(slug: string): HandlerResult<Service | { error: string }> {
  const service = findService(slug)
  if (!service) {
    return { status: 404, body: { error: `No service matches “${slug}”.` } }
  }
  return { status: 200, body: service }
}

export function getStats(): HandlerResult<{ stats: Stat[] }> {
  return { status: 200, body: { stats } }
}

export function submitContact(input: unknown): HandlerResult<ContactReceipt | { error: string }> {
  const payload = input as Partial<ContactPayload> | null

  if (!payload || typeof payload !== 'object') {
    return { status: 400, body: { error: 'Send a JSON body.' } }
  }
  if (!payload.name?.trim()) {
    return { status: 400, body: { error: 'Enter your name.' } }
  }
  if (!payload.email || !EMAIL.test(payload.email)) {
    return { status: 400, body: { error: 'Enter a valid email address.' } }
  }
  if (!payload.message || payload.message.trim().length < 12) {
    return { status: 400, body: { error: 'Tell us a little more — at least a sentence.' } }
  }

  const discipline = (payload.discipline ?? 'general') as DisciplineId | 'general'
  const office = OFFICES[discipline] ?? OFFICES.general

  const respondBy = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const reference = `HDR-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`

  return { status: 201, body: { reference, office, respondBy } }
}
