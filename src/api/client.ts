import type {
  ContactPayload,
  ContactReceipt,
  Highlight,
  Locale,
  Service,
  ServiceSummary,
  Stat,
} from '@/types'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })

  const payload = (await response.json().catch(() => null)) as (T & { error?: string }) | null

  if (!response.ok) {
    throw new Error(payload?.error ?? `Request failed (${response.status}).`)
  }
  if (!payload) {
    throw new Error('The server returned an empty response.')
  }
  return payload
}

export const api = {
  services: (locale: Locale) =>
    request<{ locale: Locale; services: ServiceSummary[] }>(`/api/services?lang=${locale}`),
  service: (slug: string, locale: Locale) => request<Service>(`/api/services/${slug}?lang=${locale}`),
  stats: (locale: Locale) => request<{ stats: Stat[] }>(`/api/stats?lang=${locale}`),
  highlights: (locale: Locale) =>
    request<{ highlights: Highlight[] }>(`/api/highlights?lang=${locale}`),
  contact: (payload: ContactPayload) =>
    request<ContactReceipt>('/api/contact', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
}
