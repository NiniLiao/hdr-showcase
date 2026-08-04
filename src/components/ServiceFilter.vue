<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { FILTER_IDS, type FilterId } from '@/stores/services'

defineProps<{ activeService: FilterId }>()

const emit = defineEmits<{ service: [FilterId] }>()

const { t } = useI18n()
</script>

<template>
  <div class="filters">
    <div class="row" role="group" :aria-label="t('directory.serviceAxis')">
      <ul class="row__track">
        <li v-for="id in FILTER_IDS" :key="id">
          <button
            class="chip"
            type="button"
            :class="{ 'is-active': activeService === id }"
            :aria-pressed="activeService === id"
            @click="emit('service', id)"
          >
            {{ t(`directory.filters.${id}`) }}
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.filters {
  display: grid;
  gap: 0.6rem;
}

.row {
  display: flex;
  align-items: center;
}

.row__track {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  scroll-snap-type: x proximity;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding-block: 0.25rem;
}

.row__track::-webkit-scrollbar {
  display: none;
}

.chip {
  scroll-snap-align: start;
  white-space: nowrap;
  padding: 0.4rem 0.9rem;
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
</style>
