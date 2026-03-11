<script setup>
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Check, Loader2, X } from 'lucide-vue-next'
import DropzoneUpload from '@/components/dashboard/scene/DropzoneUpload.vue'
import { useChunkedUpload } from '@/composables/useChunkedUpload'
import { UPLOAD } from '@/lib/editorConstants.js'

const props = defineProps({
  open: Boolean,
  sceneSlug: String,
})

const emit = defineEmits(['update:open', 'upload-complete'])

const {
  files,
  isUploading,
  isSubmitting,
  overallProgress,
  readyCount,
  completedCount,
  canSubmit,
  addFiles,
  removeFile,
  retryFile,
  submitAll,
  abortAll,
  reset,
} = useChunkedUpload()

const handleSubmit = async () => {
  const result = await submitAll(props.sceneSlug)
  if (result.success) {
    emit('upload-complete', result)
    close()
  }
}

const close = () => {
  if (isUploading.value) {
    abortAll()
  }
  reset()
  emit('update:open', false)
}

const handleOpenChange = (open) => {
  if (!open) {
    close()
  } else {
    emit('update:open', true)
  }
}
</script>

<template>
  <Sheet :open="open" @update:open="handleOpenChange">
    <SheetContent class="flex flex-col px-6">
      <SheetHeader>
        <SheetTitle>Ajouter des images</SheetTitle>
        <SheetDescription>
          Téléverser des images panoramiques
        </SheetDescription>
      </SheetHeader>

      <div class="flex-1 mt-6 overflow-y-auto">
        <DropzoneUpload
          :files="files"
          :uploading="isUploading"
          :overall-progress="overallProgress"
          :completed-count="completedCount"
          :max-file-size="UPLOAD.MAX_FILE_SIZE"
          @files-added="addFiles"
          @file-removed="removeFile"
          @retry="retryFile"
        />
      </div>

      <SheetFooter v-if="files.length > 0" class="mt-4 flex gap-2">
        <Button
          variant="outline"
          class="flex-1"
          @click="close"
        >
          <X class="mr-2 w-4 h-4" />
          Annuler
        </Button>
        <Button
          class="flex-1"
          :disabled="!canSubmit"
          @click="handleSubmit"
        >
          <Loader2 v-if="isSubmitting" class="mr-2 w-4 h-4 animate-spin" />
          <Check v-else class="mr-2 w-4 h-4" />
          {{ isSubmitting ? 'Enregistrement...' : `Enregistrer ${readyCount} image(s)` }}
        </Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>