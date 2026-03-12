<script setup>
import { ref, watch, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { X, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useImagePath } from '@/composables/useImagePath'

const props = defineProps({
  open: Boolean,
  images: Array,
  currentIndex: Number,
  sceneName: String
})

const emit = defineEmits(['update:open', 'update:currentIndex'])

const { getImageUrl, getImagePreview } = useImagePath()

const fullResLoaded = ref(false)

const currentImage = computed(() => props.images?.[props.currentIndex])

const displaySrc = computed(() => {
  if (!currentImage.value) return null
  if (fullResLoaded.value) {
    return getImageUrl(currentImage.value.slug)
  }
  return getImagePreview(currentImage.value)
})

watch([() => props.currentIndex, () => props.open], () => {
  fullResLoaded.value = false

  if (!props.open || !currentImage.value) return

  const fullUrl = getImageUrl(currentImage.value.slug)
  const img = new Image()
  img.onload = () => {
    fullResLoaded.value = true
  }
  img.src = fullUrl
}, { immediate: true })

const close = () => emit('update:open', false)

const nextSlide = () => {
  if (props.currentIndex < props.images.length - 1) {
    emit('update:currentIndex', props.currentIndex + 1)
  }
}

const prevSlide = () => {
  if (props.currentIndex > 0) {
    emit('update:currentIndex', props.currentIndex - 1)
  }
}
</script>

<template>
  <div
    v-if="open && currentImage"
    class="z-[100] fixed inset-0 bg-black"
  >
    <Button
      variant="ghost"
      size="icon"
      class="top-4 right-4 absolute hover:bg-white/20 text-white"
      @click="close"
    >
      <X class="w-5 h-5" />
    </Button>

    <Button
      v-if="currentIndex > 0"
      variant="ghost"
      size="icon"
      class="top-1/2 left-4 absolute hover:bg-white/20 text-white -translate-y-1/2"
      @click="prevSlide"
    >
      <ChevronLeft class="w-6 h-6" />
    </Button>
    <Button
      v-if="currentIndex < images.length - 1"
      variant="ghost"
      size="icon"
      class="top-1/2 right-4 absolute hover:bg-white/20 text-white -translate-y-1/2"
      @click="nextSlide"
    >
      <ChevronRight class="w-6 h-6" />
    </Button>

    <div class="flex justify-center items-center w-full h-full">
      <img
        :src="displaySrc"
        :alt="sceneName"
        class="max-w-full max-h-full object-contain transition-[filter] duration-300"
        :class="{ 'blur-sm': !fullResLoaded && currentImage.preview_path }"
      />
    </div>

    <div class="bottom-4 left-1/2 absolute bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white -translate-x-1/2">
      {{ currentIndex + 1 }} / {{ images.length }}
    </div>
  </div>
</template>
