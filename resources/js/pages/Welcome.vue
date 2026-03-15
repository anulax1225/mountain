<script setup>
import { ref } from 'vue'
import LandingLayout from '@/layouts/LandingLayout.vue'
import LandingHero from '@/components/landing/LandingHero.vue'
import LandingFeatures from '@/components/landing/LandingFeatures.vue'
import LandingCTA from '@/components/landing/LandingCTA.vue'
import { useMetaballBackground } from '@/composables/useMetaballBackground'

const canvasRef = ref(null)
const { isSupported } = useMetaballBackground(canvasRef)
</script>

<template>
  <LandingLayout>
    <canvas ref="canvasRef" class="pointer-events-none fixed inset-0 -z-10" />
    <LandingHero :webgl-active="isSupported" />
    <LandingFeatures />
    <LandingCTA />
  </LandingLayout>
</template>