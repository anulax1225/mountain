<script setup>
defineProps({
  icon: Object,
  title: String,
  description: String,
})
</script>

<template>
  <div class="group">
    <div class="bg-card p-8 border border-border hover:border-primary/50 rounded-xl h-full transition-all">
      <div class="flex justify-center items-center bg-muted group-hover:bg-primary mb-6 rounded-lg w-12 h-12 transition-colors">
        <component :is="icon" class="w-6 h-6 text-muted-foreground group-hover:text-primary-foreground transition-colors" />
      </div>
      <h3 class="mb-3 font-semibold text-foreground text-xl">{{ title }}</h3>
      <p class="text-muted-foreground leading-relaxed">{{ description }}</p>
    </div>
  </div>
</template>