<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useServicesStore } from '@/stores/services'
import { themeVars } from '@/utils/discipline'

const store = useServicesStore()
const { flagships } = storeToRefs(store)
</script>

<template>
  <section id="projects" class="projects">
    <div class="shell">
      <header class="projects__head">
        <p class="eyebrow">Selected projects</p>
        <h2 class="projects__title">One flagship from each discipline</h2>
      </header>

      <ol class="list">
        <li v-for="entry in flagships" :key="entry.study.id" class="row" :style="themeVars(entry.slug)">
          <span class="row__code mono">{{ entry.code }}</span>

          <div class="row__main">
            <p class="row__name">{{ entry.study.name }}</p>
            <p class="row__method mono">{{ entry.study.method }} · {{ entry.study.location }}</p>
          </div>

          <p class="row__meta mono">{{ entry.study.completed }}</p>
          <p class="row__value mono">{{ entry.study.value }}</p>

          <button class="row__open" type="button" @click="store.open(entry.slug)">
            <span class="visually-hidden">Open {{ entry.discipline }}</span>
            <span aria-hidden="true">→</span>
          </button>
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.projects {
  padding-block: clamp(3rem, 8vw, 5.5rem);
}

.projects__head {
  margin-bottom: 1.5rem;
}

.projects__title {
  margin-top: 0.6rem;
  font-family: var(--font-display);
  font-size: var(--step-h2);
  font-weight: 500;
  letter-spacing: -0.015em;
}

.list {
  border-block-start: 1px solid var(--rule);
}

.row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-areas:
    'code main open'
    'code meta open';
  align-items: center;
  gap: 0.15rem 1rem;
  padding-block: 1rem;
  border-block-end: 1px solid var(--rule);
}

.row__code {
  grid-area: code;
  align-self: start;
  margin-top: 0.2rem;
  font-size: var(--step-eyebrow);
  font-weight: 500;
  letter-spacing: 0.12em;
  padding: 0.2rem 0.45rem;
  border-radius: 3px;
  color: var(--accent);
  background: var(--accent-tint);
}

.row__main {
  grid-area: main;
}

.row__name {
  font-size: var(--step-h3);
  font-weight: 500;
  letter-spacing: -0.01em;
}

.row__method {
  font-size: var(--step-eyebrow);
  color: var(--ink-muted);
}

.row__meta,
.row__value {
  grid-area: meta;
  font-size: var(--step-eyebrow);
  color: var(--ink-faint);
}

.row__value {
  display: none;
}

.row__open {
  grid-area: open;
  width: 38px;
  height: 38px;
  border: 1px solid var(--rule);
  border-radius: 50%;
  color: var(--ink-muted);
  transition:
    border-color var(--dur-fast) var(--ease-out),
    color var(--dur-fast) var(--ease-out);
}

.row__open:hover {
  border-color: var(--accent);
  color: var(--accent);
}

@media (min-width: 48rem) {
  .row {
    grid-template-columns: 5rem minmax(0, 1fr) 6rem 7rem auto;
    grid-template-areas: 'code main meta value open';
    gap: 1.5rem;
    padding-block: 1.15rem;
  }

  .row__code {
    justify-self: start;
    margin-top: 0;
  }

  .row__meta {
    grid-area: meta;
    text-align: end;
  }

  .row__value {
    grid-area: value;
    display: block;
    text-align: end;
    color: var(--ink-muted);
  }
}
</style>
