<script setup lang="ts">
import type { Stat } from '@/types'

defineProps<{ stats: Stat[] }>()

function scrollTo(selector: string) {
  document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <section id="top" class="hero">
    <div class="hero__drawing" aria-hidden="true">
      <svg viewBox="0 0 1200 420" preserveAspectRatio="xMidYMax slice">
        <g fill="none" stroke="currentColor" stroke-width="1" vector-effect="non-scaling-stroke">
          <path class="draw" style="--d: 0ms" d="M0 340 H1200" />
          <path class="draw" style="--d: 80ms" d="M300 340 V96 M900 340 V96" />
          <path class="draw" style="--d: 160ms" d="M300 96 C480 150 720 150 900 96" />
          <path
            class="draw"
            style="--d: 240ms"
            d="M300 110 L180 340 M300 130 L230 340 M300 150 L280 340 M900 110 L1020 340 M900 130 L970 340 M900 150 L920 340"
          />
          <path
            class="draw"
            style="--d: 320ms"
            d="M300 172 L400 340 M300 196 L470 340 M300 220 L540 340 M900 172 L800 340 M900 196 L730 340 M900 220 L660 340"
          />
          <path class="draw" style="--d: 400ms" d="M0 356 H1200 M240 340 V420 M960 340 V420" />
          <path class="draw" style="--d: 460ms" d="M240 384 H430 M770 384 H960" opacity="0.5" />
        </g>
      </svg>
    </div>

    <div class="shell hero__inner">
      <p class="eyebrow hero__eyebrow">Employee-owned · 200+ locations</p>

      <h1 class="hero__title">
        Architecture, engineering,<br />
        environmental and<br />
        <em>construction services</em>
      </h1>

      <p class="hero__lead">
        We design the infrastructure a place runs on — crossings, water systems, hospitals and
        transmission — and stay with it from feasibility through the last inspection.
      </p>

      <div class="hero__actions">
        <button class="btn btn--solid" type="button" @click="scrollTo('#services')">
          Explore our services
          <span aria-hidden="true">→</span>
        </button>
        <button class="btn btn--ghost" type="button" @click="scrollTo('#projects')">
          View projects
        </button>
      </div>

      <dl class="titleblock">
        <div v-for="stat in stats" :key="stat.label" class="titleblock__cell">
          <dt class="titleblock__label">{{ stat.label }}</dt>
          <dd class="titleblock__value mono">{{ stat.value }}</dd>
          <dd class="titleblock__note mono">{{ stat.note }}</dd>
        </div>
      </dl>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  overflow: hidden;
  background: var(--navy-800);
  color: #fff;
  isolation: isolate;
}

.hero__drawing {
  position: absolute;
  inset: auto 0 0 0;
  z-index: -1;
  color: var(--navy-600);
  opacity: 0.7;
  pointer-events: none;
}

.hero__drawing svg {
  display: block;
  width: 100%;
  height: 46vh;
  max-height: 380px;
}

.draw {
  stroke-dasharray: 2600;
  stroke-dashoffset: 2600;
  animation: draw 1600ms var(--ease-out) forwards;
  animation-delay: var(--d);
}

@keyframes draw {
  to {
    stroke-dashoffset: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .draw {
    stroke-dashoffset: 0;
  }
}

.hero__inner {
  padding-block: clamp(2.5rem, 7vw, 5.5rem) clamp(2rem, 5vw, 3.5rem);
}

.hero__eyebrow {
  color: var(--navy-400);
  margin-bottom: 1.25rem;
}

.hero__title {
  font-family: var(--font-display);
  font-size: var(--step-h1);
  font-weight: 500;
  line-height: 1.08;
  letter-spacing: -0.02em;
  max-width: 20ch;
}

.hero__title em {
  font-style: normal;
  color: var(--navy-400);
}

.hero__lead {
  margin-top: 1.25rem;
  max-width: 46ch;
  font-size: var(--step-lead);
  color: #cfe0f2;
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 2rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.4rem;
  border-radius: var(--radius);
  font-size: var(--step-body);
  font-weight: 500;
  transition:
    transform var(--dur-fast) var(--ease-out),
    background var(--dur-fast) var(--ease-out);
}

.btn:active {
  transform: scale(0.985);
}

.btn--solid {
  background: #fff;
  color: var(--navy-900);
}

.btn--solid:hover {
  background: var(--navy-100);
}

.btn--ghost {
  border: 1px solid var(--navy-600);
  color: #dbe8f6;
}

.btn--ghost:hover {
  background: color-mix(in srgb, var(--navy-600) 30%, transparent);
}

.titleblock {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: clamp(2.5rem, 6vw, 4rem);
  border: 1px solid var(--navy-600);
  background: color-mix(in srgb, var(--navy-900) 55%, transparent);
}

.titleblock__cell {
  padding: 0.9rem 1rem;
  border-inline-start: 1px solid var(--navy-600);
  border-block-start: 1px solid var(--navy-600);
}

.titleblock__cell:nth-child(-n + 2) {
  border-block-start: 0;
}

.titleblock__cell:nth-child(odd) {
  border-inline-start: 0;
}

.titleblock__label {
  font-size: var(--step-eyebrow);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--navy-400);
}

.titleblock__value {
  margin: 0.2rem 0 0;
  font-size: 1.5rem;
  font-weight: 500;
  line-height: 1.2;
}

.titleblock__note {
  margin: 0;
  font-size: var(--step-eyebrow);
  color: #9db8d4;
}

@media (min-width: 48rem) {
  .titleblock {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .titleblock__cell {
    border-block-start: 0;
    padding: 1.1rem 1.25rem;
  }

  .titleblock__cell:first-child {
    border-inline-start: 0;
  }

  .titleblock__cell:nth-child(odd) {
    border-inline-start: 1px solid var(--navy-600);
  }

  .titleblock__cell:first-child {
    border-inline-start: 0;
  }
}
</style>
