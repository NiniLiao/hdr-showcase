<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import TheHeader from '@/components/TheHeader.vue'
import HeroSection from '@/components/HeroSection.vue'
import ServiceDirectory from '@/components/ServiceDirectory.vue'
import FeaturedProjects from '@/components/FeaturedProjects.vue'
import ServiceDetail from '@/components/ServiceDetail.vue'
import ContactPortal from '@/components/ContactPortal.vue'
import TheFooter from '@/components/TheFooter.vue'
import { useServicesStore } from '@/stores/services'

const store = useServicesStore()
const { stats } = storeToRefs(store)

onMounted(async () => {
  await store.load()
  await store.loadAllDetails()
})
</script>

<template>
  <a class="skip-link" href="#services">Skip to services</a>
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
