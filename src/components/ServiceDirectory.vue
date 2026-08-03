<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import ServiceCard from './ServiceCard.vue'
import ServiceFilter from './ServiceFilter.vue'
import { useServicesStore, type FilterId } from '@/stores/services'

const { t } = useI18n()
const store = useServicesStore()
const { summaries, visible, activeFilter, listStatus, error } = storeToRefs(store)

const counts = computed<Record<string, number>>(() => {
  const map: Record<string, number> = { all: summaries.value.length }
  for (const service of summaries.value) map[service.slug] = 1
  return map
})

function onFilter(filter: FilterId) {
  store.setFilter(filter)
}
</script>

<template>
  <section id="services" class="directory">
    <div class="shell">
      <header class="directory__head">
        <p class="eyebrow">{{ t('directory.eyebrow') }}</p>
        <h2 class="directory__title">{{ t('directory.title') }}</h2>
        <p class="directory__lead">{{ t('directory.lead') }}</p>
      </header>

      <ServiceFilter :active="activeFilter" :counts="counts" @change="onFilter" />

      <p v-if="listStatus === 'error'" class="notice notice--error" role="alert">
        {{ error }}
        <button class="notice__retry" type="button" @click="store.load()">
          {{ t('directory.retry') }}
        </button>
      </p>

      <ul v-else-if="listStatus === 'loading' || listStatus === 'idle'" class="grid" aria-hidden="true">
        <li v-for="n in 4" :key="n" class="skeleton"></li>
      </ul>

      <TransitionGroup v-else name="cards" tag="ul" class="grid">
        <li v-for="service in visible" :key="service.slug">
          <ServiceCard :service="service" @open="store.open" @prefetch="store.prefetch" />
        </li>
      </TransitionGroup>
    </div>
  </section>
</template>

<style scoped>
.directory {
  padding-block: clamp(3rem, 8vw, 5.5rem);
  background: var(--paper-sunk);
  border-block-end: 1px solid var(--rule);
}

.directory__head {
  max-width: 46ch;
  margin-bottom: 1.75rem;
}

.directory__title {
  margin-top: 0.6rem;
  font-family: var(--font-display);
  font-size: var(--step-h2);
  font-weight: 500;
  letter-spacing: -0.015em;
  line-height: 1.2;
}

.directory__lead {
  margin-top: 0.6rem;
  color: var(--ink-muted);
  font-size: var(--step-caption);
}

.grid {
  display: grid;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.skeleton {
  height: 168px;
  border-radius: var(--radius-lg);
  background: linear-gradient(90deg, #e9edf1 25%, #f2f5f7 50%, #e9edf1 75%);
  background-size: 200% 100%;
  animation: shimmer 1400ms linear infinite;
}

@keyframes shimmer {
  to {
    background-position: -200% 0;
  }
}

.notice {
  margin-top: 1.5rem;
  padding: 1rem 1.1rem;
  border-radius: var(--radius);
  font-size: var(--step-caption);
}

.notice--error {
  background: var(--danger-tint);
  color: var(--danger);
}

.notice__retry {
  margin-inline-start: 0.75rem;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.cards-move,
.cards-enter-active,
.cards-leave-active {
  transition:
    opacity var(--dur-base) var(--ease-out),
    transform var(--dur-base) var(--ease-out);
}

.cards-enter-from,
.cards-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.cards-leave-active {
  position: absolute;
  width: calc(100% - var(--gutter) * 2);
}

@media (min-width: 40rem) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 64rem) {
  .grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1rem;
  }
}
</style>
