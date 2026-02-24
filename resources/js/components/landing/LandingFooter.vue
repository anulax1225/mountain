<script setup>
import AppLogo from '@/components/AppLogo.vue'
</script>

<template>
  <footer class="bg-background px-4 sm:px-6 lg:px-8 py-12 border-border border-t">
    <div class="mx-auto max-w-7xl">
      <div class="flex md:flex-row flex-col justify-between items-center gap-4">
        <div class="flex items-center gap-2">
          <AppLogo class="w-8 h-8" />
          <span class="font-bold text-foreground">Owlaround</span>
        </div>
        <div class="flex items-center gap-6 text-muted-foreground text-sm">
          <a href="#" class="hover:text-foreground">Confidentialité</a>
          <a href="#" class="hover:text-foreground">Conditions</a>
          <a href="/contact" class="hover:text-foreground">Contact</a>
        </div>
        <p class="text-muted-foreground text-sm">© 2025 Owlaround. Créé avec Three.js & Laravel.</p>
      </div>
    </div>
  </footer>
</template>