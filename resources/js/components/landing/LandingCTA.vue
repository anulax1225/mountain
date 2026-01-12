<script setup>
import { Link } from '@inertiajs/vue3'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-vue-next'
</script>

<template>
  <section class="px-4 sm:px-6 lg:px-8 py-24">
    <div class="mx-auto max-w-4xl">
      <div class="relative">
        <div class="absolute inset-0 bg-zinc-900 dark:bg-zinc-800 rounded-3xl"></div>
        <div class="absolute inset-0 bg-[linear-gradient(to_right,#52525b_1px,transparent_1px),linear-gradient(to_bottom,#52525b_1px,transparent_1px)] bg-[size:4rem_4rem] dark:bg-[linear-gradient(to_right,#3f3f46_1px,transparent_1px),linear-gradient(to_bottom,#3f3f46_1px,transparent_1px)] opacity-10 rounded-3xl"></div>
        <div class="relative p-12 text-center">
          <h2 class="mb-4 font-bold text-white text-3xl sm:text-4xl">
            Prêt à commencer?
          </h2>
          <p class="mx-auto mb-8 max-w-2xl text-zinc-400 dark:text-zinc-300 text-lg">
            Rejoignez les professionnels qui créent la prochaine génération d'expériences virtuelles
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" class="px-8 h-12 text-base">
              Créer un compte gratuit
              <ArrowRight class="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  </section>
</template>