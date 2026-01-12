<script setup>
import { ref } from 'vue';
import { Link } from '@inertiajs/vue3';
import { Button } from '@/components/ui/button';
import PlaceholderPattern from '@/components/PlaceholderPattern.vue';
import { Globe, Zap, Layers, ArrowRight, Menu, X } from 'lucide-vue-next';
import AppLogo from '@/components/AppLogo.vue';
import AppBrand from '@/components/AppBrand.vue';
import ThemeToggle from '@/components/ThemeToggle.vue';

const mobileMenuOpen = ref(false);
</script>

<template>
  <div class="bg-white dark:bg-zinc-900 min-h-screen">
    <!-- Navigation -->
    <nav class="top-0 z-50 fixed bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-zinc-200 dark:border-zinc-800 border-b w-full">
      <div class="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div class="flex justify-between items-center h-16">
          <AppBrand />
          <div class="hidden md:flex items-center gap-8">
            <a href="#features" class="text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-100 dark:text-zinc-400 text-sm transition-colors">Fonctionnalités</a>
            <a href="#" class="text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-100 dark:text-zinc-400 text-sm transition-colors">Galerie</a>
            <a href="#" class="text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-100 dark:text-zinc-400 text-sm transition-colors">Tarifs</a>
            <ThemeToggle />
            <div class="flex items-center gap-3 ml-4">
              <Link href="/login">
                <Button variant="ghost" size="sm">Connexion</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" class="bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900">Commencer</Button>
              </Link>
            </div>
          </div>

          <button @click="mobileMenuOpen = !mobileMenuOpen" class="md:hidden">
            <Menu v-if="!mobileMenuOpen" class="w-6 h-6 text-zinc-900 dark:text-zinc-100" />
            <X v-else class="w-6 h-6 text-zinc-900 dark:text-zinc-100" />
          </button>
        </div>
      </div>

      <!-- Mobile menu -->
      <div v-if="mobileMenuOpen" class="md:hidden bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 border-t">
        <div class="space-y-3 px-4 py-4">
          <a href="#features" class="block text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-100 dark:text-zinc-400 text-sm">Fonctionnalités</a>
          <a href="#" class="block text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-100 dark:text-zinc-400 text-sm">Galerie</a>
          <a href="#" class="block text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-100 dark:text-zinc-400 text-sm">Tarifs</a>
          <div class="flex items-center gap-2">
            <span class="text-zinc-600 dark:text-zinc-400 text-sm">Thème:</span>
            <ThemeToggle />
          </div>
          <div class="space-y-2 pt-3 border-zinc-200 dark:border-zinc-800 border-t">
            <Link href="/login" class="block">
              <Button variant="ghost" size="sm" class="w-full">Connexion</Button>
            </Link>
            <Link href="/register" class="block">
              <Button size="sm" class="bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 w-full text-white dark:text-zinc-900">Commencer</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="relative px-4 sm:px-6 lg:px-8 pt-32 pb-20 overflow-hidden">
      <!-- Background Pattern -->
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

        <!-- Hero Visual -->
        <div class="relative mx-auto max-w-5xl">
          <div class="absolute -inset-4 bg-gradient-to-r from-zinc-100 dark:from-zinc-800 via-zinc-50 dark:via-zinc-900 to-zinc-100 dark:to-zinc-800 opacity-50 blur-3xl rounded-3xl"></div>
          <div class="relative bg-white dark:bg-zinc-900 shadow-2xl border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
            <PlaceholderPattern class="aspect-[16/9]" />
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="bg-zinc-50 dark:bg-zinc-800/50 px-4 sm:px-6 lg:px-8 py-24">
      <div class="mx-auto max-w-7xl">
        <div class="mb-16 text-center">
          <h2 class="mb-4 font-bold text-zinc-900 dark:text-zinc-100 text-3xl sm:text-4xl">
            Tout ce dont vous avez besoin
          </h2>
          <p class="mx-auto max-w-2xl text-zinc-600 dark:text-zinc-400 text-lg">
            Conçu pour les créateurs qui exigent des résultats professionnels
          </p>
        </div>

        <div class="gap-8 grid grid-cols-1 md:grid-cols-3">
          <div class="group">
            <div class="bg-white dark:bg-zinc-900 p-8 border border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700 rounded-xl h-full transition-all">
              <div class="flex justify-center items-center bg-zinc-100 dark:bg-zinc-800 dark:group-hover:bg-white group-hover:bg-zinc-900 mb-6 rounded-lg w-12 h-12 transition-colors">
                <Globe class="w-6 h-6 text-zinc-700 dark:group-hover:text-zinc-900 dark:text-zinc-300 group-hover:text-white transition-colors" />
              </div>
              <h3 class="mb-3 font-semibold text-zinc-900 dark:text-zinc-100 text-xl">Panoramas 360°</h3>
              <p class="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Téléversez des photos équirectangulaires et affichez-les comme des environnements sphériques entièrement interactifs avec une navigation fluide.
              </p>
            </div>
          </div>

          <div class="group">
            <div class="bg-white dark:bg-zinc-900 p-8 border border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700 rounded-xl h-full transition-all">
              <div class="flex justify-center items-center bg-zinc-100 dark:bg-zinc-800 dark:group-hover:bg-white group-hover:bg-zinc-900 mb-6 rounded-lg w-12 h-12 transition-colors">
                <Layers class="w-6 h-6 text-zinc-700 dark:group-hover:text-zinc-900 dark:text-zinc-300 group-hover:text-white transition-colors" />
              </div>
              <h3 class="mb-3 font-semibold text-zinc-900 dark:text-zinc-100 text-xl">Points d'accès interactifs</h3>
              <p class="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Placez des points de navigation n'importe où dans vos scènes pour créer des transitions fluides entre les lieux.
              </p>
            </div>
          </div>

          <div class="group">
            <div class="bg-white dark:bg-zinc-900 p-8 border border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700 rounded-xl h-full transition-all">
              <div class="flex justify-center items-center bg-zinc-100 dark:bg-zinc-800 dark:group-hover:bg-white group-hover:bg-zinc-900 mb-6 rounded-lg w-12 h-12 transition-colors">
                <Zap class="w-6 h-6 text-zinc-700 dark:group-hover:text-zinc-900 dark:text-zinc-300 group-hover:text-white transition-colors" />
              </div>
              <h3 class="mb-3 font-semibold text-zinc-900 dark:text-zinc-100 text-xl">Rendu en temps réel</h3>
              <p class="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Voyez vos modifications instantanément avec le rendu 3D propulsé par Three.js. Performances fluides sur tous les appareils.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
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

    <!-- Footer -->
    <footer class="bg-white dark:bg-zinc-900 px-4 sm:px-6 lg:px-8 py-12 border-zinc-200 dark:border-zinc-800 border-t">
      <div class="mx-auto max-w-7xl">
        <div class="flex md:flex-row flex-col justify-between items-center gap-4">
          <div class="flex items-center gap-2">
            <div class="flex justify-center items-center bg-zinc-900 dark:bg-white rounded-lg w-8 h-8">
              <span class="font-bold text-white dark:text-zinc-900 text-sm">A</span>
            </div>
            <span class="font-bold text-zinc-900 dark:text-zinc-100">Anulax</span>
          </div>
          <div class="flex items-center gap-6 text-zinc-600 dark:text-zinc-400 text-sm">
            <a href="#" class="hover:text-zinc-900 dark:hover:text-zinc-100">Confidentialité</a>
            <a href="#" class="hover:text-zinc-900 dark:hover:text-zinc-100">Conditions</a>
            <a href="#" class="hover:text-zinc-900 dark:hover:text-zinc-100">Contact</a>
          </div>
          <p class="text-zinc-500 dark:text-zinc-400 text-sm">© 2025 Anulax. Créé avec Three.js & Laravel.</p>
        </div>
      </div>
    </footer>
  </div>
</template>