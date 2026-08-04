import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import HeroCarousel from './HeroCarousel.vue'
import { highlightsFixture, mountWith } from '@/test/helpers'
import { setNarrowViewport } from '@/test/setup'

const ROTATION = 7000
type Wrapper = ReturnType<typeof mountCarousel>

function mountCarousel(
  options: { attachTo?: Element } | 'en' | 'zh-TW' = {},
  locale: 'en' | 'zh-TW' = 'en',
) {
  const resolved = typeof options === 'string' ? { locale: options, mount: {} } : { locale, mount: options }
  return mountWith(
    HeroCarousel,
    { props: { highlights: highlightsFixture }, ...resolved.mount },
    resolved.locale,
  )
}

async function advance(ms: number) {
  vi.advanceTimersByTime(ms)
  await nextTick()
}

function track(wrapper: Wrapper) {
  return wrapper.find('.hero__track').attributes('style') ?? ''
}

/** The slide currently parked in the viewport, whichever slot it sits in. */
function activeSlide(wrapper: Wrapper) {
  return wrapper.findAll('.slide').find((slide) => slide.attributes('aria-hidden') === 'false')
}

function activeIndex(wrapper: Wrapper) {
  return wrapper.findAll('.dot').findIndex((dot) => dot.attributes('aria-selected') === 'true')
}

interface Point {
  x: number
  y?: number
}

async function drag(
  wrapper: Wrapper,
  points: Point[],
  options: { pointerType?: string; release?: boolean } = {},
) {
  const { pointerType = 'mouse', release = true } = options
  const viewport = wrapper.find('.hero__viewport').element

  const fire = (type: string, point: Point) =>
    viewport.dispatchEvent(
      new PointerEvent(type, {
        clientX: point.x,
        clientY: point.y ?? 200,
        pointerType,
        pointerId: 1,
        button: 0,
        bubbles: true,
      }),
    )

  const [first, ...rest] = points
  fire('pointerdown', first!)
  for (const point of rest) fire('pointermove', point)
  if (release) fire('pointerup', rest.at(-1) ?? first!)

  await nextTick()
}

async function settle(wrapper: Wrapper, propertyName = 'transform') {
  const event = new Event('transitionend') as Event & { propertyName?: string }
  event.propertyName = propertyName
  wrapper.find('.hero__track').element.dispatchEvent(event)
  await nextTick()
  await nextTick()
}

describe('HeroCarousel', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    setNarrowViewport(false)
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      cb(0)
      return 0
    })
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  describe('the track', () => {
    it('lays every slide side by side with a clone at each end', () => {
      const wrapper = mountCarousel()
      const slides = wrapper.findAll('.slide')

      expect(slides).toHaveLength(highlightsFixture.length + 2)
      expect(slides[0]!.text()).toContain(highlightsFixture.at(-1)!.headline)
      expect(slides.at(-1)!.text()).toContain(highlightsFixture[0]!.headline)
    })

    it('parks on the first real slide, not the clone', () => {
      const wrapper = mountCarousel()

      expect(track(wrapper)).toContain('translateX(calc(-100% + 0px))')
      expect(activeSlide(wrapper)!.text()).toContain(highlightsFixture[0]!.headline)
      expect(activeIndex(wrapper)).toBe(0)
    })

    it('shifts one full width per step', async () => {
      const wrapper = mountCarousel()

      await advance(ROTATION)
      expect(track(wrapper)).toContain('translateX(calc(-200% + 0px))')

      await advance(ROTATION)
      expect(track(wrapper)).toContain('translateX(calc(-300% + 0px))')
    })
  })

  describe('pointer capture', () => {
    it('does not claim the pointer on a plain press, so clicks reach the buttons', async () => {
      const capture = vi.spyOn(Element.prototype, 'setPointerCapture')
      const wrapper = mountCarousel()

      await drag(wrapper, [{ x: 400 }])

      expect(capture).not.toHaveBeenCalled()
    })

    it('claims it only once a horizontal drag is under way, and hands it back', async () => {
      const capture = vi.spyOn(Element.prototype, 'setPointerCapture')
      const release = vi.spyOn(Element.prototype, 'releasePointerCapture')
      const wrapper = mountCarousel()

      await drag(wrapper, [{ x: 400 }, { x: 300 }])

      expect(capture).toHaveBeenCalledTimes(1)
      expect(release).toHaveBeenCalledTimes(1)
    })

    it('never claims it for a vertical drag', async () => {
      const capture = vi.spyOn(Element.prototype, 'setPointerCapture')
      const wrapper = mountCarousel()

      await drag(wrapper, [
        { x: 400, y: 100 },
        { x: 390, y: 400 },
      ])

      expect(capture).not.toHaveBeenCalled()
    })

    it('opens the caption after a press that never moved', async () => {
      const wrapper = mountCarousel()
      const viewport = wrapper.find('.hero__viewport').element
      const fire = (type: string) =>
        viewport.dispatchEvent(
          new PointerEvent(type, {
            clientX: 400,
            clientY: 200,
            pointerType: 'mouse',
            pointerId: 1,
            button: 0,
            bubbles: true,
          }),
        )

      fire('pointerdown')
      fire('pointerup')
      await activeSlide(wrapper)!.find('.slide__link').trigger('click')

      expect(wrapper.find('.caption').exists()).toBe(true)
    })
  })

  describe('dragging', () => {
    it('moves the whole track with the cursor, revealing the next slide', async () => {
      const wrapper = mountCarousel()

      await drag(wrapper, [{ x: 400 }, { x: 280 }], { release: false })

      expect(track(wrapper)).toContain('translateX(calc(-100% + -120px))')
      expect(track(wrapper)).toContain('transition: none')
      expect(wrapper.find('.hero__viewport').classes()).toContain('is-dragging')
    })

    it('is not capped, so a long drag exposes the neighbour fully', async () => {
      const wrapper = mountCarousel()

      await drag(wrapper, [{ x: 900 }, { x: 200 }], { release: false })

      expect(track(wrapper)).toContain('-700px')
    })

    it('settles onto the next slide when released past the threshold', async () => {
      const wrapper = mountCarousel()

      await drag(wrapper, [{ x: 400 }, { x: 300 }])

      expect(track(wrapper)).toContain('translateX(calc(-200% + 0px))')
      expect(activeIndex(wrapper)).toBe(1)
      expect(track(wrapper)).not.toContain('transition: none')
    })

    it('goes back when dragged the other way', async () => {
      const wrapper = mountCarousel()

      await drag(wrapper, [{ x: 200 }, { x: 320 }])
      await settle(wrapper)

      expect(activeIndex(wrapper)).toBe(2)
    })

    it('springs back to where it was when the drag is too short', async () => {
      const wrapper = mountCarousel()

      await drag(wrapper, [{ x: 400 }, { x: 370 }])

      expect(track(wrapper)).toContain('translateX(calc(-100% + 0px))')
      expect(activeIndex(wrapper)).toBe(0)
    })

    it('leaves a mostly vertical drag to the page', async () => {
      const wrapper = mountCarousel()

      await drag(wrapper, [
        { x: 400, y: 100 },
        { x: 340, y: 420 },
      ])

      expect(track(wrapper)).toContain('translateX(calc(-100% + 0px))')
    })

    it('ignores movement inside the slop radius so a click stays a click', async () => {
      const wrapper = mountCarousel()

      await drag(wrapper, [{ x: 400 }, { x: 396 }])

      expect(activeIndex(wrapper)).toBe(0)
    })

    it('does not open the caption when the drag ends on the link', async () => {
      const wrapper = mountCarousel()

      await drag(wrapper, [{ x: 400 }, { x: 300 }])
      await activeSlide(wrapper)!.find('.slide__link').trigger('click')

      expect(wrapper.find('.caption').exists()).toBe(false)
    })
  })

  describe('looping', () => {
    it('runs past the end onto the clone, then rewinds invisibly', async () => {
      const wrapper = mountCarousel()

      await advance(ROTATION * 2)
      expect(activeIndex(wrapper)).toBe(2)

      await advance(ROTATION)
      expect(track(wrapper)).toContain('translateX(calc(-400% + 0px))')

      await settle(wrapper)
      expect(track(wrapper)).toContain('translateX(calc(-100% + 0px))')
      expect(activeIndex(wrapper)).toBe(0)
    })

    it('rewinds the same way going backwards off the front', async () => {
      const wrapper = mountCarousel()

      await drag(wrapper, [{ x: 200 }, { x: 340 }])
      expect(track(wrapper)).toContain('translateX(calc(0% + 0px))')

      await settle(wrapper)
      expect(track(wrapper)).toContain('translateX(calc(-300% + 0px))')
      expect(activeIndex(wrapper)).toBe(2)
    })

    it('ignores transitions that bubble up from inside a slide', async () => {
      const wrapper = mountCarousel()

      await advance(ROTATION * 3)
      expect(track(wrapper)).toContain('translateX(calc(-400% + 0px))')

      await settle(wrapper, 'border-color')
      expect(track(wrapper)).toContain('translateX(calc(-400% + 0px))')

      await settle(wrapper)
      expect(track(wrapper)).toContain('translateX(calc(-100% + 0px))')
    })

    it('never walks off the end of the strip, even if transitionend is missed', async () => {
      const wrapper = mountCarousel()
      const slots = wrapper.findAll('.slide').length

      for (let swipe = 0; swipe < 6; swipe += 1) {
        await drag(wrapper, [{ x: 400 }, { x: 280 }], { pointerType: 'touch' })
      }

      const offset = Number(/translateX\(calc\((-?\d+)%/.exec(track(wrapper))![1])
      expect(Math.abs(offset) / 100).toBeLessThanOrEqual(slots - 1)
      expect(activeSlide(wrapper)).toBeDefined()
      expect(wrapper.find('.slide__photo').exists()).toBe(true)
    })

    it('rewinds on a timer when the transition was cancelled by a new drag', async () => {
      const wrapper = mountCarousel()

      await advance(ROTATION * 3)
      expect(track(wrapper)).toContain('translateX(calc(-400% + 0px))')

      await advance(1000)

      expect(track(wrapper)).toContain('translateX(calc(-100% + 0px))')
      expect(activeIndex(wrapper)).toBe(0)
    })

    it('self-heals when a fresh gesture starts on a clone', async () => {
      const wrapper = mountCarousel()

      await advance(ROTATION * 3)
      expect(track(wrapper)).toContain('translateX(calc(-400% + 0px))')

      await drag(wrapper, [{ x: 400 }], { release: false })

      expect(track(wrapper)).toContain('translateX(calc(-100% + 0px))')
    })

    it('disables the transition only for the rewind frame', async () => {
      const wrapper = mountCarousel()

      await advance(ROTATION * 3)
      await settle(wrapper)

      expect(track(wrapper)).not.toContain('transition: none')
    })
  })

  describe('rotation and controls', () => {
    it('pauses while the pointer is over it and resumes on leave', async () => {
      const wrapper = mountCarousel()

      await wrapper.trigger('mouseenter')
      await advance(ROTATION * 2)
      expect(activeIndex(wrapper)).toBe(0)

      await wrapper.trigger('mouseleave')
      await advance(ROTATION)
      expect(activeIndex(wrapper)).toBe(1)
    })

    it('stops for good once the reader takes over', async () => {
      const wrapper = mountCarousel()

      await wrapper.findAll('.dot')[2]!.trigger('click')
      expect(activeIndex(wrapper)).toBe(2)

      await advance(ROTATION * 3)
      expect(activeIndex(wrapper)).toBe(2)
    })

    it('toggles the play control and its label', async () => {
      const wrapper = mountCarousel()

      expect(wrapper.find('.play').attributes('aria-label')).toBe('Pause rotation')

      await wrapper.find('.play').trigger('click')
      expect(wrapper.find('.play').attributes('aria-label')).toBe('Resume rotation')

      await advance(ROTATION * 2)
      expect(activeIndex(wrapper)).toBe(0)
    })

    it('steps with the arrow keys', async () => {
      const wrapper = mountCarousel()

      await wrapper.trigger('keydown', { key: 'ArrowRight' })
      expect(activeIndex(wrapper)).toBe(1)

      await wrapper.trigger('keydown', { key: 'ArrowLeft' })
      expect(activeIndex(wrapper)).toBe(0)
    })

    it('announces the current slide politely and hides the rest', () => {
      const wrapper = mountCarousel()

      expect(wrapper.find('[aria-live="polite"]').text()).toBe(highlightsFixture[0]!.linkLabel)
      expect(wrapper.findAll('.slide[aria-hidden="true"]')).toHaveLength(
        highlightsFixture.length + 1,
      )
    })
  })

  describe('media', () => {
    it('renders a responsive photo for every slide', () => {
      const wrapper = mountCarousel()
      const photos = wrapper.findAll('.slide__photo')

      expect(photos).toHaveLength(highlightsFixture.length + 2)
      expect(photos[1]!.attributes('src')).toBe('/hero/architecture-1600.jpg')
      expect(photos[1]!.attributes('srcset')).toContain('/hero/architecture-2400.jpg 2400w')
      expect(wrapper.findAll('source')[1]!.attributes('srcset')).toContain(
        '/hero/architecture-800.webp 800w',
      )
    })

    it('gives only the opening slide fetch priority', () => {
      const wrapper = mountCarousel()
      const photos = wrapper.findAll('.slide__photo')

      expect(photos[1]!.attributes('fetchpriority')).toBe('high')
      expect(photos[2]!.attributes('loading')).toBe('lazy')
    })

    it('describes each photo for screen readers', () => {
      expect(mountCarousel().findAll('.slide__photo')[1]!.attributes('alt')).toBe(
        'Glass and steel office towers seen from street level against a pale sky.',
      )
    })

    it('falls back to the drawn plate when a slide has no photo', () => {
      const wrapper = mountWith(HeroCarousel, {
        props: {
          highlights: highlightsFixture.map((h) => ({ ...h, image: undefined, imageAlt: undefined })),
        },
      })

      expect(wrapper.find('.slide__photo').exists()).toBe(false)
      expect(wrapper.find('svg.plate').exists()).toBe(true)
    })
  })

  describe('the image caption', () => {
    it('has no separate info control', () => {
      const wrapper = mountCarousel()

      expect(wrapper.find('.info').exists()).toBe(false)
    })

    it('stays closed until the project link is used', () => {
      const wrapper = mountCarousel()

      expect(wrapper.find('.caption').exists()).toBe(false)
      expect(activeSlide(wrapper)!.find('.slide__link').attributes('aria-expanded')).toBe('false')
    })

    it('opens from the project link with the alt text, the sourced copy and a link back', async () => {
      const wrapper = mountCarousel()

      await activeSlide(wrapper)!.find('.slide__link').trigger('click')

      const caption = wrapper.find('.caption')
      expect(caption.exists()).toBe(true)
      expect(caption.text()).toContain(highlightsFixture[0]!.imageAlt)
      expect(caption.text()).toContain(highlightsFixture[0]!.caption)
      expect(caption.find('.caption__source').attributes('href')).toBe(
        highlightsFixture[0]!.sourceUrl,
      )
      expect(caption.find('.caption__source').attributes('rel')).toBe('noopener noreferrer')
    })

    it('wires the link to the panel for assistive tech', async () => {
      const wrapper = mountCarousel()
      const link = () => activeSlide(wrapper)!.find('.slide__link')

      await link().trigger('click')

      expect(link().attributes('aria-expanded')).toBe('true')
      expect(link().attributes('aria-controls')).toBe('hero-caption')
      expect(wrapper.find('.caption').attributes('id')).toBe('hero-caption')
    })

    it('closes again on a second press of the link', async () => {
      const wrapper = mountCarousel()

      await activeSlide(wrapper)!.find('.slide__link').trigger('click')
      await activeSlide(wrapper)!.find('.slide__link').trigger('click')

      expect(wrapper.find('.caption').exists()).toBe(false)
    })

    it('offers a close control, since the panel covers the link', async () => {
      const wrapper = mountCarousel()

      await activeSlide(wrapper)!.find('.slide__link').trigger('click')
      const close = wrapper.find('.caption__close')

      expect(close.exists()).toBe(true)
      expect(close.attributes('aria-label')).toBe('Close image details')

      await close.trigger('click')
      expect(wrapper.find('.caption').exists()).toBe(false)
    })

    it('closes when anything outside the panel is clicked', async () => {
      const wrapper = mountCarousel({ attachTo: document.body })

      await activeSlide(wrapper)!.find('.slide__link').trigger('click')
      expect(wrapper.find('.caption').exists()).toBe(true)

      document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await nextTick()

      expect(wrapper.find('.caption').exists()).toBe(false)
      wrapper.unmount()
    })

    it('survives a click inside the panel', async () => {
      const wrapper = mountCarousel({ attachTo: document.body })

      await activeSlide(wrapper)!.find('.slide__link').trigger('click')
      await wrapper.find('.caption__alt').trigger('click')

      expect(wrapper.find('.caption').exists()).toBe(true)
      wrapper.unmount()
    })

    it('is not closed by the very click that opened it', async () => {
      const wrapper = mountCarousel({ attachTo: document.body })
      const link = activeSlide(wrapper)!.find('.slide__link').element

      link.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await nextTick()
      await nextTick()

      expect(wrapper.find('.caption').exists()).toBe(true)
      wrapper.unmount()
    })

    it('closes on the next click even when that click is the link again', async () => {
      const wrapper = mountCarousel({ attachTo: document.body })
      const link = () => activeSlide(wrapper)!.find('.slide__link').element

      link().dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await nextTick()
      expect(wrapper.find('.caption').exists()).toBe(true)

      link().dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await nextTick()
      expect(wrapper.find('.caption').exists()).toBe(false)
      wrapper.unmount()
    })

    it('stops listening once the panel is closed', async () => {
      const remove = vi.spyOn(document, 'removeEventListener')
      const wrapper = mountCarousel({ attachTo: document.body })

      await activeSlide(wrapper)!.find('.slide__link').trigger('click')
      await wrapper.find('.caption__close').trigger('click')

      expect(remove).toHaveBeenCalledWith('click', expect.any(Function))
      wrapper.unmount()
    })

    it('closes on Escape', async () => {
      const wrapper = mountCarousel()

      await activeSlide(wrapper)!.find('.slide__link').trigger('click')
      await wrapper.trigger('keydown', { key: 'Escape' })

      expect(wrapper.find('.caption').exists()).toBe(false)
    })

    it('leaves Escape alone when nothing is open', async () => {
      const wrapper = mountCarousel()

      await wrapper.trigger('keydown', { key: 'Escape' })

      expect(activeIndex(wrapper)).toBe(0)
    })

    it('halts the rotation while the caption is being read', async () => {
      const wrapper = mountCarousel()

      await activeSlide(wrapper)!.find('.slide__link').trigger('click')
      await advance(ROTATION * 3)

      expect(activeIndex(wrapper)).toBe(0)
      expect(wrapper.find('.caption').exists()).toBe(true)
    })

    it('closes itself when the slide changes', async () => {
      const wrapper = mountCarousel()

      await activeSlide(wrapper)!.find('.slide__link').trigger('click')
      await wrapper.trigger('keydown', { key: 'ArrowRight' })

      expect(wrapper.find('.caption').exists()).toBe(false)
    })

    it('lets go of focus that would be trapped inside a hidden slide', async () => {
      const wrapper = mountCarousel({ attachTo: document.body })
      const link = activeSlide(wrapper)!.find('.slide__link').element as HTMLButtonElement

      link.focus()
      expect(document.activeElement).toBe(link)

      await wrapper.trigger('keydown', { key: 'ArrowRight' })

      expect(document.activeElement).not.toBe(link)
      wrapper.unmount()
    })

    it('still offers a way through to the service detail', async () => {
      const wrapper = mountCarousel()

      await activeSlide(wrapper)!.find('.slide__link').trigger('click')
      await wrapper.find('.caption__open').trigger('click')

      expect(wrapper.emitted('open')).toEqual([['transportation']])
    })

    it('shows the caption in the active language', async () => {
      const wrapper = mountCarousel('zh-TW')

      await activeSlide(wrapper)!.find('.slide__link').trigger('click')

      expect(wrapper.find('.caption__open').text()).toContain('查看這項服務')
      expect(wrapper.find('.caption').text()).toContain(highlightsFixture[0]!.caption)
    })
  })

  describe('on a phone-sized viewport', () => {
    beforeEach(() => setNarrowViewport(true))

    it('advances on a leftward touch swipe', async () => {
      const wrapper = mountCarousel()

      await drag(wrapper, [{ x: 320 }, { x: 190 }], { pointerType: 'touch' })

      expect(activeIndex(wrapper)).toBe(1)
    })

    it('goes back on a rightward touch swipe', async () => {
      const wrapper = mountCarousel()

      await drag(wrapper, [{ x: 120 }, { x: 260 }], { pointerType: 'touch' })
      await settle(wrapper)

      expect(activeIndex(wrapper)).toBe(2)
    })

    it('follows the finger before release', async () => {
      const wrapper = mountCarousel()

      await drag(wrapper, [{ x: 300 }, { x: 220 }], { pointerType: 'touch', release: false })

      expect(track(wrapper)).toContain('-80px')
    })

    it('lets a vertical touch drag scroll the page', async () => {
      const wrapper = mountCarousel()

      await drag(
        wrapper,
        [
          { x: 200, y: 120 },
          { x: 160, y: 420 },
        ],
        { pointerType: 'touch' },
      )

      expect(activeIndex(wrapper)).toBe(0)
    })

    it('opens and closes the caption by touch too', async () => {
      const wrapper = mountCarousel()

      await activeSlide(wrapper)!.find('.slide__link').trigger('click')
      expect(wrapper.find('.caption').text()).toContain(highlightsFixture[0]!.caption)

      await activeSlide(wrapper)!.find('.slide__link').trigger('click')
      expect(wrapper.find('.caption').exists()).toBe(false)
    })

    it('keeps the dots, play control and link usable', async () => {
      const wrapper = mountCarousel()

      await wrapper.findAll('.dot')[1]!.trigger('click')
      expect(activeIndex(wrapper)).toBe(1)

      await wrapper.find('.play').trigger('click')
      expect(wrapper.find('.play').attributes('aria-label')).toBe('Pause rotation')

      await activeSlide(wrapper)!.find('.slide__link').trigger('click')
      await wrapper.find('.caption__open').trigger('click')
      expect(wrapper.emitted('open')).toEqual([['water']])
    })
  })

  it('renders nothing but the motto while the slides are still loading', () => {
    const wrapper = mountWith(HeroCarousel, { props: { highlights: [] } })

    expect(wrapper.find('.hero__viewport').exists()).toBe(false)
    expect(wrapper.text()).toContain('Explore our services')
  })
})
