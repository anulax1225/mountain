<script setup>
import { Link } from '@inertiajs/vue3'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-vue-next'
</script>

<template>
  <section class="px-4 sm:px-6 lg:px-8 py-24">
    <div class="mx-auto max-w-4xl">
      <div class="relative">
        <div class="absolute inset-0 bg-primary rounded-3xl"></div>
        <div class="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary-foreground)/0.1)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary-foreground)/0.1)_1px,transparent_1px)] bg-[size:4rem_4rem] rounded-3xl"></div>
        <div class="relative p-12 text-center">
          <h2 class="mb-4 font-bold text-primary-foreground text-3xl sm:text-4xl">
            Prêt à commencer?
          </h2>
          <p class="mx-auto mb-8 max-w-2xl text-primary-foreground/80 text-lg">
            Rejoignez les professionnels qui créent la prochaine génération d'expériences virtuelles
          </p>
          <Link href="/login">
            <Button size="lg" variant="secondary" class="px-8 h-12 text-base">
              Se connecter
              <ArrowRight class="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  </section>
</template>