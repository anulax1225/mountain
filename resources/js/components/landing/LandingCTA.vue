<script setup>
import { Link } from '@inertiajs/vue3'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-vue-next'
</script>

<template>
  <section class="px-4 sm:px-6 lg:px-8 py-24">
    <div class="mx-auto max-w-4xl">
      <div class="relative overflow-hidden rounded-3xl"
        style="background: linear-gradient(135deg, oklch(0.48 0.18 var(--primary-hue)), oklch(0.42 0.15 var(--primary-hue)), oklch(0.50 0.16 var(--secondary-hue)));">
        <!-- Organic pattern overlay -->
        <div class="absolute inset-0 opacity-[0.08]"
          style="background-image: radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px); background-size: 2.5rem 2.5rem;"></div>
        <!-- Floating organic blobs -->
        <div class="absolute -top-16 -right-16 w-48 h-48 clip-organic-1 opacity-10 bg-white"></div>
        <div class="absolute -bottom-12 -left-12 w-36 h-36 clip-organic-2 opacity-[0.07] bg-white"></div>

        <div class="relative p-12 text-center">
          <h2 class="mb-4 text-primary-foreground text-3xl sm:text-4xl" style="font-family: var(--font-family-display); font-weight: 800;">
            Prêt à commencer?
          </h2>
          <p class="mx-auto mb-8 max-w-2xl text-primary-foreground/80 text-lg">
            Rejoignez les professionnels qui créent la prochaine génération d'expériences virtuelles
          </p>
          <Link href="/contact">
            <Button size="lg" variant="secondary" class="rounded-full px-8 h-12 text-base">
              Nous contacter
              <ArrowRight class="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  </section>
</template>
