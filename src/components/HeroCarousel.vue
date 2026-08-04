<script setup lang="ts">
import { computed, nextTick, onScopeDispose, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import ProjectPlate from './ProjectPlate.vue'
import { useMediaQuery } from '@/composables/useMediaQuery'
import type { Highlight } from '@/types'

const props = defineProps<{ highlights: Highlight[] }>()
const emit = defineEmits<{ open: [string] }>()

const { t } = useI18n()
const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

const ROTATION = 7000
const AXIS_SLOP = 6
const MIN_THRESHOLD = 48

/**
 * The track carries a clone of the last slide before the first and a clone of
 * the first after the last, so a drag off either end reveals real content
 * instead of empty space. Landing on a clone snaps back to its twin with the
 * transition switched off, which the eye cannot see.
 */
const slides = computed(() => {
  const list = props.highlights
  if (list.length < 2) return list
  return [list[list.length - 1]!, ...list, list[0]!]
})

const hasClones = computed(() => props.highlights.length > 1)
const firstReal = computed(() => (hasClones.value ? 1 : 0))
const lastReal = computed(() => (hasClones.value ? props.highlights.length : 0))

const position = ref(firstReal.value)
const dragX = ref(0)
const dragging = ref(false)
const snapping = ref(false)
const paused = ref(false)
const interacted = ref(false)

const viewport = ref<HTMLElement | null>(null)
const trackEl = ref<HTMLElement | null>(null)

const realIndex = computed(() => {
  const total = props.highlights.length
  if (total === 0) return 0
  if (!hasClones.value) return 0
  return (((position.value - 1) % total) + total) % total
})

const current = computed(() => props.highlights[realIndex.value] ?? null)

const trackStyle = computed(() => ({
  transform: `translateX(calc(${-position.value * 100}% + ${dragX.value}px))`,
  transition: dragging.value || snapping.value ? 'none' : '',
}))

const running = computed(() => !paused.value && !reducedMotion.value && props.highlights.length > 1)

let timer: ReturnType<typeof setInterval> | null = null

function stop() {
  if (timer === null) return
  clearInterval(timer)
  timer = null
}

function start() {
  stop()
  if (!running.value) return
  timer = setInterval(() => step(1), ROTATION)
}

watch(running, start, { immediate: true })

/** Only a change of content rewinds the track; pausing must not move it. */
watch(
  () => props.highlights.length,
  () => {
    position.value = firstReal.value
    start()
  },
)

onScopeDispose(stop)

function step(delta: number) {
  if (props.highlights.length < 2) return
  position.value += delta
  start()
}

function goToReal(target: number) {
  position.value = target + firstReal.value
  start()
}

/**
 * Silently rewinds from a clone to the slide it duplicates. Child elements have
 * their own transitions that bubble up here, so only the track's own transform
 * counts.
 */
async function onTransitionEnd(event: TransitionEvent) {
  if (event.target !== trackEl.value) return
  if (event.propertyName && event.propertyName !== 'transform') return
  if (!hasClones.value) return

  const beyondEnd = position.value > lastReal.value
  const beforeStart = position.value < firstReal.value
  if (!beyondEnd && !beforeStart) return

  snapping.value = true
  position.value = beyondEnd ? firstReal.value : lastReal.value
  await nextTick()
  requestAnimationFrame(() => (snapping.value = false))
}

function pin() {
  interacted.value = true
  paused.value = true
}

const captionOpen = ref(false)
const captionEl = ref<HTMLElement | null>(null)

/**
 * The click that opens the panel keeps bubbling to document, and microtasks run
 * between listeners, so no amount of deferring reliably dodges it. The event is
 * remembered by identity instead and skipped once.
 */
let openingEvent: Event | null = null

function onDocumentClick(event: MouseEvent) {
  if (event === openingEvent) {
    openingEvent = null
    return
  }

  const target = event.target as Node | null
  if (target && captionEl.value?.contains(target)) return
  captionOpen.value = false
}

watch(captionOpen, (open) => {
  if (open) {
    document.addEventListener('click', onDocumentClick)
    return
  }
  document.removeEventListener('click', onDocumentClick)
  openingEvent = null
})

onScopeDispose(() => document.removeEventListener('click', onDocumentClick))

/** Reading the caption means the reader has stopped browsing, so pin the track. */
function toggleCaption() {
  captionOpen.value = !captionOpen.value
  if (captionOpen.value) pin()
}

watch(realIndex, () => {
  captionOpen.value = false

  /** A focused control inside a slide that just became inert must let go. */
  const focused = document.activeElement as HTMLElement | null
  if (focused && trackEl.value?.contains(focused)) focused.blur()
})

function togglePlay() {
  paused.value = !paused.value
  interacted.value = true
}

let startX = 0
let startY = 0
let axis: 'undecided' | 'x' | 'y' = 'undecided'
let dragged = false
let captured = false

function onPointerDown(event: PointerEvent) {
  if (event.button > 0 || props.highlights.length < 2) return
  startX = event.clientX
  startY = event.clientY
  axis = 'undecided'
  dragged = false
  dragging.value = true
}

function onPointerMove(event: PointerEvent) {
  if (!dragging.value) return

  const dx = event.clientX - startX
  const dy = event.clientY - startY

  if (axis === 'undecided') {
    if (Math.abs(dx) < AXIS_SLOP && Math.abs(dy) < AXIS_SLOP) return
    axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
  }
  if (axis !== 'x') return

  /**
   * Capture is claimed only once a real horizontal drag starts. Claiming it on
   * pointerdown would retarget the follow-up click to this element, which
   * swallows clicks on the buttons inside the slide.
   */
  if (!captured) {
    ;(event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId)
    captured = true
  }

  dragged = true
  dragX.value = dx
}

function onPointerUp(event: PointerEvent) {
  if (captured) {
    ;(event.currentTarget as HTMLElement).releasePointerCapture?.(event.pointerId)
    captured = false
  }
  if (!dragging.value) return
  dragging.value = false

  const travelled = dragX.value
  dragX.value = 0

  const width = viewport.value?.offsetWidth ?? 0
  const threshold = Math.max(MIN_THRESHOLD, width * 0.12)
  if (Math.abs(travelled) < threshold) return

  pin()
  step(travelled < 0 ? 1 : -1)
}

function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape' && captionOpen.value) {
    captionOpen.value = false
    return
  }
  if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
  pin()
  step(event.key === 'ArrowRight' ? 1 : -1)
}

/** A drag that ends on the link would otherwise fire a click on release. */
function onLinkClick(event: MouseEvent) {
  if (dragged) {
    dragged = false
    return
  }
  openingEvent = event
  toggleCaption()
}

function scrollTo(selector: string) {
  document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <section
    id="top"
    class="hero"
    role="region"
    aria-roledescription="carousel"
    :aria-label="t('hero.carousel')"
    tabindex="0"
    @mouseenter="paused = true"
    @mouseleave="paused = interacted"
    @focusin="paused = true"
    @keydown="onKey"
  >
    <div
      v-if="slides.length"
      ref="viewport"
      class="hero__viewport"
      :class="{ 'is-dragging': dragging }"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @dragstart.prevent
    >
      <div
        ref="trackEl"
        class="hero__track"
        :style="trackStyle"
        @transitionend="onTransitionEnd"
      >
        <article
          v-for="(slide, slot) in slides"
          :key="`${slide.id}-${slot}`"
          class="slide"
          role="group"
          aria-roledescription="slide"
          :aria-hidden="slot !== position"
          :inert="slot !== position"
        >
          <div class="slide__media">
            <picture v-if="slide.image">
              <source
                type="image/webp"
                :srcset="`/hero/${slide.image}-800.webp 800w, /hero/${slide.image}-1600.webp 1600w, /hero/${slide.image}-2400.webp 2400w`"
                sizes="100vw"
              />
              <img
                class="slide__photo"
                :src="`/hero/${slide.image}-1600.jpg`"
                :srcset="`/hero/${slide.image}-800.jpg 800w, /hero/${slide.image}-1600.jpg 1600w, /hero/${slide.image}-2400.jpg 2400w`"
                sizes="100vw"
                :alt="slide.imageAlt ?? ''"
                :fetchpriority="slot === firstReal ? 'high' : 'auto'"
                :loading="slot === firstReal ? 'eager' : 'lazy'"
                decoding="async"
                draggable="false"
              />
            </picture>

            <ProjectPlate v-else :slug="slide.slug" />
          </div>

          <div class="slide__scrim"></div>

          <div class="shell slide__body">
            <p class="eyebrow slide__eyebrow mono">
              {{ t(`markets.${slide.market}`) }} · {{ slide.location }}
            </p>
            <h1 class="slide__headline">{{ slide.headline }}</h1>
            <p class="slide__blurb">{{ slide.blurb }}</p>

            <button
              class="slide__link"
              type="button"
              aria-controls="hero-caption"
              :aria-expanded="captionOpen && slot === position"
              @click="onLinkClick($event)"
            >
              {{ slide.linkLabel }}
              <span aria-hidden="true">{{ captionOpen && slot === position ? '↓' : '→' }}</span>
            </button>
          </div>
        </article>
      </div>

      <Transition name="caption">
        <aside v-if="captionOpen && current" ref="captionEl" id="hero-caption" class="caption">
          <div class="shell">
            <button class="caption__close" type="button" :aria-label="t('hero.captionHide')" @click="captionOpen = false">
              <span aria-hidden="true">✕</span>
            </button>

            <p class="caption__alt">{{ current.imageAlt }}</p>
            <p v-if="current.caption" class="caption__text">{{ current.caption }}</p>
            <div class="caption__actions">
              <button class="caption__open" type="button" @click="emit('open', current.slug)">
                {{ t('hero.viewService') }}
                <span aria-hidden="true">→</span>
              </button>

              <a
                v-if="current.sourceUrl"
                class="caption__source mono"
                :href="current.sourceUrl"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ t('hero.source') }}: hdrinc.com ↗
              </a>
            </div>
          </div>
        </aside>
      </Transition>

      <div class="shell hero__controls">
        <div class="dots" role="tablist" :aria-label="t('hero.slides')">
          <button
            v-for="(highlight, spot) in highlights"
            :key="highlight.id"
            class="dot"
            type="button"
            role="tab"
            :class="{ 'is-active': spot === realIndex }"
            :aria-selected="spot === realIndex"
            :aria-label="highlight.linkLabel"
            @click="
              pin();
              goToReal(spot)
            "
          ></button>
        </div>

        <button
          class="play"
          type="button"
          :aria-label="paused ? t('hero.play') : t('hero.pause')"
          @click="togglePlay"
        >
          <span aria-hidden="true">{{ paused ? '▶' : '❚❚' }}</span>
        </button>
      </div>
    </div>

    <p class="visually-hidden" aria-live="polite">
      {{ current ? current.linkLabel : '' }}
    </p>

    <div class="shell hero__intro">
      <p class="hero__motto">
        {{ t('hero.titleA') }} {{ t('hero.titleB') }} <em>{{ t('hero.titleEm') }}</em>
      </p>
      <button class="btn" type="button" @click="scrollTo('#services')">
        {{ t('hero.explore') }}
        <span aria-hidden="true">→</span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  background: var(--navy-800);
  color: #fff;
}

.hero:focus-visible {
  outline-offset: -3px;
}

.hero__viewport {
  position: relative;
  overflow: hidden;
  touch-action: pan-y;
  cursor: grab;
}

.hero__viewport.is-dragging {
  cursor: grabbing;
  user-select: none;
}

.hero__track {
  display: flex;
  will-change: transform;
  transition: transform 520ms var(--ease-out);
}

.slide {
  position: relative;
  flex: 0 0 100%;
  min-width: 100%;
  min-height: clamp(20rem, 52vh, 30rem);
  display: flex;
  align-items: flex-end;
}

.slide__media {
  position: absolute;
  inset: 0;
}

.slide__photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  user-select: none;
  -webkit-user-drag: none;
}

.slide__scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgb(8 36 63 / 0.94) 12%, rgb(8 36 63 / 0.3) 78%);
}

.slide__body {
  position: relative;
  width: 100%;
  padding-block: 2rem 4.5rem;
}

.slide__eyebrow {
  color: var(--navy-400);
  margin-bottom: 0.75rem;
}

.slide__headline {
  font-family: var(--font-display);
  font-size: clamp(1.6rem, 1rem + 2.6vw, 2.75rem);
  font-weight: 500;
  line-height: 1.12;
  letter-spacing: -0.02em;
  max-width: 22ch;
}

.slide__blurb {
  margin-top: 0.85rem;
  max-width: 46ch;
  color: #cfe0f2;
  font-size: var(--step-body);
}

.slide__link {
  margin-top: 1.25rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding-bottom: 0.3rem;
  border-bottom: 1px solid var(--navy-600);
  color: #fff;
  font-size: var(--step-body);
  font-weight: 500;
  transition: border-color var(--dur-fast) var(--ease-out);
}

.slide__link:hover {
  border-color: #fff;
}

.hero__controls {
  position: absolute;
  inset-inline: 0;
  bottom: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
  pointer-events: none;
}

.dots,
.play {
  pointer-events: auto;
}

.caption {
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  padding-block: 1.25rem 3.25rem;
  background: rgb(4 26 46 / 0.94);
  backdrop-filter: blur(2px);
}

.caption .shell {
  position: relative;
  padding-inline-end: 3rem;
}

.caption__close {
  position: absolute;
  top: -0.25rem;
  inset-inline-end: var(--gutter);
  width: 32px;
  height: 32px;
  border: 1px solid var(--navy-600);
  border-radius: 50%;
  font-size: var(--step-caption);
  line-height: 1;
  color: var(--navy-400);
  transition:
    background var(--dur-fast) var(--ease-out),
    color var(--dur-fast) var(--ease-out);
}

.caption__close:hover {
  background: #e6f1fb;
  border-color: #e6f1fb;
  color: var(--navy-900);
}

.caption__alt {
  font-size: var(--step-caption);
  color: var(--navy-400);
}

.caption__text {
  margin-top: 0.5rem;
  max-width: 68ch;
  font-size: var(--step-caption);
  line-height: 1.7;
  color: #e6f1fb;
}

.caption__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.25rem;
  margin-top: 1rem;
}

.caption__open {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: var(--radius);
  background: #e6f1fb;
  color: var(--navy-900);
  font-size: var(--step-caption);
  font-weight: 500;
  transition: background var(--dur-fast) var(--ease-out);
}

.caption__open:hover {
  background: #fff;
}

.caption__source {
  display: inline-block;
  font-size: var(--step-eyebrow);
  color: var(--navy-400);
  text-decoration: none;
  border-bottom: 1px solid var(--navy-600);
  padding-bottom: 2px;
}

.caption__source:hover {
  color: #fff;
}

.caption-enter-active,
.caption-leave-active {
  transition:
    opacity var(--dur-base) var(--ease-out),
    transform var(--dur-base) var(--ease-out);
}

.caption-enter-from,
.caption-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

.dots {
  display: flex;
  gap: 0.5rem;
}

.dot {
  width: 26px;
  height: 3px;
  background: var(--navy-600);
  transition: background var(--dur-base) var(--ease-out);
}

.dot.is-active {
  background: #e6f1fb;
}

.play {
  font-size: 0.7rem;
  color: var(--navy-400);
  padding: 0.35rem;
}

.play:hover {
  color: #fff;
}

.hero__intro {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-block: 1.15rem;
  border-top: 1px solid var(--navy-600);
}

.hero__motto {
  font-size: var(--step-caption);
  letter-spacing: 0.02em;
  color: #b7cbe0;
  max-width: 56ch;
}

.hero__motto em {
  font-style: normal;
  color: #fff;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.2rem;
  border-radius: var(--radius);
  background: #fff;
  color: var(--navy-900);
  font-size: var(--step-caption);
  font-weight: 500;
  white-space: nowrap;
  transition: background var(--dur-fast) var(--ease-out);
}

.btn:hover {
  background: var(--navy-100);
}

@media (prefers-reduced-motion: reduce) {
  .hero__track {
    transition: none;
  }
}
</style>
