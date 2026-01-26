<script setup>
import { ref, computed } from 'vue'
import { Link } from '@inertiajs/vue3'
import { Button } from '@/components/ui/button'
import AppBrand from '@/components/AppBrand.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import { Menu, X, LayoutDashboard } from 'lucide-vue-next'

const props = defineProps({
  auth: {
    type: Object,
    default: () => ({ user: null })
  }
})

const mobileMenuOpen = ref(false)
const isLoggedIn = computed(() => !!props.auth?.user)
</script>

<template>
  <nav class="top-0 z-50 fixed bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-zinc-200 dark:border-zinc-800 border-b w-full">
    <div class="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
      <div class="flex justify-between items-center h-16">
        <AppBrand />
        <div class="hidden md:flex items-center gap-8">
          <a href="/#features" class="text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-100 dark:text-zinc-400 text-sm transition-colors">Fonctionnalités</a>
          <Link href="/gallery" class="text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-100 dark:text-zinc-400 text-sm transition-colors">Galerie</Link>
          <Link href="/pricing" class="text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-100 dark:text-zinc-400 text-sm transition-colors">Tarifs</Link>
          <Link href="/contact" class="text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-100 dark:text-zinc-400 text-sm transition-colors">Contact</Link>
          <ThemeToggle />
          <div class="flex items-center gap-3 ml-4">
            <template v-if="isLoggedIn">
              <Link href="/dashboard">
                <Button size="sm" class="bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900">
                  <LayoutDashboard class="w-4 h-4 mr-2" />
                  Tableau de bord
                </Button>
              </Link>
            </template>
            <template v-else>
              <Link href="/login">
                <Button size="sm" class="bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900">Connexion</Button>
              </Link>
            </template>
          </div>
        </div>

        <button @click="mobileMenuOpen = !mobileMenuOpen" class="md:hidden">
          <Menu v-if="!mobileMenuOpen" class="w-6 h-6 text-zinc-900 dark:text-zinc-100" />
          <X v-else class="w-6 h-6 text-zinc-900 dark:text-zinc-100" />
        </button>
      </div>
    </div>

    <div v-if="mobileMenuOpen" class="md:hidden bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 border-t">
      <div class="space-y-3 px-4 py-4">
        <a href="#features" class="block text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-100 dark:text-zinc-400 text-sm">Fonctionnalités</a>
        <Link href="/gallery" class="block text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-100 dark:text-zinc-400 text-sm">Galerie</Link>
        <Link href="/pricing" class="block text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-100 dark:text-zinc-400 text-sm">Tarifs</Link>
        <Link href="/contact" class="block text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-100 dark:text-zinc-400 text-sm">Contact</Link>
        <div class="flex items-center gap-2">
          <span class="text-zinc-600 dark:text-zinc-400 text-sm">Thème:</span>
          <ThemeToggle />
        </div>
        <div class="space-y-2 pt-3 border-zinc-200 dark:border-zinc-800 border-t">
          <template v-if="isLoggedIn">
            <Link href="/dashboard" class="block">
              <Button size="sm" class="bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 w-full text-white dark:text-zinc-900">
                <LayoutDashboard class="w-4 h-4 mr-2" />
                Tableau de bord
              </Button>
            </Link>
          </template>
          <template v-else>
            <Link href="/login" class="block">
              <Button size="sm" class="bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 w-full text-white dark:text-zinc-900">Connexion</Button>
            </Link>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>