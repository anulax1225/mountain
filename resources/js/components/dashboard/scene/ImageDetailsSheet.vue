<script setup>
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Download, Trash2 } from 'lucide-vue-next'

defineProps({
  open: Boolean,
  image: Object,
  sceneName: String
})

const emit = defineEmits(['update:open', 'download', 'delete'])

const formatFileSize = (bytes) => {
  if (!bytes) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const handleDelete = () => {
  emit('delete', image.slug)
  emit('update:open', false)
}
</script>

<template>
  <Sheet :open="open" @update:open="emit('update:open', $event)">
    <SheetContent side="right" class="px-0 w-full sm:max-w-4xl">
      <SheetHeader class="px-6">
        <SheetTitle>Détails de l'image</SheetTitle>
        <SheetDescription v-if="image">
          {{ formatFileSize(image.size) }} • Créé le {{ new Date(image.created_at).toLocaleDateString() }} • 0 point d'accès
        </SheetDescription>
      </SheetHeader>
      <Separator class="my-4" />
      <div class="px-6 pb-6 max-h-[calc(100vh-120px)] overflow-auto">
        <img 
          v-if="image"
          :src="`/storage/${image.path}`" 
          :alt="sceneName"
          class="rounded-lg w-full"
        />
      </div>
      <div class="flex gap-2 px-6 pb-6">
        <Button 
          variant="outline" 
          class="flex-1"
          @click="emit('download', image.slug, image.path)"
        >
          <Download class="mr-2 w-4 h-4" />
          Télécharger
        </Button>
        <Button 
          variant="destructive" 
          @click="handleDelete"
        >
          <Trash2 class="mr-2 w-4 h-4" />
          Supprimer
        </Button>
      </div>
    </SheetContent>
  </Sheet>
</template>