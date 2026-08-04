import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ServiceDirectory from './ServiceDirectory.vue'
import { useServicesStore } from '@/stores/services'
import { mountWith, stubFetch } from '@/test/helpers'
import { setNarrowViewport } from '@/test/setup'
import type { Locale } from '@/types'

async function mountLoaded(locale: Locale = 'en') {
  stubFetch()
  const store = useServicesStore()
  const wrapper = mountWith(ServiceDirectory, {}, locale)
  await store.load(locale)
  await flushPromises()

  return { wrapper, store }
}

function chips(wrapper: Awaited<ReturnType<typeof mountLoaded>>['wrapper']) {
  return wrapper.findAll('.chip')
}

describe('ServiceDirectory', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    setNarrowViewport(false)
    vi.unstubAllGlobals()
  })

  it('shows a skeleton before the services arrive', () => {
    stubFetch()
    const wrapper = mountWith(ServiceDirectory)

    expect(wrapper.findAll('.skeleton')).toHaveLength(4)
    expect(wrapper.findAll('.card')).toHaveLength(0)
  })

  it('renders a card per service once loaded', async () => {
    const { wrapper } = await mountLoaded()

    expect(wrapper.findAll('.card')).toHaveLength(2)
  })

  it('shows no result counter above the grid', async () => {
    const { wrapper } = await mountLoaded()

    expect(wrapper.find('.directory__count').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('services')
  })

  it('lets every card stretch to the tallest in the row', async () => {
    const { wrapper } = await mountLoaded()

    expect(wrapper.findAll('.grid > li')).toHaveLength(2)
    for (const card of wrapper.findAll('.card')) {
      expect(card.classes()).toContain('card')
    }
  })

  it('offers only the discipline axis', async () => {
    const { wrapper } = await mountLoaded()

    expect(wrapper.findAll('[role="group"]')).toHaveLength(1)
    expect(chips(wrapper)).toHaveLength(5)
    expect(chips(wrapper).map((chip) => chip.text())).toEqual([
      'All',
      'Transportation',
      'Water',
      'Buildings',
      'Energy',
    ])
  })

  it('has no market chips left anywhere in the filter row', async () => {
    const { wrapper } = await mountLoaded()
    const labels = chips(wrapper).map((chip) => chip.text())

    for (const market of ['Health', 'Civic', 'Science', 'Industrial', 'Urban']) {
      expect(labels).not.toContain(market)
    }
  })

  it('still shows the market tags on the cards themselves', async () => {
    const { wrapper } = await mountLoaded()
    const tags = wrapper.findAll('.card__market').map((tag) => tag.text())

    expect(tags).toContain('Urban')
    expect(tags).toContain('Health')
  })

  it('narrows the grid when a discipline is chosen', async () => {
    const { wrapper } = await mountLoaded()

    await chips(wrapper)[2]!.trigger('click')

    expect(wrapper.findAll('.card')).toHaveLength(1)
    expect(wrapper.text()).toContain('Water and environmental resources')
  })

  it('shows the empty state when nothing matches', async () => {
    const { wrapper } = await mountLoaded()

    await chips(wrapper)[4]!.trigger('click')

    expect(wrapper.findAll('.card')).toHaveLength(0)
    expect(wrapper.find('.empty').text()).toBe('No service covers that combination yet.')
  })

  it('goes back to everything when all is chosen again', async () => {
    const { wrapper } = await mountLoaded()

    await chips(wrapper)[1]!.trigger('click')
    await chips(wrapper)[0]!.trigger('click')

    expect(wrapper.findAll('.card')).toHaveLength(2)
  })

  it('surfaces a retry when the request fails', async () => {
    stubFetch({ failList: true })
    const store = useServicesStore()
    const wrapper = mountWith(ServiceDirectory)
    await store.load('en')
    await flushPromises()

    expect(wrapper.find('[role="alert"]').text()).toContain('Upstream is down.')
  })

  it('opens a service when its card is clicked', async () => {
    const { wrapper, store } = await mountLoaded()

    await wrapper.findAll('.card')[0]!.trigger('click')
    await flushPromises()

    expect(store.openSlug).toBe('transportation')
  })

  it('translates the heading and the chips', async () => {
    const { wrapper } = await mountLoaded('zh-TW')

    expect(wrapper.text()).toContain('服務目錄')
    expect(chips(wrapper)[1]!.text()).toBe('交通')
  })

  describe('on a phone-sized viewport', () => {
    beforeEach(() => setNarrowViewport(true))

    it('renders the same single-axis filter', async () => {
      const { wrapper } = await mountLoaded()

      expect(wrapper.findAll('[role="group"]')).toHaveLength(1)
      expect(chips(wrapper)).toHaveLength(5)
    })

    it('filters and clears exactly as it does on desktop', async () => {
      const { wrapper } = await mountLoaded()

      await chips(wrapper)[1]!.trigger('click')
      expect(wrapper.findAll('.card')).toHaveLength(1)

      await chips(wrapper)[0]!.trigger('click')
      expect(wrapper.findAll('.card')).toHaveLength(2)
    })

    it('keeps the cards openable by touch', async () => {
      const { wrapper, store } = await mountLoaded()

      await wrapper.findAll('.card')[1]!.trigger('click')
      await flushPromises()

      expect(store.openSlug).toBe('water')
    })
  })
})
