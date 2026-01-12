<script setup>
defineProps({
  images: Array,
  currentIndex: Number,
  sceneName: String,
  show: Boolean
})

const emit = defineEmits(['select'])
</script>

<template>
  <div class="right-0 bottom-0 left-0 absolute flex flex-col items-center gap-2">
    <div class="bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full max-w-16 text-white text-sm -translate-x-1/2">
      {{ currentIndex + 1 }} / {{ images.length }}
    </div>
    <div v-if="show" class="bg-black/50 backdrop-blur-sm p-3 rounded-lg">
      <div class="flex gap-x-4 overflow-x-auto">
        <button 
          v-for="(image, index) in images" 
          :key="image.slug" 
          @click="emit('select', index)" 
          :class="[
            'relative flex-shrink-0 w-24 h-16 rounded-md overflow-hidden transition-all',
            currentIndex === index
              ? 'border border-white/75'
              : 'opacity-60 hover:opacity-100'
          ]"
        >
          <img :src="`/images/${image.slug}/download`" :alt="sceneName" class="w-full h-full object-cover" />
        </button>
      </div>
    </div>
  </div>
</template>