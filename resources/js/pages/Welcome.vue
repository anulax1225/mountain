<script setup>
import LandingNavigation from '@/components/landing/LandingNavigation.vue'
import LandingHero from '@/components/landing/LandingHero.vue'
import LandingFeatures from '@/components/landing/LandingFeatures.vue'
import LandingCTA from '@/components/landing/LandingCTA.vue'
import LandingFooter from '@/components/landing/LandingFooter.vue'
</script>

<template>
  <div class="bg-white dark:bg-zinc-900 min-h-screen">
    <LandingNavigation />
    <LandingHero />
    <LandingFeatures />
    <LandingCTA />
    <LandingFooter />
  </div>
</template>