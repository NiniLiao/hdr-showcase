<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useScrollLock } from '@/composables/useScrollLock'
import { applyLocale } from '@/i18n'
import type { Locale } from '@/types'

const menuOpen = ref(false)
useScrollLock(menuOpen)

const { t, locale } = useI18n()

const links = computed(() => [
  { href: '#services', label: t('nav.services') },
  { href: '#projects', label: t('nav.projects') },
  { href: '#about', label: t('nav.about') },
])

const nextLocale = computed<Locale>(() => (locale.value === 'zh-TW' ? 'en' : 'zh-TW'))

function go(href: string) {
  menuOpen.value = false
  document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

watch(menuOpen, (open) => {
  if (!open) return
  const onKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') menuOpen.value = false
  }
  window.addEventListener('keydown', onKey, { once: true })
})
</script>

<template>
  <header class="header">
    <div class="shell header__inner">
      <a class="wordmark" href="#top" @click.prevent="go('#top')">
        HDR
        <span class="wordmark__rule" aria-hidden="true"></span>
        <span class="wordmark__since mono">{{ t('nav.since') }}</span>
      </a>

      <nav class="nav" aria-label="Primary">
        <a v-for="link in links" :key="link.href" :href="link.href" @click.prevent="go(link.href)">
          {{ link.label }}
        </a>
      </nav>

      <button
        class="lang"
        type="button"
        :title="t('lang.switchTo')"
        :aria-label="t('lang.switchTo')"
        @click="applyLocale(nextLocale)"
      >
        <span class="mono">{{ nextLocale === 'zh-TW' ? '中文' : 'EN' }}</span>
      </button>

      <a class="cta" href="#contact" @click.prevent="go('#contact')">{{ t('nav.contact') }}</a>

      <button
        class="burger"
        type="button"
        :aria-expanded="menuOpen"
        aria-controls="mobile-menu"
        @click="menuOpen = !menuOpen"
      >
        <span class="visually-hidden">{{ menuOpen ? t('nav.close') : t('nav.open') }}</span>
        <span class="burger__bar" :class="{ 'burger__bar--top': true, 'is-open': menuOpen }"></span>
        <span class="burger__bar" :class="{ 'burger__bar--bottom': true, 'is-open': menuOpen }"></span>
      </button>
    </div>

    <Transition name="menu">
      <div v-if="menuOpen" id="mobile-menu" class="menu">
        <a
          v-for="(link, index) in [...links, { href: '#contact', label: t('nav.contact') }]"
          :key="link.href"
          class="menu__link"
          :href="link.href"
          :style="{ '--i': index }"
          @click.prevent="go(link.href)"
        >
          <span class="mono menu__index">{{ String(index + 1).padStart(2, '0') }}</span>
          {{ link.label }}
        </a>

        <button class="menu__lang" type="button" @click="applyLocale(nextLocale)">
          <span class="mono menu__index">{{ t('lang.label') }}</span>
          {{ nextLocale === 'zh-TW' ? '中文' : 'English' }}
        </button>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 40;
  background: color-mix(in srgb, var(--paper) 88%, transparent);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--rule);
}

.header__inner {
  display: flex;
  align-items: center;
  gap: 2rem;
  height: var(--header-h);
}

.wordmark {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  color: var(--ink);
  text-decoration: none;
}

.wordmark__rule {
  width: 22px;
  height: 1px;
  background: var(--rule-strong);
}

.wordmark__since {
  font-size: var(--step-eyebrow);
  color: var(--ink-faint);
  letter-spacing: 0.08em;
}

.nav {
  display: none;
  margin-inline-start: auto;
  gap: 1.75rem;
}

.nav a {
  position: relative;
  font-size: var(--step-caption);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ink-muted);
  text-decoration: none;
  padding-block: 0.35rem;
  transition: color var(--dur-fast) var(--ease-out);
}

.nav a::after {
  content: '';
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  height: 1px;
  background: var(--navy-600);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--dur-base) var(--ease-out);
}

.nav a:hover {
  color: var(--ink);
}

.nav a:hover::after {
  transform: scaleX(1);
}

.lang {
  display: none;
  align-items: center;
  font-size: var(--step-eyebrow);
  letter-spacing: 0.1em;
  color: var(--ink-muted);
  padding: 0.5rem 0.6rem;
  border-radius: var(--radius);
  transition: color var(--dur-fast) var(--ease-out);
}

.lang:hover {
  color: var(--ink);
}

.cta {
  display: none;
  font-size: var(--step-caption);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ink);
  text-decoration: none;
  border: 1px solid var(--rule-strong);
  border-radius: var(--radius);
  padding: 0.5rem 1rem;
  transition:
    background var(--dur-fast) var(--ease-out),
    border-color var(--dur-fast) var(--ease-out);
}

.cta:hover {
  background: var(--navy-800);
  border-color: var(--navy-800);
  color: #fff;
}

.burger {
  display: grid;
  gap: 5px;
  margin-inline-start: auto;
  padding: 0.5rem;
  margin-inline-end: -0.5rem;
}

.burger__bar {
  display: block;
  width: 22px;
  height: 1.5px;
  background: var(--ink);
  transition: transform var(--dur-base) var(--ease-out);
}

.burger__bar--top.is-open {
  transform: translateY(3.25px) rotate(45deg);
}

.burger__bar--bottom.is-open {
  transform: translateY(-3.25px) rotate(-45deg);
}

.menu {
  border-top: 1px solid var(--rule);
  padding: 0.5rem var(--gutter) 1.5rem;
  background: var(--paper);
}

.menu__link {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  padding: 0.9rem 0;
  border-bottom: 1px solid var(--rule);
  font-size: 1.125rem;
  color: var(--ink);
  text-decoration: none;
}

.menu__index {
  font-size: var(--step-eyebrow);
  color: var(--ink-faint);
}

.menu__lang {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  width: 100%;
  padding: 0.9rem 0;
  font-size: 1.125rem;
  color: var(--ink-muted);
}

.menu-enter-active,
.menu-leave-active {
  transition:
    opacity var(--dur-base) var(--ease-out),
    transform var(--dur-base) var(--ease-out);
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (min-width: 48rem) {
  .nav,
  .lang,
  .cta {
    display: flex;
  }

  .burger {
    display: none;
  }

  .menu {
    display: none;
  }
}
</style>
