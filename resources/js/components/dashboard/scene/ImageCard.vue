<script setup>
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Trash2 } from 'lucide-vue-next'

defineProps({
  image: Object,
  sceneName: String
})

const emit = defineEmits(['view', 'download', 'delete'])

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}
</script>

<template>
  <Card class="hover:shadow-lg overflow-hidden transition-shadow cursor-pointer">
    <div class="relative aspect-video" @click="emit('view', image)">
      <img 
        :src="`/images/${image.slug}/download`" 
        :alt="sceneName"
        class="w-full h-full object-cover"
      />
    </div>
    <CardContent class="flex justify-between items-center gap-2 pt-4">
      <div class="flex-1 min-w-0">
        <p class="text-zinc-500 dark:text-zinc-400 text-sm">{{ formatFileSize(image.size) }}</p>
        <p class="text-zinc-400 dark:text-zinc-500 text-xs">0 point d'accès</p>
      </div>
      <div class="flex items-center gap-1">
        <Button 
          variant="ghost" 
          size="icon-sm"
          @click.stop="emit('download', image.slug, image.path)"
        >
          <Download class="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon-sm"
          @click.stop="emit('delete', image.slug)"
        >
          <Trash2 class="w-4 h-4 text-red-600 dark:text-red-400" />
        </Button>
      </div>
    </CardContent>
  </Card>
</template>