<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const year = new Date().getFullYear()

const columns = [
  { key: 'touch', links: ['contactUs', 'allLocations'] },
  { key: 'careers', links: ['openings', 'workingHere'] },
  { key: 'company', links: ['ourCulture', 'sustainability'] },
] as const
</script>

<template>
  <footer id="about" class="footer">
    <div class="shell footer__grid">
      <div class="footer__brand">
        <p class="footer__mark">HDR</p>
        <p class="footer__motto">{{ t('footer.motto') }}</p>
        <p class="footer__copy">{{ t('footer.copy') }}</p>
      </div>

      <div v-for="column in columns" :key="column.key" class="footer__col">
        <p class="eyebrow footer__heading">{{ t(`footer.${column.key}`) }}</p>
        <ul>
          <li v-for="link in column.links" :key="link">
            <a href="#contact">{{ t(`footer.${link}`) }}</a>
          </li>
        </ul>
      </div>
    </div>

    <div class="shell footer__base">
      <p class="footer__legal mono">{{ t('footer.legal', { year }) }}</p>
      <p class="footer__legal mono">{{ t('footer.note') }}</p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: var(--navy-900);
  color: #fff;
  padding-block: 2.5rem 1.5rem;
}

.footer__grid {
  display: grid;
  gap: 2rem;
}

.footer__mark {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: 0.14em;
}

.footer__motto {
  margin-top: 0.6rem;
  max-width: 34ch;
  color: #cfe0f2;
}

.footer__copy {
  margin-top: 0.5rem;
  max-width: 40ch;
  font-size: var(--step-caption);
  color: #9db8d4;
}

.footer__heading {
  color: var(--navy-400);
  margin-bottom: 0.7rem;
}

.footer__col ul {
  display: grid;
  gap: 0.4rem;
}

.footer__col a {
  font-size: var(--step-caption);
  color: #cfe0f2;
  text-decoration: none;
  transition: color var(--dur-fast) var(--ease-out);
}

.footer__col a:hover {
  color: #fff;
}

.footer__base {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.5rem;
  margin-top: 2.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--navy-600);
}

.footer__legal {
  font-size: var(--step-eyebrow);
  color: #85b7eb;
}

@media (min-width: 48rem) {
  .footer__grid {
    grid-template-columns: 1.6fr repeat(3, minmax(0, 1fr));
    gap: 2.5rem;
  }
}
</style>
