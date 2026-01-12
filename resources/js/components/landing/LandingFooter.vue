<script setup>
import AppLogo from '@/components/AppLogo.vue'
</script>

<template>
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
</template>