<script setup lang="ts">
import type { DisciplineId } from '@/types'

defineProps<{ slug: DisciplineId }>()
</script>

<template>
  <svg class="plate" viewBox="0 0 1200 460" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <g fill="none" stroke="currentColor" stroke-width="1" vector-effect="non-scaling-stroke">
      <template v-if="slug === 'transportation'">
        <path d="M0 360 H1200" />
        <path d="M300 360 V104 M900 360 V104" />
        <path d="M300 104 C480 160 720 160 900 104" />
        <path
          d="M300 118 L180 360 M300 138 L230 360 M300 158 L280 360 M900 118 L1020 360 M900 138 L970 360 M900 158 L920 360"
        />
        <path
          d="M300 180 L400 360 M300 204 L470 360 M300 228 L540 360 M900 180 L800 360 M900 204 L730 360 M900 228 L660 360"
        />
        <path d="M0 376 H1200 M240 360 V460 M960 360 V460" />
      </template>

      <template v-else-if="slug === 'water'">
        <path d="M0 300 H1200" />
        <path d="M140 300 V180 H420 V300 M180 180 V300 M380 180 V300" />
        <path d="M520 300 V150 H820 V300 M560 150 V300 M780 150 V300" />
        <path d="M920 300 V210 H1120 V300" />
        <path d="M140 236 C200 216 260 256 320 236 C360 222 390 246 420 236" />
        <path d="M520 210 C590 190 650 230 720 210 C770 196 800 220 820 210" />
        <path d="M920 254 C970 236 1020 268 1070 254 C1098 246 1110 260 1120 254" />
        <path d="M420 240 H520 M820 240 H920" />
        <path d="M0 316 H1200 M60 300 V460 M1160 300 V460" />
      </template>

      <template v-else-if="slug === 'buildings'">
        <path d="M0 400 H1200" />
        <path d="M260 400 V120 H620 V400" />
        <path d="M260 180 H620 M260 240 H620 M260 300 H620 M260 360 H620" />
        <path d="M350 120 V400 M440 120 V400 M530 120 V400" />
        <path d="M700 400 V220 H980 V400" />
        <path d="M700 280 H980 M700 340 H980 M790 220 V400 M880 220 V400" />
        <path d="M260 120 L440 60 L620 120" />
        <path d="M0 416 H1200 M180 400 V460 M1060 400 V460" />
      </template>

      <template v-else>
        <path d="M0 380 H1200" />
        <path d="M420 380 L470 120 L520 380 M470 120 L470 380" />
        <path d="M436 300 H504 M446 240 H494 M456 180 H484" />
        <path d="M470 140 H240 M470 160 H240 M470 140 H700 M470 160 H700" />
        <path d="M240 128 V172 M700 128 V172" />
        <path d="M240 140 C160 190 100 160 40 200 M700 160 C800 210 900 170 1000 210" />
        <path d="M860 380 V200 M860 200 L940 160 M860 200 L780 160 M860 240 L920 210 M860 240 L800 210" />
        <path d="M0 396 H1200 M340 380 V460 M980 380 V460" />
      </template>
    </g>
  </svg>
</template>

<style scoped>
.plate {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  color: var(--navy-600);
  opacity: 0.75;
  pointer-events: none;
}
</style>
