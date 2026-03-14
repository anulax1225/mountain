<script setup>
import { Globe, Layers, Zap } from 'lucide-vue-next';
import ThemeToggle from '@/components/ThemeToggle.vue';
import AppLogo from '@/components/AppLogo.vue';
</script>

<template>
  <div class="flex min-h-screen">
    <!-- Left side - Branding/Visual -->
    <div class="hidden relative lg:flex lg:w-1/2 overflow-hidden" style="background: linear-gradient(to bottom right, oklch(0.25 0.06 145), oklch(0.15 0.04 45));">
      <!-- Organic topographic pattern -->
      <div class="absolute inset-0 opacity-[0.06]" style="background-image: radial-gradient(circle at 25% 25%, rgba(255,255,255,0.3) 1px, transparent 1px), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.2) 1px, transparent 1px); background-size: 3rem 3rem, 2rem 2rem;"></div>

      <!-- Decorative organic blob -->
      <div class="absolute -top-20 -right-20 w-80 h-80 clip-organic-1 opacity-10" style="background: linear-gradient(135deg, oklch(0.6 0.18 145), oklch(0.5 0.15 45));"></div>
      <div class="absolute -bottom-16 -left-16 w-64 h-64 clip-organic-2 opacity-[0.07]" style="background: linear-gradient(135deg, oklch(0.7 0.15 45), oklch(0.5 0.12 145));"></div>

      <div class="z-10 relative flex flex-col justify-center px-12 py-16 text-white">
        <div class="mb-8">
          <div class="flex items-center gap-3 mb-2">
            <AppLogo class="w-10 h-10" />
            <h1 class="font-bold text-4xl" style="font-family: var(--font-family-display);">Owlaround</h1>
          </div>
          <p class="text-white/50">Éditeur de visites virtuelles 360°</p>
        </div>
        <div class="space-y-6 max-w-md">
          <div class="flex items-start gap-4">
            <div class="flex flex-shrink-0 justify-center items-center rounded-xl w-10 h-10" style="background: oklch(0.65 0.15 45 / 0.2);">
              <Globe class="w-5 h-5 text-amber-300/80" />
            </div>
            <div>
              <h3 class="mb-1 font-semibold">Expériences immersives en 360°</h3>
              <p class="text-white/50 text-sm">Créez de superbes visites virtuelles panoramiques avec navigation interactive</p>
            </div>
          </div>
          <div class="flex items-start gap-4">
            <div class="flex flex-shrink-0 justify-center items-center rounded-xl w-10 h-10" style="background: oklch(0.65 0.15 45 / 0.2);">
              <Layers class="w-5 h-5 text-amber-300/80" />
            </div>
            <div>
              <h3 class="mb-1 font-semibold">Organisation de projets</h3>
              <p class="text-white/50 text-sm">Gérez plusieurs visites avec scènes et points d'accès en un seul endroit</p>
            </div>
          </div>
          <div class="flex items-start gap-4">
            <div class="flex flex-shrink-0 justify-center items-center rounded-xl w-10 h-10" style="background: oklch(0.65 0.15 45 / 0.2);">
              <Zap class="w-5 h-5 text-amber-300/80" />
            </div>
            <div>
              <h3 class="mb-1 font-semibold">Propulsé par Three.js</h3>
              <p class="text-white/50 text-sm">Rendu 3D en temps réel pour des résultats fluides et professionnels</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right side - Form -->
    <div class="flex justify-center items-center bg-card p-8 w-full lg:w-1/2">
      <div class="w-full max-w-md animate-fade-up">
        <div class="flex justify-end mb-4">
          <ThemeToggle />
        </div>
        <slot />
      </div>
    </div>
  </div>
</template>
