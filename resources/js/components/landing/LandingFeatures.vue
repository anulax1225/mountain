<script setup>
import FeatureCard from './FeatureCard.vue'
import { Globe, Layers, Zap } from 'lucide-vue-next'

const features = [
  {
    icon: Globe,
    title: 'Panoramas 360°',
    description: 'Téléversez des photos équirectangulaires et affichez-les comme des environnements sphériques entièrement interactifs avec une navigation fluide.'
  },
  {
    icon: Layers,
    title: 'Points d\'accès interactifs',
    description: 'Placez des points de navigation n\'importe où dans vos scènes pour créer des transitions fluides entre les lieux.'
  },
  {
    icon: Zap,
    title: 'Rendu en temps réel',
    description: 'Voyez vos modifications instantanément avec le rendu 3D propulsé par Three.js. Performances fluides sur tous les appareils.'
  }
]
</script>

<template>
  <section id="features" class="relative px-4 sm:px-6 lg:px-8 py-24 overflow-hidden">
    <!-- Radial gradient background -->
    <div class="absolute inset-0 -z-10 opacity-60 dark:opacity-40"
      style="background: radial-gradient(ellipse at 50% 50%, oklch(0.90 0.08 var(--primary-hue)), transparent 70%);"></div>

    <div class="mx-auto max-w-7xl">
      <div class="mb-16 text-center">
        <h2 class="mb-4 text-foreground text-3xl sm:text-4xl animate-fade-up" style="font-family: var(--font-family-display); font-weight: 600;">
          Tout ce dont vous avez besoin
        </h2>
        <p class="mx-auto max-w-2xl text-muted-foreground text-lg animate-fade-up delay-100">
          Conçu pour les créateurs qui exigent des résultats professionnels
        </p>
      </div>

      <div class="gap-8 grid grid-cols-1 md:grid-cols-3">
        <FeatureCard
          v-for="(feature, index) in features"
          :key="feature.title"
          :icon="feature.icon"
          :title="feature.title"
          :description="feature.description"
          class="animate-scale-in"
          :class="[`delay-${(index + 2) * 100}`]"
        />
      </div>
    </div>
  </section>
</template>
