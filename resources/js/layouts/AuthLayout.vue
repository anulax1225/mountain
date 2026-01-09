<script setup>
import { Globe, Layers, Zap } from 'lucide-vue-next';
</script>

<template>
  <div class="flex min-h-screen">
    <!-- Left side - Branding/Visual -->
    <div class="hidden relative lg:flex bg-zinc-900 lg:w-1/2 overflow-hidden">
      <div class="absolute inset-0 bg-[linear-gradient(to_right,#52525b_1px,transparent_1px),linear-gradient(to_bottom,#52525b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10"></div>
      <div class="z-10 relative flex flex-col justify-center px-12 py-16 text-white">
        <div class="mb-8">
          <div class="flex items-center gap-2 mb-2">
            <div class="flex justify-center items-center bg-white/10 rounded-lg w-10 h-10">
              <span class="font-bold text-white">A</span>
            </div>
            <h1 class="font-bold text-4xl">Anulax</h1>
          </div>
          <p class="text-zinc-400">Éditeur de visites virtuelles 360°</p>
        </div>
        <div class="space-y-6 max-w-md">
          <div class="flex items-start gap-4">
            <div class="flex flex-shrink-0 justify-center items-center bg-white/10 rounded-lg w-10 h-10">
              <Globe class="w-5 h-5" />
            </div>
            <div>
              <h3 class="mb-1 font-semibold">Expériences immersives en 360°</h3>
              <p class="text-zinc-400 text-sm">Créez de superbes visites virtuelles panoramiques avec navigation interactive</p>
            </div>
          </div>
          <div class="flex items-start gap-4">
            <div class="flex flex-shrink-0 justify-center items-center bg-white/10 rounded-lg w-10 h-10">
              <Layers class="w-5 h-5" />
            </div>
            <div>
              <h3 class="mb-1 font-semibold">Organisation de projets</h3>
              <p class="text-zinc-400 text-sm">Gérez plusieurs visites avec scènes et points d'accès en un seul endroit</p>
            </div>
          </div>
          <div class="flex items-start gap-4">
            <div class="flex flex-shrink-0 justify-center items-center bg-white/10 rounded-lg w-10 h-10">
              <Zap class="w-5 h-5" />
            </div>
            <div>
              <h3 class="mb-1 font-semibold">Propulsé par Three.js</h3>
              <p class="text-zinc-400 text-sm">Rendu 3D en temps réel pour des résultats fluides et professionnels</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right side - Form -->
    <div class="flex justify-center items-center bg-white p-8 w-full lg:w-1/2">
      <div class="w-full max-w-md">
        <slot />
      </div>
    </div>
  </div>
</template>