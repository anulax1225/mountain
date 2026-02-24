<script setup>
import { Move } from 'lucide-vue-next'

defineProps({
  mode: {
    type: String,
    default: 'Navigation'
  }
})
</script>

<template>
  <div class="right-6 bottom-6 absolute">
    <div class="flex items-center gap-2 bg-primary/90 backdrop-blur-sm px-3 py-2 rounded-lg text-primary-foreground text-xs">
      <Move class="w-4 h-4" />
      <span>Mode {{ mode }}</span>
    </div>
  </div>
</template>