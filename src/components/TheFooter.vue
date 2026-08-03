<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const year = new Date().getFullYear()
</script>

<template>
  <footer id="about" class="footer">
    <div class="shell footer__inner">
      <div>
        <p class="footer__mark">HDR</p>
        <p class="footer__copy">{{ t('footer.copy') }}</p>
      </div>

      <p class="footer__legal mono">{{ t('footer.legal', { year }) }}</p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  border-top: 1px solid var(--rule);
  padding-block: 2.5rem;
}

.footer__inner {
  display: grid;
  gap: 1.5rem;
}

.footer__mark {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: 0.14em;
}

.footer__copy {
  margin-top: 0.5rem;
  max-width: 44ch;
  font-size: var(--step-caption);
  color: var(--ink-muted);
}

.footer__legal {
  font-size: var(--step-eyebrow);
  color: var(--ink-faint);
}

@media (min-width: 48rem) {
  .footer__inner {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: end;
  }
}
</style>
