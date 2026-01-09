<script setup>
import { ref } from 'vue';
import { Link } from '@inertiajs/vue3';
import { Button } from '@/components/ui/button';
import PlaceholderPattern from '@/components/PlaceholderPattern.vue';
import { Globe, Zap, Layers, ArrowRight, Menu, X } from 'lucide-vue-next';

const mobileMenuOpen = ref(false);
</script>

<template>
  <div class="bg-white min-h-screen">
    <!-- Navigation -->
    <nav class="top-0 z-50 fixed bg-white/80 backdrop-blur-md border-zinc-200 border-b w-full">
      <div class="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center gap-2">
            <div class="flex justify-center items-center bg-zinc-900 rounded-lg w-8 h-8">
              <span class="font-bold text-white text-sm">A</span>
            </div>
            <span class="font-bold text-zinc-900 text-lg">Anulax</span>
          </div>
          
          <div class="hidden md:flex items-center gap-8">
            <a href="#features" class="text-zinc-600 hover:text-zinc-900 text-sm transition-colors">Features</a>
            <a href="#" class="text-zinc-600 hover:text-zinc-900 text-sm transition-colors">Gallery</a>
            <a href="#" class="text-zinc-600 hover:text-zinc-900 text-sm transition-colors">Pricing</a>
            <div class="flex items-center gap-3 ml-4">
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" class="bg-zinc-900 hover:bg-zinc-800">Get Started</Button>
              </Link>
            </div>
          </div>

          <button @click="mobileMenuOpen = !mobileMenuOpen" class="md:hidden">
            <Menu v-if="!mobileMenuOpen" class="w-6 h-6 text-zinc-900" />
            <X v-else class="w-6 h-6 text-zinc-900" />
          </button>
        </div>
      </div>

      <!-- Mobile menu -->
      <div v-if="mobileMenuOpen" class="md:hidden bg-white border-zinc-200 border-t">
        <div class="space-y-3 px-4 py-4">
          <a href="#features" class="block text-zinc-600 hover:text-zinc-900 text-sm">Features</a>
          <a href="#" class="block text-zinc-600 hover:text-zinc-900 text-sm">Gallery</a>
          <a href="#" class="block text-zinc-600 hover:text-zinc-900 text-sm">Pricing</a>
          <div class="space-y-2 pt-3 border-zinc-200 border-t">
            <Link href="/login" class="block">
              <Button variant="ghost" size="sm" class="w-full">Sign in</Button>
            </Link>
            <Link href="/register" class="block">
              <Button size="sm" class="bg-zinc-900 hover:bg-zinc-800 w-full">Get Started</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="relative px-4 sm:px-6 lg:px-8 pt-32 pb-20 overflow-hidden">
      <!-- Background Pattern -->
      <div class="-z-10 absolute inset-0">
        <div class="absolute inset-0 bg-gradient-to-b from-zinc-50 to-white"></div>
        <div class="absolute inset-0 bg-[linear-gradient(to_right,#f4f4f5_1px,transparent_1px),linear-gradient(to_bottom,#f4f4f5_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
      </div>
      
      <div class="mx-auto max-w-7xl">
        <div class="mx-auto mb-16 max-w-4xl text-center">
          <div class="inline-flex items-center gap-2 bg-zinc-100 mb-6 px-3 py-1 rounded-full text-zinc-700 text-sm">
            <Zap class="w-3 h-3" />
            <span>Powered by Three.js</span>
          </div>
          
          <h1 class="mb-6 font-bold text-zinc-900 text-5xl sm:text-6xl lg:text-7xl tracking-tight">
            Create immersive<br />360° virtual tours
          </h1>
          
          <p class="mx-auto mb-12 max-w-2xl text-zinc-600 text-xl leading-relaxed">
            Professional panoramic photo editor for building interactive 3D experiences. Upload, compose, and share stunning virtual environments.
          </p>
          
          <div class="flex sm:flex-row flex-col justify-center items-center gap-4">
            <Link href="/register">
              <Button size="lg" class="bg-zinc-900 hover:bg-zinc-800 px-8 h-12 text-base">
                Start Creating Free
                <ArrowRight class="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" class="px-8 h-12 text-base">
              Watch Demo
            </Button>
          </div>
        </div>

        <!-- Hero Visual -->
        <div class="relative mx-auto max-w-5xl">
          <div class="absolute -inset-4 bg-gradient-to-r from-zinc-100 via-zinc-50 to-zinc-100 opacity-50 blur-3xl rounded-3xl"></div>
          <div class="relative bg-white shadow-2xl border border-zinc-200 rounded-2xl overflow-hidden">
            <PlaceholderPattern class="aspect-[16/9]" />
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="bg-zinc-50 px-4 sm:px-6 lg:px-8 py-24">
      <div class="mx-auto max-w-7xl">
        <div class="mb-16 text-center">
          <h2 class="mb-4 font-bold text-zinc-900 text-3xl sm:text-4xl">
            Everything you need
          </h2>
          <p class="mx-auto max-w-2xl text-zinc-600 text-lg">
            Built for creators who demand professional results
          </p>
        </div>

        <div class="gap-8 grid grid-cols-1 md:grid-cols-3">
          <div class="group">
            <div class="bg-white p-8 border border-zinc-200 hover:border-zinc-300 rounded-xl h-full transition-all">
              <div class="flex justify-center items-center bg-zinc-100 group-hover:bg-zinc-900 mb-6 rounded-lg w-12 h-12 transition-colors">
                <Globe class="w-6 h-6 text-zinc-700 group-hover:text-white transition-colors" />
              </div>
              <h3 class="mb-3 font-semibold text-zinc-900 text-xl">360° Panoramas</h3>
              <p class="text-zinc-600 leading-relaxed">
                Upload equirectangular photos and display them as fully interactive spherical environments with smooth navigation.
              </p>
            </div>
          </div>

          <div class="group">
            <div class="bg-white p-8 border border-zinc-200 hover:border-zinc-300 rounded-xl h-full transition-all">
              <div class="flex justify-center items-center bg-zinc-100 group-hover:bg-zinc-900 mb-6 rounded-lg w-12 h-12 transition-colors">
                <Layers class="w-6 h-6 text-zinc-700 group-hover:text-white transition-colors" />
              </div>
              <h3 class="mb-3 font-semibold text-zinc-900 text-xl">Interactive Hotspots</h3>
              <p class="text-zinc-600 leading-relaxed">
                Place navigation points anywhere in your scenes to create seamless transitions between locations.
              </p>
            </div>
          </div>

          <div class="group">
            <div class="bg-white p-8 border border-zinc-200 hover:border-zinc-300 rounded-xl h-full transition-all">
              <div class="flex justify-center items-center bg-zinc-100 group-hover:bg-zinc-900 mb-6 rounded-lg w-12 h-12 transition-colors">
                <Zap class="w-6 h-6 text-zinc-700 group-hover:text-white transition-colors" />
              </div>
              <h3 class="mb-3 font-semibold text-zinc-900 text-xl">Real-time Rendering</h3>
              <p class="text-zinc-600 leading-relaxed">
                See your changes instantly with Three.js powered 3D rendering. Smooth performance on any device.
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
          <div class="absolute inset-0 bg-zinc-900 rounded-3xl"></div>
          <div class="absolute inset-0 bg-[linear-gradient(to_right,#52525b_1px,transparent_1px),linear-gradient(to_bottom,#52525b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10 rounded-3xl"></div>
          <div class="relative p-12 text-center">
            <h2 class="mb-4 font-bold text-white text-3xl sm:text-4xl">
              Ready to start building?
            </h2>
            <p class="mx-auto mb-8 max-w-2xl text-zinc-400 text-lg">
              Join professionals creating the next generation of virtual experiences
            </p>
            <Link href="/register">
              <Button size="lg" variant="secondary" class="px-8 h-12 text-base">
                Create Free Account
                <ArrowRight class="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-white px-4 sm:px-6 lg:px-8 py-12 border-zinc-200 border-t">
      <div class="mx-auto max-w-7xl">
        <div class="flex md:flex-row flex-col justify-between items-center gap-4">
          <div class="flex items-center gap-2">
            <div class="flex justify-center items-center bg-zinc-900 rounded-lg w-8 h-8">
              <span class="font-bold text-white text-sm">A</span>
            </div>
            <span class="font-bold text-zinc-900">Anulax</span>
          </div>
          <div class="flex items-center gap-6 text-zinc-600 text-sm">
            <a href="#" class="hover:text-zinc-900">Privacy</a>
            <a href="#" class="hover:text-zinc-900">Terms</a>
            <a href="#" class="hover:text-zinc-900">Contact</a>
          </div>
          <p class="text-zinc-500 text-sm">© 2025 Anulax. Built with Three.js & Laravel.</p>
        </div>
      </div>
    </footer>
  </div>
</template>
