import type { ContactPayload, ContactReceipt, Service, ServiceSummary, Stat } from '@/types'

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
  services: () => request<{ services: ServiceSummary[] }>('/api/services'),
  service: (slug: string) => request<Service>(`/api/services/${slug}`),
  stats: () => request<{ stats: Stat[] }>('/api/stats'),
  contact: (payload: ContactPayload) =>
    request<ContactReceipt>('/api/contact', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
}
