<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { themeVars } from '@/utils/discipline'
import type { ServiceSummary } from '@/types'

const props = defineProps<{ service: ServiceSummary }>()
const emit = defineEmits<{ open: [string]; prefetch: [string] }>()

const { t } = useI18n()
const style = themeVars(props.service.slug)
</script>

<template>
  <button
    class="card"
    type="button"
    :style="style"
    :aria-label="t('directory.open', { name: service.name })"
    @click="emit('open', service.slug)"
    @mouseenter="emit('prefetch', service.slug)"
    @focus="emit('prefetch', service.slug)"
    @touchstart.passive="emit('prefetch', service.slug)"
  >
    <span class="card__code mono">{{ service.code }}</span>

    <span class="card__body">
      <span class="card__name">{{ service.name }}</span>
      <span class="card__tagline">{{ service.tagline }}</span>
    </span>

    <span class="card__markets">
      <span v-for="market in service.markets" :key="market" class="card__market">
        {{ t(`markets.${market}`) }}
      </span>
    </span>

    <span class="card__foot">
      <span class="card__cases mono">{{ t('directory.cases', { count: service.caseCount }) }}</span>
      <span class="card__arrow" aria-hidden="true">→</span>
    </span>
  </button>
</template>

<style scoped>
.card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  height: 100%;
  text-align: start;
  padding: 1.1rem 1.15rem;
  background: var(--paper);
  border: 1px solid var(--rule);
  border-radius: var(--radius-lg);
  transition:
    border-color var(--dur-base) var(--ease-out),
    transform var(--dur-base) var(--ease-out);
}

.card::before {
  content: '';
  position: absolute;
  inset-block: -1px;
  inset-inline-start: -1px;
  width: 3px;
  border-start-start-radius: var(--radius-lg);
  border-end-start-radius: var(--radius-lg);
  background: var(--accent);
  opacity: 0;
  transition: opacity var(--dur-base) var(--ease-out);
}

.card:hover {
  border-color: var(--rule-strong);
  transform: translateY(-2px);
}

.card:hover::before {
  opacity: 1;
}

.card__code {
  justify-self: start;
  font-size: var(--step-eyebrow);
  font-weight: 500;
  letter-spacing: 0.12em;
  padding: 0.2rem 0.5rem;
  border-radius: 3px;
  color: var(--accent);
  background: var(--accent-tint);
}

.card__body {
  display: grid;
  gap: 0.3rem;
}

.card__name {
  font-size: var(--step-h3);
  font-weight: 500;
  line-height: 1.3;
  letter-spacing: -0.01em;
}

.card__tagline {
  font-size: var(--step-caption);
  color: var(--ink-muted);
  line-height: 1.55;
}

.card__markets {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.card__market {
  font-size: var(--step-eyebrow);
  padding: 0.15rem 0.45rem;
  border-radius: 3px;
  background: var(--paper-sunk);
  color: var(--ink-muted);
}

.card__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 0.75rem;
  border-top: 1px solid var(--rule);
}

.card__cases {
  font-size: var(--step-eyebrow);
  color: var(--ink-faint);
}

.card__arrow {
  color: var(--accent);
  transition: transform var(--dur-base) var(--ease-out);
}

.card:hover .card__arrow {
  transform: translateX(3px);
}
</style>
