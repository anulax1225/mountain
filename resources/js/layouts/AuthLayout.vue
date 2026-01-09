<script setup>
import { Globe, Layers, Zap } from 'lucide-vue-next';
</script>

<template>
  <div class="min-h-screen flex">
    <!-- Left side - Branding/Visual -->
    <div class="hidden lg:flex lg:w-1/2 bg-zinc-900 relative overflow-hidden">
      <div class="absolute inset-0 bg-[linear-gradient(to_right,#52525b_1px,transparent_1px),linear-gradient(to_bottom,#52525b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10"></div>
      <div class="relative z-10 flex flex-col justify-center px-12 py-16 text-white">
        <div class="mb-8">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <span class="text-white font-bold">A</span>
            </div>
            <h1 class="text-4xl font-bold">Anulax</h1>
          </div>
          <p class="text-zinc-400">360° Virtual Tour Editor</p>
        </div>
        <div class="space-y-6 max-w-md">
          <div class="flex items-start gap-4">
            <div class="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
              <Globe class="w-5 h-5" />
            </div>
            <div>
              <h3 class="font-semibold mb-1">Immersive 360° Experiences</h3>
              <p class="text-sm text-zinc-400">Create stunning panoramic virtual tours with interactive navigation</p>
            </div>
          </div>
          <div class="flex items-start gap-4">
            <div class="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
              <Layers class="w-5 h-5" />
            </div>
            <div>
              <h3 class="font-semibold mb-1">Project Organization</h3>
              <p class="text-sm text-zinc-400">Manage multiple tours with scenes and hotspots in one place</p>
            </div>
          </div>
          <div class="flex items-start gap-4">
            <div class="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
              <Zap class="w-5 h-5" />
            </div>
            <div>
              <h3 class="font-semibold mb-1">Powered by Three.js</h3>
              <p class="text-sm text-zinc-400">Real-time 3D rendering for smooth, professional results</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right side - Form -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
      <div class="w-full max-w-md">
        <slot />
      </div>
    </div>
  </div>
</template>
