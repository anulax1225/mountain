<script setup>
import { Link } from '@inertiajs/vue3'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Info, Maximize2 } from 'lucide-vue-next'

defineProps({
  sceneName: String,
  sceneSlug: String,
  showInfo: Boolean,
  showThumbnails: Boolean
})

const emit = defineEmits(['toggle-info', 'toggle-thumbnails', 'toggle-fullscreen'])
</script>

<template>
  <div class="top-0 right-0 left-0 absolute bg-gradient-to-b from-black/50 to-transparent backdrop-blur-sm p-4">
    <div class="flex justify-between items-center">
      <div class="flex items-center gap-3">
        <Link :href="`/dashboard/scenes/${sceneSlug}`">
          <Button variant="secondary" size="icon-sm">
            <ArrowLeft class="w-4 h-4" />
          </Button>
        </Link>
        <div class="text-white">
          <h1 class="font-semibold text-sm">{{ sceneName }}</h1>
          <p class="text-white/60 text-xs">Éditeur 360°</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <Button variant="secondary" size="sm" @click="emit('toggle-thumbnails')">
          {{ showThumbnails ? 'Masquer' : 'Afficher' }} miniatures
        </Button>
        <Button variant="secondary" size="sm" @click="emit('toggle-info')">
          <Info class="mr-2 w-4 h-4" />
          {{ showInfo ? 'Masquer' : 'Afficher' }} infos
        </Button>
        <Button variant="secondary" size="icon-sm" @click="emit('toggle-fullscreen')">
          <Maximize2 class="w-4 h-4" />
        </Button>
      </div>
    </div>
  </div>
</template>