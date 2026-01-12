<script setup>
import { Link } from '@inertiajs/vue3'
import { Button } from '@/components/ui/button'
import PlaceholderPattern from '@/components/PlaceholderPattern.vue'
import { Zap, ArrowRight } from 'lucide-vue-next'
</script>

<template>
  <section class="relative px-4 sm:px-6 lg:px-8 pt-32 pb-20 overflow-hidden">
    <div class="-z-10 absolute inset-0">
      <div class="absolute inset-0 bg-gradient-to-b from-zinc-50 dark:from-zinc-800 to-white dark:to-zinc-900"></div>
      <div class="absolute inset-0 bg-[linear-gradient(to_right,#f4f4f5_1px,transparent_1px),linear-gradient(to_bottom,#f4f4f5_1px,transparent_1px)] bg-[size:4rem_4rem] dark:bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
    </div>
    
    <div class="mx-auto max-w-7xl">
      <div class="mx-auto mb-16 max-w-4xl text-center">
        <div class="inline-flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 mb-6 px-3 py-1 rounded-full text-zinc-700 dark:text-zinc-300 text-sm">
          <Zap class="w-3 h-3" />
          <span>Propulsé par Three.js</span>
        </div>
        
        <h1 class="mb-6 font-bold text-zinc-900 dark:text-zinc-100 text-5xl sm:text-6xl lg:text-7xl tracking-tight">
          Créez des visites virtuelles<br />immersives en 360°
        </h1>
        
        <p class="mx-auto mb-12 max-w-2xl text-zinc-600 dark:text-zinc-400 text-xl leading-relaxed">
          Éditeur photo panoramique professionnel pour créer des expériences 3D interactives. Téléversez, composez et partagez de superbes environnements virtuels.
        </p>
        
        <div class="flex sm:flex-row flex-col justify-center items-center gap-4">
          <Link href="/register">
            <Button size="lg" class="bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 px-8 h-12 text-white dark:text-zinc-900 text-base">
              Commencer gratuitement
              <ArrowRight class="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Button size="lg" variant="outline" class="px-8 h-12 text-base">
            Voir la démo
          </Button>
        </div>
      </div>

      <div class="relative mx-auto max-w-5xl">
        <div class="absolute -inset-4 bg-gradient-to-r from-zinc-100 dark:from-zinc-800 via-zinc-50 dark:via-zinc-900 to-zinc-100 dark:to-zinc-800 opacity-50 blur-3xl rounded-3xl"></div>
        <div class="relative bg-white dark:bg-zinc-900 shadow-2xl border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
          <PlaceholderPattern class="aspect-[16/9]" />
        </div>
      </div>
    </div>
  </section>
</template>