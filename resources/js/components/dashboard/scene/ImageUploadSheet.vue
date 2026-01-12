<script setup>
import { ref } from 'vue'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-vue-next'

const props = defineProps({
  open: Boolean,
  uploading: Boolean
})

const emit = defineEmits(['update:open', 'upload'])

const imageFiles = ref([])
const imageInput = ref(null)

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  imageFiles.value = files
}

const handleUpload = () => {
  emit('upload', imageFiles.value)
  imageFiles.value = []
  if (imageInput.value) {
    imageInput.value.value = ''
  }
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}
</script>

<template>
  <Sheet :open="open" @update:open="emit('update:open', $event)">
    <SheetContent class="px-6">
      <SheetHeader>
        <SheetTitle>Ajouter des images</SheetTitle>
        <SheetDescription>
          Téléverser des images panoramiques
        </SheetDescription>
      </SheetHeader>
      <form @submit.prevent="handleUpload" class="space-y-4 mt-6">
        <div class="space-y-2">
          <Label for="image-files">Images panoramiques (max 20 MB chacune)</Label>
          <Input 
            id="image-files" 
            ref="imageInput"
            type="file" 
            accept="image/*"
            multiple
            @change="handleFileSelect"
            required
          />
          <p class="text-zinc-500 dark:text-zinc-400 text-xs">Formats acceptés: JPG, PNG, WebP. Vous pouvez sélectionner plusieurs fichiers.</p>
          <div v-if="imageFiles.length > 0" class="space-y-1 pt-2">
            <p class="font-medium text-zinc-700 dark:text-zinc-300 text-sm">{{ imageFiles.length }} fichier(s) sélectionné(s):</p>
            <ul class="space-y-1">
              <li 
                v-for="(file, index) in imageFiles" 
                :key="index"
                class="text-zinc-600 dark:text-zinc-400 text-xs"
              >
                {{ file.name }} ({{ formatFileSize(file.size) }})
              </li>
            </ul>
          </div>
        </div>
        <Button 
          type="submit" 
          class="w-full" 
          :disabled="imageFiles.length === 0 || uploading"
        >
          <Upload class="mr-2 w-4 h-4" />
          {{ uploading ? 'Téléversement...' : `Téléverser ${imageFiles.length} image(s)` }}
        </Button>
      </form>
    </SheetContent>
  </Sheet>
</template>