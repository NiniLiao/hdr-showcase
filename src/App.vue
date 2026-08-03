<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import TheHeader from '@/components/TheHeader.vue'
import HeroSection from '@/components/HeroSection.vue'
import ServiceDirectory from '@/components/ServiceDirectory.vue'
import FeaturedProjects from '@/components/FeaturedProjects.vue'
import ServiceDetail from '@/components/ServiceDetail.vue'
import ContactPortal from '@/components/ContactPortal.vue'
import TheFooter from '@/components/TheFooter.vue'
import { useServicesStore } from '@/stores/services'
import type { Locale } from '@/types'

const store = useServicesStore()
const { stats } = storeToRefs(store)
const { t, locale } = useI18n()

onMounted(() => store.switchLocale(locale.value as Locale))

watch(locale, (next) => store.switchLocale(next as Locale))
</script>

<template>
  <a class="skip-link" href="#services">{{ t('skip') }}</a>
  <TheHeader />

  <main>
    <HeroSection :stats="stats" />
    <ServiceDirectory />
    <FeaturedProjects />
    <ContactPortal />
  </main>

  <TheFooter />
  <ServiceDetail />
</template>
