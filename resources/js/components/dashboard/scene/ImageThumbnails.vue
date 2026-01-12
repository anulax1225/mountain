<script setup>
defineProps({
  images: Array,
  currentIndex: Number,
  sceneName: String
})

const emit = defineEmits(['select'])
</script>

<template>
  <div class="flex gap-2 pb-2 overflow-x-auto">
    <button
      v-for="(image, index) in images"
      :key="image.slug"
      @click="emit('select', index)"
      :class="[
        'relative flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden transition-all',
        currentIndex === index 
          ? 'ring-2 ring-purple-500 dark:ring-purple-400 ring-offset-2 dark:ring-offset-zinc-900' 
          : 'opacity-60 hover:opacity-100'
      ]"
    >
      <img 
        :src="`/images/${image.slug}/download`" 
        :alt="sceneName"
        class="w-full h-full object-cover"
      />
    </button>
  </div>
</template>