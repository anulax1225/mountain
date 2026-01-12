<script setup>
import { computed } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'

const props = defineProps({
  open: Boolean,
  allScenes: Array,
  currentImageId: Number
})

const emit = defineEmits(['update:open', 'select'])

const groupedImages = computed(() => {
  if (!props.allScenes) return []
  
  return props.allScenes.map(scene => ({
    scene: scene,
    images: scene.images || []
  })).filter(group => group.images.length > 0)
})

const selectImage = (image) => {
  if (image.id === props.currentImageId) return
  emit('select', image)
  emit('update:open', false)
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-4xl">
      <DialogHeader>
        <DialogTitle>Sélectionner l'image de destination</DialogTitle>
        <DialogDescription>
          Choisissez l'image vers laquelle ce point d'accès redirigera
        </DialogDescription>
      </DialogHeader>

      <ScrollArea class="pr-4 max-h-[60vh]">
        <div class="space-y-6">
          <div 
            v-for="group in groupedImages" 
            :key="group.scene.slug"
            class="space-y-3"
          >
            <div class="flex items-center gap-2">
              <h3 class="font-semibold text-zinc-900 dark:text-zinc-100">
                {{ group.scene.name || 'Sans nom' }}
              </h3>
              <Badge variant="secondary">
                {{ group.images.length }} image(s)
              </Badge>
            </div>

            <div class="gap-4 grid grid-cols-3">
              <button
                v-for="image in group.images"
                :key="image.id"
                @click="selectImage(image)"
                :disabled="image.id === currentImageId"
                :class="[
                  'relative aspect-video rounded-lg overflow-hidden transition-all',
                  image.id === currentImageId
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:ring-2 hover:ring-purple-500 dark:hover:ring-purple-400 hover:scale-105 cursor-pointer'
                ]"
              >
                <img 
                  :src="`/images/${image.slug}/download`" 
                  :alt="group.scene.name"
                  class="w-full h-full object-cover"
                />
                <div 
                  v-if="image.id === currentImageId"
                  class="absolute inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm"
                >
                  <Badge variant="secondary">Image actuelle</Badge>
                </div>
              </button>
            </div>
          </div>

          <div v-if="groupedImages.length === 0" class="py-12 text-center">
            <p class="text-zinc-500 dark:text-zinc-400">Aucune image disponible</p>
          </div>
        </div>
      </ScrollArea>
    </DialogContent>
  </Dialog>
</template>