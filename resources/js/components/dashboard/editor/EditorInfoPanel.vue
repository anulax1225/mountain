<script setup>
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Info } from 'lucide-vue-next'

defineProps({
  currentImage: Object,
  show: Boolean
})

const formatFileSize = (bytes) => {
  if (!bytes) return '0 MB'
  return Math.round(bytes / 1024 / 1024 * 100) / 100 + ' MB'
}
</script>

<template>
  <div v-if="show && currentImage" class="top-20 right-4 absolute w-72">
    <Card class="bg-black/50 dark:bg-black/70 backdrop-blur-md border-white/20 dark:border-white/10">
      <CardContent class="space-y-4 pt-6 text-white">
        <div>
          <h3 class="mb-3 font-semibold">Image actuelle</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-white/60">Taille:</span>
              <span class="font-medium">{{ formatFileSize(currentImage.size) }}</span>
            </div>
          </div>
        </div>

        <div class="pt-4 border-white/20 dark:border-white/10 border-t">
          <h3 class="mb-3 font-semibold">Points d'accès</h3>
          <div class="flex flex-col justify-center items-center bg-white/5 py-8 rounded-lg">
            <Info class="mb-2 w-8 h-8 text-white/40" />
            <p class="text-white/60 text-xs text-center">Aucun point d'accès</p>
          </div>
        </div>

        <div class="pt-4 border-white/20 dark:border-white/10 border-t">
          <h3 class="mb-3 font-semibold">Contrôles</h3>
          <div class="space-y-2 text-white/60 text-xs">
            <div class="flex items-center gap-2">
              <div class="bg-white/10 px-2 py-1 rounded font-mono">Clic + Glisser</div>
              <span>Rotation</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="bg-white/10 px-2 py-1 rounded font-mono">Molette</div>
              <span>Zoom</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>