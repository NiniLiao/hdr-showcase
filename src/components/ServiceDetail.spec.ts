import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { flushPromises, type VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ServiceDetail from './ServiceDetail.vue'
import { useServicesStore } from '@/stores/services'
import { mountWith, serviceFixture, stubFetch } from '@/test/helpers'
import { setNarrowViewport } from '@/test/setup'
import type { Locale } from '@/types'

const PANEL_HEIGHT = 500

/** jsdom never lays anything out, so the sheet needs a height to drag against. */
function giveThePanelHeight(wrapper: VueWrapper) {
  Object.defineProperty(wrapper.find('.panel').element, 'offsetHeight', {
    configurable: true,
    value: PANEL_HEIGHT,
  })
}

async function openDetail(locale: Locale = 'en') {
  stubFetch()
  const store = useServicesStore()
  await store.load(locale)

  const wrapper = mountWith(ServiceDetail, {}, locale)
  await store.open('transportation')
  await flushPromises()

  return { wrapper, store }
}

/**
 * test-utils synthesises a MouseEvent for pointer types, whose clientY is
 * read-only, so the gesture is dispatched as real PointerEvents instead.
 */
async function drag(wrapper: VueWrapper, distance: number, elapsed: number) {
  let started = false
  vi.spyOn(performance, 'now').mockImplementation(() => {
    if (started) return elapsed
    started = true
    return 0
  })

  const grabber = wrapper.find('.grabber').element
  const emit = (type: string, clientY?: number) =>
    grabber.dispatchEvent(new PointerEvent(type, { clientY, pointerId: 1, bubbles: true }))

  emit('pointerdown', 100)
  emit('pointermove', 100 + distance)
  await nextTick()

  return async function release(type: 'pointerup' | 'pointercancel' = 'pointerup') {
    emit(type)
    await nextTick()
  }
}

describe('ServiceDetail', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    setNarrowViewport(false)
    vi.unstubAllGlobals()
  })

  describe('as a desktop modal', () => {
    it('stays closed until a service is opened', () => {
      const wrapper = mountWith(ServiceDetail)

      expect(wrapper.find('dialog').attributes('open')).toBeUndefined()
    })

    it('opens as a modal and renders the record', async () => {
      const { wrapper } = await openDetail()
      const dialog = wrapper.find('dialog')

      expect(dialog.attributes('open')).toBeDefined()
      expect(dialog.classes()).not.toContain('detail--sheet')
      expect(wrapper.text()).toContain(serviceFixture.name)
      expect(wrapper.text()).toContain(serviceFixture.specs[0]!.value)
      expect(wrapper.text()).toContain(serviceFixture.caseStudies[0]!.name)
      expect(wrapper.text()).toContain(serviceFixture.capabilities[0]!)
    })

    it('has no drag handle — dragging is a touch affordance only', async () => {
      const { wrapper } = await openDetail()

      expect(wrapper.find('.grabber').exists()).toBe(false)
    })

    it('closes on the close button', async () => {
      const { wrapper, store } = await openDetail()

      await wrapper.find('.close').trigger('click')

      expect(store.openSlug).toBeNull()
      expect(wrapper.find('dialog').attributes('open')).toBeUndefined()
    })

    it('closes when the backdrop is clicked but not the panel', async () => {
      const { wrapper, store } = await openDetail()

      await wrapper.find('.panel').trigger('click')
      expect(store.openSlug).toBe('transportation')

      await wrapper.find('dialog').trigger('click')
      expect(store.openSlug).toBeNull()
    })

    it('keeps the store in step when the browser closes the dialog itself', async () => {
      const { wrapper, store } = await openDetail()

      wrapper.find('dialog').element.dispatchEvent(new Event('close'))
      await flushPromises()

      expect(store.openSlug).toBeNull()
    })

    it('labels the accent so each discipline keeps its colour', async () => {
      const { wrapper } = await openDetail()

      expect(wrapper.find('dialog').attributes('style')).toContain('--accent')
    })
  })

  describe('as a mobile bottom sheet', () => {
    beforeEach(() => setNarrowViewport(true))

    it('renders as a sheet with a drag handle', async () => {
      const { wrapper } = await openDetail()

      expect(wrapper.find('dialog').classes()).toContain('detail--sheet')
      expect(wrapper.find('.grabber').exists()).toBe(true)
    })

    it('follows the finger while dragging', async () => {
      const { wrapper } = await openDetail()
      giveThePanelHeight(wrapper)

      await drag(wrapper, 60, 800)

      const style = wrapper.find('.panel').attributes('style') ?? ''
      expect(style).toContain('translateY(60px)')
      expect(style).toContain('transition: none')
    })

    it('never follows upwards', async () => {
      const { wrapper } = await openDetail()
      giveThePanelHeight(wrapper)

      await drag(wrapper, -80, 800)

      expect(wrapper.find('.panel').attributes('style') ?? '').not.toContain('translateY')
    })

    it('springs back when the drag is too short', async () => {
      const { wrapper, store } = await openDetail()
      giveThePanelHeight(wrapper)

      const release = await drag(wrapper, 60, 800)
      await release()

      expect(store.openSlug).toBe('transportation')
      expect(wrapper.find('.panel').attributes('style') ?? '').not.toContain('translateY')
    })

    it('dismisses past 28% of the panel height', async () => {
      const { wrapper, store } = await openDetail()
      giveThePanelHeight(wrapper)

      const release = await drag(wrapper, PANEL_HEIGHT * 0.3, 800)
      await release()

      expect(store.openSlug).toBeNull()
      expect(wrapper.find('dialog').attributes('open')).toBeUndefined()
    })

    it('dismisses on a short fast flick', async () => {
      const { wrapper, store } = await openDetail()
      giveThePanelHeight(wrapper)

      const release = await drag(wrapper, 60, 40)
      await release()

      expect(store.openSlug).toBeNull()
    })

    it('ignores a pointer cancel the same way it ignores a short drag', async () => {
      const { wrapper, store } = await openDetail()
      giveThePanelHeight(wrapper)

      const release = await drag(wrapper, 40, 800)
      await release('pointercancel')

      expect(store.openSlug).toBe('transportation')
    })

    it('resets the offset so the next open starts flush', async () => {
      const { wrapper, store } = await openDetail()
      giveThePanelHeight(wrapper)

      const release = await drag(wrapper, PANEL_HEIGHT * 0.3, 800)
      await release()

      await store.open('transportation')
      await flushPromises()

      expect(wrapper.find('.panel').attributes('style') ?? '').not.toContain('translateY')
    })

    it('translates its chrome', async () => {
      const { wrapper } = await openDetail('zh-TW')

      expect(wrapper.text()).toContain('服務能力')
      expect(wrapper.find('.talk').text()).toBe('聯絡這支團隊')
    })
  })
})
