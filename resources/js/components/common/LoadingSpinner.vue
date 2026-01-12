<script setup>
defineProps({
  size: {
    type: String,
    default: 'md'
  }
})

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12'
}
</script>

<template>
  <div class="flex justify-center items-center py-12">
    <div :class="[
      'border-4 border-zinc-300 dark:border-zinc-700 border-t-zinc-900 dark:border-t-zinc-100 rounded-full animate-spin',
      sizeClasses[size]
    ]"></div>
  </div>
</template>