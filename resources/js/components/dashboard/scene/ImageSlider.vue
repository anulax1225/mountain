<script setup>
import { computed } from 'vue'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Trash2, Maximize2, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useFileSize } from '@/composables/useFileSize'
import { useImagePath } from '@/composables/useImagePath'

const props = defineProps({
  images: Array,
  currentIndex: Number,
  sceneName: String,
  canEdit: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:currentIndex', 'download', 'delete', 'fullscreen'])

const currentImage = computed(() => props.images[props.currentIndex])

const { formatBytes } = useFileSize()
const { getImageUrl } = useImagePath()

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
  <Card class="overflow-hidden">
    <CardContent class="relative p-0">
      <div class="relative bg-zinc-900 aspect-video">
        <img
          :src="getImageUrl(currentImage.path)"
          :alt="sceneName"
          class="w-full h-full object-contain"
        />

        <Button
          variant="secondary"
          size="icon"
          class="top-4 right-4 absolute"
          @click="emit('fullscreen')"
        >
          <Maximize2 class="w-4 h-4" />
        </Button>

        <Button
          v-if="currentIndex > 0"
          variant="secondary"
          size="icon"
          class="top-1/2 left-4 absolute -translate-y-1/2"
          @click="prevSlide"
        >
          <ChevronLeft class="w-5 h-5" />
        </Button>
        <Button
          v-if="currentIndex < images.length - 1"
          variant="secondary"
          size="icon"
          class="top-1/2 right-4 absolute -translate-y-1/2"
          @click="nextSlide"
        >
          <ChevronRight class="w-5 h-5" />
        </Button>

        <div class="bottom-4 left-1/2 absolute bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs -translate-x-1/2">
          {{ currentIndex + 1 }} / {{ images.length }}
        </div>
      </div>

      <div class="flex justify-between items-center gap-4 p-4">
        <div class="flex-1 min-w-0">
          <p class="text-zinc-500 dark:text-zinc-400 text-sm">{{ formatBytes(currentImage.size) }}</p>
          <p class="text-zinc-400 dark:text-zinc-500 text-xs">0 point d'accès</p>
        </div>
        <div class="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            @click="emit('download', currentImage.slug, currentImage.path)"
          >
            <Download class="mr-2 w-4 h-4" />
            Télécharger
          </Button>
          <Button
            v-if="canEdit"
            variant="ghost"
            size="icon"
            @click="emit('delete', currentImage.slug)"
          >
            <Trash2 class="w-4 h-4 text-red-600 dark:text-red-400" />
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
</template>