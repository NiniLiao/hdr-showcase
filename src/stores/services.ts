import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { api } from '@/api/client'
import type { DisciplineId, Service, ServiceSummary, Stat } from '@/types'

export type FilterId = DisciplineId | 'all'

export const FILTERS: ReadonlyArray<{ id: FilterId; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'transportation', label: 'Transportation' },
  { id: 'water', label: 'Water' },
  { id: 'buildings', label: 'Buildings' },
  { id: 'energy', label: 'Energy' },
]

export const useServicesStore = defineStore('services', () => {
  const summaries = ref<ServiceSummary[]>([])
  const stats = ref<Stat[]>([])
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
        const detail = detailCache.value[summary.slug]
        const study = detail?.caseStudies[0]
        return study ? { slug: summary.slug, code: summary.code, discipline: summary.name, study } : null
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null),
  )

  const openService = computed(() => (openSlug.value ? (detailCache.value[openSlug.value] ?? null) : null))

  async function load() {
    if (listStatus.value === 'loading') return
    listStatus.value = 'loading'
    error.value = null

    try {
      const [serviceResponse, statResponse] = await Promise.all([api.services(), api.stats()])
      summaries.value = serviceResponse.services
      stats.value = statResponse.stats
      listStatus.value = 'ready'
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Something went wrong.'
      listStatus.value = 'error'
    }
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
      detailCache.value[slug] = await api.service(slug)
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

  /** Used by the projects strip, which needs one case study per discipline. */
  async function loadAllDetails() {
    await Promise.all(
      summaries.value.map(async (summary) => {
        if (detailCache.value[summary.slug]) return
        try {
          detailCache.value[summary.slug] = await api.service(summary.slug)
        } catch {
          /* the strip simply renders fewer entries */
        }
      }),
    )
  }

  /** Warm the cache on hover or touchstart so the drawer opens without a spinner. */
  function prefetch(slug: string) {
    if (detailCache.value[slug]) return
    api
      .service(slug)
      .then((service) => (detailCache.value[slug] = service))
      .catch(() => undefined)
  }

  return {
    summaries,
    stats,
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
    setFilter,
    open,
    close,
    prefetch,
  }
})
