<script setup>
defineProps({
  icon: Object,
  title: String,
  description: String,
})
</script>

<template>
  <div class="group">
    <div class="bg-card p-8 border border-border hover:border-primary/50 rounded-2xl h-full transition-all hover:shadow-lg">
      <div class="flex justify-center items-center mb-6 w-12 h-12 clip-organic-1 transition-colors"
        style="background: linear-gradient(135deg, oklch(0.92 0.04 var(--primary-hue)), oklch(0.95 0.03 var(--secondary-hue)));">
        <component :is="icon" class="w-6 h-6 text-primary group-hover:text-primary transition-colors" />
      </div>
      <h3 class="mb-3 text-foreground text-xl" style="font-family: var(--font-family-display); font-weight: 600;">{{ title }}</h3>
      <p class="text-muted-foreground leading-relaxed">{{ description }}</p>
    </div>
  </div>
</template>
