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
  min-width: 0;
}

/**
 * Without min-width the flex item is sized by its content, so five chips push
 * the whole page wider than the viewport and every section below looks shifted.
 */
/**
 * Scroll snapping used to pull the first chip past the container padding, which
 * clipped it against the screen edge. The row now simply scrolls inside the
 * page gutter, so the first chip lines up with the cards below it.
 */
.row__track {
  display: flex;
  gap: 0.5rem;
  min-width: 0;
  flex: 1;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding-block: 0.25rem;
}

.row__track::-webkit-scrollbar {
  display: none;
}

.chip {
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
