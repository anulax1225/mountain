<script setup>
import { Link } from '@inertiajs/vue3'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-vue-next'
</script>

<template>
  <section class="px-4 sm:px-6 lg:px-8 py-24">
    <div class="mx-auto max-w-4xl">
      <div class="relative overflow-hidden rounded-3xl bg-primary">
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
