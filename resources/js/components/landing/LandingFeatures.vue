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
  <section id="features" class="bg-zinc-50 dark:bg-zinc-800/50 px-4 sm:px-6 lg:px-8 py-24">
    <div class="mx-auto max-w-7xl">
      <div class="mb-16 text-center">
        <h2 class="mb-4 font-bold text-zinc-900 dark:text-zinc-100 text-3xl sm:text-4xl">
          Tout ce dont vous avez besoin
        </h2>
        <p class="mx-auto max-w-2xl text-zinc-600 dark:text-zinc-400 text-lg">
          Conçu pour les créateurs qui exigent des résultats professionnels
        </p>
      </div>

      <div class="gap-8 grid grid-cols-1 md:grid-cols-3">
        <FeatureCard
          v-for="feature in features"
          :key="feature.title"
          :icon="feature.icon"
          :title="feature.title"
          :description="feature.description"
        />
      </div>
    </div>
  </section>
</template>