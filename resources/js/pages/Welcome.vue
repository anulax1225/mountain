<script setup>
import LandingLayout from '@/layouts/LandingLayout.vue'
import LandingHero from '@/components/landing/LandingHero.vue'
import LandingFeatures from '@/components/landing/LandingFeatures.vue'
import LandingCTA from '@/components/landing/LandingCTA.vue'
</script>

<template>
  <LandingLayout>
    <LandingHero />
    <LandingFeatures />
    <LandingCTA />
  </LandingLayout>
</template>