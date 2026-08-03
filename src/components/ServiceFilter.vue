<script setup lang="ts">
import { FILTERS, type FilterId } from '@/stores/services'

defineProps<{ active: FilterId; counts: Record<string, number> }>()
const emit = defineEmits<{ change: [FilterId] }>()
</script>

<template>
  <div class="filter" role="group" aria-label="Filter services by discipline">
    <ul class="filter__track">
      <li v-for="filter in FILTERS" :key="filter.id">
        <button
          class="chip"
          type="button"
          :class="{ 'is-active': active === filter.id }"
          :aria-pressed="active === filter.id"
          @click="emit('change', filter.id)"
        >
          {{ filter.label }}
          <span v-if="counts[filter.id]" class="chip__count mono">{{ counts[filter.id] }}</span>
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.filter {
  position: relative;
  margin-inline: calc(var(--gutter) * -1);
  padding-inline: var(--gutter);
  overflow-x: auto;
  scroll-snap-type: x proximity;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.filter::-webkit-scrollbar {
  display: none;
}

.filter__track {
  display: flex;
  gap: 0.5rem;
  width: max-content;
  padding-block: 0.25rem;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  scroll-snap-align: start;
  white-space: nowrap;
  padding: 0.45rem 0.95rem;
  border: 1px solid var(--rule);
  border-radius: 999px;
  font-size: var(--step-caption);
  color: var(--ink-muted);
  transition:
    background var(--dur-fast) var(--ease-out),
    border-color var(--dur-fast) var(--ease-out),
    color var(--dur-fast) var(--ease-out);
}

.chip:hover {
  border-color: var(--rule-strong);
  color: var(--ink);
}

.chip.is-active {
  background: var(--navy-800);
  border-color: var(--navy-800);
  color: #fff;
}

.chip__count {
  font-size: var(--step-eyebrow);
  opacity: 0.7;
}
</style>
