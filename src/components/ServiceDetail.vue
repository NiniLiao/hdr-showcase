<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useServicesStore } from '@/stores/services'
import { useMediaQuery } from '@/composables/useMediaQuery'
import { useScrollLock } from '@/composables/useScrollLock'
import { themeVars } from '@/utils/discipline'

const { t } = useI18n()
const store = useServicesStore()
const { openSlug, openService, detailStatus } = storeToRefs(store)

const dialog = ref<HTMLDialogElement | null>(null)
const panel = ref<HTMLElement | null>(null)
const isSheet = useMediaQuery('(max-width: 47.99rem)')
const isOpen = computed(() => openSlug.value !== null)

useScrollLock(isOpen)

const dragY = ref(0)
const dragging = ref(false)
let startY = 0
let startTime = 0

const style = computed(() => (openService.value ? themeVars(openService.value.slug) : {}))

watch(isOpen, (open) => {
  const element = dialog.value
  if (!element) return

  if (open) {
    dragY.value = 0
    if (!element.open) element.showModal()
    return
  }
  if (element.open) element.close()
})

function dismiss() {
  store.close()
}

function onBackdrop(event: MouseEvent) {
  if (event.target === dialog.value) dismiss()
}

function onPointerDown(event: PointerEvent) {
  if (!isSheet.value) return
  dragging.value = true
  startY = event.clientY
  startTime = performance.now()
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}

function onPointerMove(event: PointerEvent) {
  if (!dragging.value) return
  dragY.value = Math.max(0, event.clientY - startY)
}

function onPointerUp() {
  if (!dragging.value) return
  dragging.value = false

  const height = panel.value?.offsetHeight ?? 400
  const velocity = dragY.value / Math.max(1, performance.now() - startTime)

  if (dragY.value > height * 0.28 || velocity > 0.6) {
    dismiss()
    return
  }
  dragY.value = 0
}
</script>

<template>
  <dialog
    ref="dialog"
    class="detail"
    :class="{ 'detail--sheet': isSheet }"
    :style="style"
    aria-labelledby="detail-title"
    @click="onBackdrop"
    @close="dismiss"
  >
    <article
      ref="panel"
      class="panel"
      :style="{
        transform: dragY ? `translateY(${dragY}px)` : '',
        transition: dragging ? 'none' : '',
      }"
    >
      <div
        v-if="isSheet"
        class="grabber"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
      >
        <span class="grabber__bar"></span>
      </div>

      <button class="close" type="button" @click="dismiss">
        <span class="visually-hidden">{{ t('detail.close') }}</span>
        <span aria-hidden="true">✕</span>
      </button>

      <div v-if="detailStatus === 'loading'" class="panel__loading mono">{{ t('detail.loading') }}</div>

      <template v-else-if="openService">
        <header class="panel__head">
          <span class="panel__code mono">{{ openService.code }}</span>
          <h2 id="detail-title" class="panel__title">{{ openService.name }}</h2>
          <p class="panel__tagline">{{ openService.tagline }}</p>
        </header>

        <div class="panel__scroll">
          <p class="panel__copy">{{ openService.description }}</p>

          <dl class="specs">
            <div v-for="spec in openService.specs" :key="spec.label" class="specs__cell">
              <dt class="specs__label">{{ spec.label }}</dt>
              <dd class="specs__value mono">{{ spec.value }}</dd>
            </div>
          </dl>

          <section class="block">
            <h3 class="block__title">{{ t('detail.capabilities') }}</h3>
            <ul class="capabilities">
              <li v-for="capability in openService.capabilities" :key="capability">
                {{ capability }}
              </li>
            </ul>
          </section>

          <section class="block">
            <h3 class="block__title">{{ t('detail.cases') }}</h3>
            <ul class="cases">
              <li v-for="study in openService.caseStudies" :key="study.id" class="case">
                <div class="case__head">
                  <p class="case__name">{{ study.name }}</p>
                  <p class="case__meta mono">{{ study.completed }} · {{ study.value }}</p>
                </div>
                <p class="case__method mono">{{ study.method }} · {{ study.location }}</p>
                <p class="case__summary">{{ study.summary }}</p>
              </li>
            </ul>
          </section>
        </div>

        <footer class="panel__foot">
          <button class="talk" type="button" @click="dismiss">{{ t('detail.talk') }}</button>
        </footer>
      </template>
    </article>
  </dialog>
</template>

<style scoped>
.detail {
  width: min(46rem, calc(100vw - 2rem));
  max-height: min(84vh, 46rem);
  padding: 0;
  border: 0;
  border-radius: var(--radius-lg);
  background: var(--paper);
  color: var(--ink);
  overflow: hidden;
}

.detail::backdrop {
  background: rgb(8 36 63 / 0.55);
  backdrop-filter: blur(2px);
}

.panel {
  display: flex;
  flex-direction: column;
  max-height: inherit;
  position: relative;
}

.panel__loading {
  padding: 3rem;
  text-align: center;
  color: var(--ink-faint);
}

.close {
  position: absolute;
  top: 0.85rem;
  inset-inline-end: 0.85rem;
  z-index: 2;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  color: var(--ink-muted);
  transition: background var(--dur-fast) var(--ease-out);
}

.close:hover {
  background: var(--paper-sunk);
}

.panel__head {
  padding: 1.5rem 1.5rem 1.15rem;
  border-bottom: 1px solid var(--rule);
}

.panel__code {
  display: inline-block;
  font-size: var(--step-eyebrow);
  font-weight: 500;
  letter-spacing: 0.12em;
  padding: 0.2rem 0.5rem;
  border-radius: 3px;
  color: var(--accent);
  background: var(--accent-tint);
}

.panel__title {
  margin-top: 0.7rem;
  padding-inline-end: 2.5rem;
  font-family: var(--font-display);
  font-size: var(--step-h2);
  font-weight: 500;
  line-height: 1.22;
  letter-spacing: -0.015em;
}

.panel__tagline {
  margin-top: 0.35rem;
  font-size: var(--step-caption);
  color: var(--ink-muted);
}

.panel__scroll {
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 1.35rem 1.5rem 1.75rem;
}

.panel__copy {
  color: var(--ink-muted);
  max-width: 62ch;
}

.specs {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: 1.25rem;
  border: 1px solid var(--rule);
  border-radius: var(--radius);
  overflow: hidden;
}

.specs__cell {
  padding: 0.75rem 0.9rem;
  background: var(--paper-sunk);
  border-inline-start: 1px solid var(--rule);
}

.specs__cell:first-child {
  border-inline-start: 0;
}

.specs__label {
  font-size: var(--step-eyebrow);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-faint);
}

.specs__value {
  margin: 0.15rem 0 0;
  font-size: var(--step-h3);
  font-weight: 500;
}

.block {
  margin-top: 1.75rem;
}

.block__title {
  font-size: var(--step-caption);
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-faint);
  padding-bottom: 0.6rem;
  border-bottom: 1px solid var(--rule);
}

.capabilities {
  display: grid;
  gap: 0.4rem;
  margin-top: 0.85rem;
  font-size: var(--step-caption);
}

.capabilities li {
  display: flex;
  gap: 0.6rem;
  color: var(--ink-muted);
}

.capabilities li::before {
  content: '';
  flex: none;
  width: 6px;
  height: 6px;
  margin-top: 0.5rem;
  border-radius: 1px;
  background: var(--accent);
}

.cases {
  display: grid;
  gap: 0.65rem;
  margin-top: 0.85rem;
}

.case {
  padding: 0.9rem 1rem;
  border: 1px solid var(--rule);
  border-radius: var(--radius);
  transition: border-color var(--dur-fast) var(--ease-out);
}

.case:hover {
  border-color: var(--rule-strong);
}

.case__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
}

.case__name {
  font-weight: 500;
}

.case__meta {
  flex: none;
  font-size: var(--step-eyebrow);
  color: var(--ink-faint);
}

.case__method {
  margin-top: 0.15rem;
  font-size: var(--step-eyebrow);
  letter-spacing: 0.04em;
  color: var(--accent);
}

.case__summary {
  margin-top: 0.5rem;
  font-size: var(--step-caption);
  color: var(--ink-muted);
}

.panel__foot {
  padding: 0.9rem 1.5rem calc(0.9rem + env(safe-area-inset-bottom));
  border-top: 1px solid var(--rule);
  background: var(--paper);
}

.talk {
  width: 100%;
  padding: 0.85rem;
  border-radius: var(--radius);
  background: var(--navy-800);
  color: #fff;
  font-weight: 500;
  transition: background var(--dur-fast) var(--ease-out);
}

.talk:hover {
  background: var(--navy-900);
}

.detail--sheet {
  inset: 0;
  width: 100vw;
  max-width: 100vw;
  max-height: 88vh;
  margin: 0;
  margin-block-start: auto;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}

.detail--sheet .panel {
  transition: transform var(--dur-base) var(--ease-out);
}

.detail--sheet .panel__head {
  padding-top: 0.25rem;
}

.detail--sheet .close {
  top: 2.1rem;
}

.grabber {
  padding: 0.7rem 0 0.5rem;
  display: flex;
  justify-content: center;
  touch-action: none;
  cursor: grab;
}

.grabber:active {
  cursor: grabbing;
}

.grabber__bar {
  width: 40px;
  height: 4px;
  border-radius: 999px;
  background: var(--rule-strong);
}

.detail[open] {
  animation: pop var(--dur-base) var(--ease-out);
}

.detail--sheet[open] {
  animation: rise var(--dur-base) var(--ease-out);
}

@keyframes pop {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.985);
  }
}

@keyframes rise {
  from {
    transform: translateY(100%);
  }
}
</style>
