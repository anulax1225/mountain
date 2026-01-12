<script setup>
defineProps({
  icon: Object,
  title: String,
  description: String,
})
</script>

<template>
  <div class="group">
    <div class="bg-white dark:bg-zinc-900 p-8 border border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700 rounded-xl h-full transition-all">
      <div class="flex justify-center items-center bg-zinc-100 dark:bg-zinc-800 dark:group-hover:bg-white group-hover:bg-zinc-900 mb-6 rounded-lg w-12 h-12 transition-colors">
        <component :is="icon" class="w-6 h-6 text-zinc-700 dark:group-hover:text-zinc-900 dark:text-zinc-300 group-hover:text-white transition-colors" />
      </div>
      <h3 class="mb-3 font-semibold text-zinc-900 dark:text-zinc-100 text-xl">{{ title }}</h3>
      <p class="text-zinc-600 dark:text-zinc-400 leading-relaxed">{{ description }}</p>
    </div>
  </div>
</template>