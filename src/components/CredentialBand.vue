<script setup lang="ts">
import type { Stat } from '@/types'

defineProps<{ stats: Stat[] }>()
</script>

<template>
  <section class="band">
    <dl class="shell band__grid">
      <div v-for="stat in stats" :key="stat.label" class="band__cell">
        <dt class="band__value mono">{{ stat.value }}</dt>
        <dd class="band__label">{{ stat.label }}</dd>
        <dd class="band__note mono">{{ stat.note }}</dd>
      </div>
    </dl>
  </section>
</template>

<style scoped>
.band {
  border-block-end: 1px solid var(--rule);
  background: var(--paper);
}

.band__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
}

.band__cell {
  padding: 1.15rem 0;
  border-inline-start: 1px solid var(--rule);
  padding-inline-start: 1.15rem;
}

.band__cell:first-child {
  border-inline-start: 0;
  padding-inline-start: 0;
}

.band__value {
  font-size: 1.5rem;
  font-weight: 500;
  line-height: 1.15;
}

.band__label {
  margin: 0.2rem 0 0;
  font-size: var(--step-caption);
  color: var(--ink-muted);
}

.band__note {
  margin: 0.1rem 0 0;
  font-size: var(--step-eyebrow);
  color: var(--ink-faint);
}

@media (max-width: 40rem) {
  .band__grid {
    grid-template-columns: 1fr;
  }

  .band__cell {
    border-inline-start: 0;
    padding-inline-start: 0;
    padding-block: 0.85rem;
    border-block-start: 1px solid var(--rule);
  }

  .band__cell:first-child {
    border-block-start: 0;
  }
}
</style>
