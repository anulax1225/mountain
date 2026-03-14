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
  <nav class="top-0 z-50 fixed bg-card/50 backdrop-blur-md border-border/50 border-b w-full">
    <div class="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
      <div class="flex justify-between items-center h-16">
        <AppBrand />
        <div class="hidden md:flex items-center gap-8">
          <a href="/#features" class="relative text-muted-foreground hover:text-foreground text-sm transition-colors after:absolute after:-bottom-1 after:left-1/2 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:left-0 hover:after:w-full">Fonctionnalités</a>
          <Link href="/gallery" class="relative text-muted-foreground hover:text-foreground text-sm transition-colors after:absolute after:-bottom-1 after:left-1/2 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:left-0 hover:after:w-full">Galerie</Link>
          <Link href="/pricing" class="relative text-muted-foreground hover:text-foreground text-sm transition-colors after:absolute after:-bottom-1 after:left-1/2 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:left-0 hover:after:w-full">Tarifs</Link>
          <Link href="/about" class="relative text-muted-foreground hover:text-foreground text-sm transition-colors after:absolute after:-bottom-1 after:left-1/2 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:left-0 hover:after:w-full">À propos</Link>
          <Link href="/contact" class="relative text-muted-foreground hover:text-foreground text-sm transition-colors after:absolute after:-bottom-1 after:left-1/2 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:left-0 hover:after:w-full">Contact</Link>
          <ThemeToggle />
          <div class="flex items-center gap-3 ml-4">
            <template v-if="isLoggedIn">
              <Link href="/dashboard">
                <Button size="sm" class="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground hover:shadow-[0_0_20px_oklch(0.5_0.15_var(--primary-hue)/0.3)]">
                  <LayoutDashboard class="w-4 h-4 mr-2" />
                  Tableau de bord
                </Button>
              </Link>
            </template>
            <template v-else>
              <Link href="/login">
                <Button size="sm" class="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground hover:shadow-[0_0_20px_oklch(0.5_0.15_var(--primary-hue)/0.3)]">Connexion</Button>
              </Link>
            </template>
          </div>
        </div>

        <button @click="mobileMenuOpen = !mobileMenuOpen" class="md:hidden">
          <Menu v-if="!mobileMenuOpen" class="w-6 h-6 text-foreground" />
          <X v-else class="w-6 h-6 text-foreground" />
        </button>
      </div>
    </div>

    <div v-if="mobileMenuOpen" class="md:hidden bg-background/50 backdrop-blur-md border-border border-t">
      <div class="space-y-3 px-4 py-4">
        <a href="#features" class="block text-muted-foreground hover:text-foreground text-sm">Fonctionnalités</a>
        <Link href="/gallery" class="block text-muted-foreground hover:text-foreground text-sm">Galerie</Link>
        <Link href="/pricing" class="block text-muted-foreground hover:text-foreground text-sm">Tarifs</Link>
        <Link href="/about" class="block text-muted-foreground hover:text-foreground text-sm">À propos</Link>
        <Link href="/contact" class="block text-muted-foreground hover:text-foreground text-sm">Contact</Link>
        <div class="flex items-center gap-2">
          <span class="text-muted-foreground text-sm">Thème:</span>
          <ThemeToggle />
        </div>
        <div class="space-y-2 pt-3 border-border border-t">
          <template v-if="isLoggedIn">
            <Link href="/dashboard" class="block">
              <Button size="sm" class="rounded-full bg-primary hover:bg-primary/90 w-full text-primary-foreground">
                <LayoutDashboard class="w-4 h-4 mr-2" />
                Tableau de bord
              </Button>
            </Link>
          </template>
          <template v-else>
            <Link href="/login" class="block">
              <Button size="sm" class="rounded-full bg-primary hover:bg-primary/90 w-full text-primary-foreground">Connexion</Button>
            </Link>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>
