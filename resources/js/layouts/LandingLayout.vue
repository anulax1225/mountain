<script setup>
import { usePage } from '@inertiajs/vue3'
import LandingNavigation from '@/components/landing/LandingNavigation.vue'
import LandingFooter from '@/components/landing/LandingFooter.vue'
import { computed } from 'vue'

const page = usePage()
const auth = computed(() => page.props.auth)
</script>

<template>
  <div class="bg-white dark:bg-zinc-950 min-h-screen">
    <LandingNavigation :auth="auth" />
    <main>
      <slot />
    </main>
    <LandingFooter />
  </div>
</template>
