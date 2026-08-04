import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { api } from '@/api/client'
import { DEFAULT_LOCALE } from '@/types'
import type { DisciplineId, Highlight, Locale, Service, ServiceSummary, Stat } from '@/types'

export type FilterId = DisciplineId | 'all'

export const FILTER_IDS: readonly FilterId[] = [
  'all',
  'transportation',
  'water',
  'buildings',
  'energy',
]

export const DISCIPLINE_IDS = FILTER_IDS.filter((id): id is DisciplineId => id !== 'all')

export const useServicesStore = defineStore('services', () => {
  const locale = ref<Locale>(DEFAULT_LOCALE)
  const summaries = ref<ServiceSummary[]>([])
  const stats = ref<Stat[]>([])
  const highlights = ref<Highlight[]>([])
  const detailCache = ref<Record<string, Service>>({})

  const activeFilter = ref<FilterId>('all')
  const openSlug = ref<string | null>(null)

  const listStatus = ref<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const detailStatus = ref<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const error = ref<string | null>(null)

  const visible = computed(() =>
    activeFilter.value === 'all'
      ? summaries.value
      : summaries.value.filter((service) => service.slug === activeFilter.value),
  )

  const flagships = computed(() =>
    summaries.value
      .map((summary) => {
        const study = detailCache.value[summary.slug]?.caseStudies[0]
        return study ? { slug: summary.slug, code: summary.code, discipline: summary.name, study } : null
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null),
  )

  const openService = computed(() =>
    openSlug.value ? (detailCache.value[openSlug.value] ?? null) : null,
  )

  async function load(next: Locale = locale.value) {
    if (listStatus.value === 'loading') return
    locale.value = next
    listStatus.value = 'loading'
    error.value = null

    try {
      const [serviceResponse, statResponse, highlightResponse] = await Promise.all([
        api.services(next),
        api.stats(next),
        api.highlights(next),
      ])
      summaries.value = serviceResponse.services
      stats.value = statResponse.stats
      highlights.value = highlightResponse.highlights
      listStatus.value = 'ready'
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Something went wrong.'
      listStatus.value = 'error'
    }
  }

  /** Used by the projects strip, which needs one case study per discipline. */
  async function loadAllDetails() {
    await Promise.all(
      summaries.value.map(async (summary) => {
        if (detailCache.value[summary.slug]) return
        try {
          detailCache.value[summary.slug] = await api.service(summary.slug, locale.value)
        } catch {
          /* the strip simply renders fewer entries */
        }
      }),
    )
  }

  /** Locale-scoped content lives in the cache, so switching language empties it. */
  async function switchLocale(next: Locale) {
    if (next === locale.value && listStatus.value === 'ready') return
    detailCache.value = {}
    await load(next)
    await loadAllDetails()
  }

  function setFilter(filter: FilterId) {
    activeFilter.value = filter
  }

  async function open(slug: string) {
    openSlug.value = slug

    if (detailCache.value[slug]) {
      detailStatus.value = 'ready'
      return
    }

    detailStatus.value = 'loading'
    try {
      detailCache.value[slug] = await api.service(slug, locale.value)
      detailStatus.value = 'ready'
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Something went wrong.'
      detailStatus.value = 'error'
    }
  }

  function close() {
    openSlug.value = null
    detailStatus.value = 'idle'
  }

  /** Warm the cache on hover or touchstart so the drawer opens without a spinner. */
  function prefetch(slug: string) {
    if (detailCache.value[slug]) return
    api
      .service(slug, locale.value)
      .then((service) => (detailCache.value[slug] = service))
      .catch(() => undefined)
  }

  return {
    locale,
    summaries,
    stats,
    highlights,
    activeFilter,
    openSlug,
    listStatus,
    detailStatus,
    error,
    visible,
    flagships,
    openService,
    load,
    loadAllDetails,
    switchLocale,
    setFilter,
    open,
    close,
    prefetch,
  }
})
