<script setup>
import { ref, computed } from 'vue'
import { ImagePlus, X, RotateCcw } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import AppImage from '@/components/AppImage.vue'
import { formatBytes } from '@/composables/useFileSize'

const props = defineProps({
  // Multi-file mode: external files array from useChunkedUpload
  files: {
    type: Array,
    default: () => []
  },
  uploading: Boolean,
  overallProgress: {
    type: Number,
    default: 0
  },
  completedCount: {
    type: Number,
    default: 0
  },
  accept: {
    type: String,
    default: 'image/*'
  },
  multiple: {
    type: Boolean,
    default: true
  },
  disabled: Boolean,
  maxFileSize: {
    type: Number,
    default: 0
  },
  allowedFormats: {
    type: String,
    default: 'JPG, PNG, WebP'
  },
  // 'upload' = emits files-added for S3 upload, 'select' = manages file locally
  mode: {
    type: String,
    default: 'upload',
    validator: (v) => ['upload', 'select'].includes(v)
  },
})

const emit = defineEmits(['files-added', 'file-removed', 'retry', 'file-selected'])

const isDragOver = ref(false)
const fileInput = ref(null)

// Internal state for select mode (single file)
const selectedFile = ref(null)
const selectedPreview = ref(null)
const selectedError = ref(null)

const isSingle = computed(() => !props.multiple)
const isSelectMode = computed(() => props.mode === 'select')

// In single select mode, check if we have a file
const hasSingleFile = computed(() => isSingle.value && isSelectMode.value && selectedFile.value)
// In single upload mode, check from external files prop
const singleEntry = computed(() => isSingle.value && !isSelectMode.value && props.files.length > 0 ? props.files[0] : null)

const validateSelectFile = (file) => {
  if (props.maxFileSize > 0 && file.size > props.maxFileSize) {
    const maxMB = Math.round(props.maxFileSize / (1024 * 1024))
    return `Fichier trop volumineux. Taille maximale : ${maxMB} Mo`
  }
  return null
}

const handleSelectFile = (file) => {
  const error = validateSelectFile(file)
  if (error) {
    selectedError.value = error
    selectedFile.value = null
    selectedPreview.value = null
    emit('file-selected', null)
    return
  }

  selectedError.value = null
  selectedFile.value = file
  if (selectedPreview.value) {
    URL.revokeObjectURL(selectedPreview.value)
  }
  selectedPreview.value = file.type.startsWith('image/') ? URL.createObjectURL(file) : null
  emit('file-selected', file)
}

const clearSelectedFile = () => {
  if (selectedPreview.value) {
    URL.revokeObjectURL(selectedPreview.value)
  }
  selectedFile.value = null
  selectedPreview.value = null
  selectedError.value = null
  emit('file-selected', null)
}

const onDragOver = (e) => {
  e.preventDefault()
  if (!props.disabled && !props.uploading) {
    isDragOver.value = true
  }
}

const onDragLeave = () => {
  isDragOver.value = false
}

const onDrop = (e) => {
  e.preventDefault()
  isDragOver.value = false
  if (props.disabled || props.uploading) return

  const droppedFiles = Array.from(e.dataTransfer.files)
  if (droppedFiles.length === 0) return

  if (isSingle.value) {
    if (isSelectMode.value) {
      handleSelectFile(droppedFiles[0])
    } else {
      emit('files-added', [droppedFiles[0]])
    }
  } else {
    emit('files-added', droppedFiles)
  }
}

const onFileSelect = (e) => {
  const selectedFiles = Array.from(e.target.files)
  if (selectedFiles.length === 0) return

  if (isSingle.value) {
    if (isSelectMode.value) {
      handleSelectFile(selectedFiles[0])
    } else {
      emit('files-added', [selectedFiles[0]])
    }
  } else {
    emit('files-added', selectedFiles)
  }
  e.target.value = ''
}

const openFilePicker = () => {
  if (!props.disabled && !props.uploading) {
    fileInput.value?.click()
  }
}

const statusBadge = (status) => {
  switch (status) {
    case 'uploading': return { label: 'Envoi...', variant: 'default' }
    case 'ready': return { label: 'Prêt', variant: 'secondary' }
    case 'submitting': return { label: 'Enregistrement...', variant: 'default' }
    case 'complete': return { label: 'Terminé', variant: 'outline' }
    case 'error': return { label: 'Erreur', variant: 'destructive' }
    default: return { label: 'En attente', variant: 'secondary' }
  }
}

const maxSizeMB = props.maxFileSize > 0
  ? Math.round(props.maxFileSize / (1024 * 1024))
  : null
</script>

<template>
  <div class="flex flex-col gap-4">
    <input
      ref="fileInput"
      type="file"
      :accept="accept"
      :multiple="multiple"
      class="hidden"
      @change="onFileSelect"
    />

    <!-- ==================== SINGLE FILE MODE ==================== -->
    <template v-if="isSingle">
      <!-- Single select mode: file selected preview -->
      <template v-if="isSelectMode && hasSingleFile">
        <div class="relative rounded-xl overflow-hidden border border-border">
          <AppImage
            v-if="selectedPreview"
            :src="selectedPreview"
            :alt="selectedFile.name"
            class="w-full h-32 object-cover"
          />
          <div v-else class="w-full h-32 bg-muted flex items-center justify-center">
            <ImagePlus class="w-8 h-8 text-muted-foreground/30" />
          </div>

          <!-- Overlay info -->
          <div class="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent px-3 py-2">
            <p class="text-white text-xs truncate">{{ selectedFile.name }}</p>
            <p class="text-white/70 text-[10px]">{{ formatBytes(selectedFile.size) }}</p>
          </div>

          <!-- Remove button -->
          <button
            type="button"
            class="absolute top-2 right-2 p-1 rounded-md bg-black/40 text-white hover:bg-black/60 transition-colors"
            title="Retirer"
            @click="clearSelectedFile"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>
      </template>

      <!-- Single upload mode: file in progress/ready -->
      <template v-else-if="!isSelectMode && singleEntry">
        <div
          class="relative rounded-xl overflow-hidden border transition-colors"
          :class="{
            'border-destructive/20': singleEntry.status === 'error',
            'border-green-500/20': singleEntry.status === 'ready' || singleEntry.status === 'complete',
            'border-border': !['error', 'ready', 'complete'].includes(singleEntry.status),
          }"
        >
          <AppImage
            v-if="singleEntry.thumbnailUrl"
            :src="singleEntry.thumbnailUrl"
            :alt="singleEntry.file.name"
            class="w-full h-32 object-cover"
          />
          <div v-else class="w-full h-32 bg-muted flex items-center justify-center">
            <ImagePlus class="w-8 h-8 text-muted-foreground/30" />
          </div>

          <!-- Progress bar overlay -->
          <div v-if="singleEntry.status === 'uploading'" class="absolute inset-x-0 bottom-0">
            <div class="bg-muted/80 h-1.5">
              <div
                class="bg-primary h-full transition-all duration-500 ease-out"
                :style="{ width: `${singleEntry.progress}%` }"
              />
            </div>
          </div>

          <!-- Overlay info -->
          <div class="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent px-3 py-2"
            :class="singleEntry.status === 'uploading' && 'pb-3.5'"
          >
            <div class="flex items-center gap-2">
              <p class="text-white text-xs truncate flex-1">{{ singleEntry.file.name }}</p>
              <Badge :variant="statusBadge(singleEntry.status).variant" class="text-[10px]">
                {{ statusBadge(singleEntry.status).label }}
              </Badge>
            </div>
            <p class="text-white/70 text-[10px]">{{ formatBytes(singleEntry.file.size) }}</p>
          </div>

          <!-- Remove button -->
          <button
            v-if="!['uploading', 'submitting', 'complete'].includes(singleEntry.status)"
            type="button"
            class="absolute top-2 right-2 p-1 rounded-md bg-black/40 text-white hover:bg-black/60 transition-colors"
            title="Retirer"
            @click.stop="emit('file-removed', singleEntry.id)"
          >
            <X class="w-3.5 h-3.5" />
          </button>

          <!-- Retry button -->
          <button
            v-if="singleEntry.status === 'error'"
            type="button"
            class="absolute top-2 left-2 p-1 rounded-md bg-black/40 text-white hover:bg-black/60 transition-colors"
            title="Réessayer"
            @click.stop="emit('retry', singleEntry.id)"
          >
            <RotateCcw class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Error message below card -->
        <p v-if="singleEntry.error" class="text-destructive text-xs">
          {{ singleEntry.error }}
        </p>
      </template>

      <!-- Single mode: empty dropzone (compact) -->
      <template v-else>
        <div
          class="group relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer"
          :class="[
            isDragOver
              ? 'border-primary bg-primary/10 scale-[1.01]'
              : 'border-border hover:border-primary/40 hover:bg-muted/50',
            disabled && 'opacity-50 cursor-not-allowed pointer-events-none'
          ]"
          @dragover="onDragOver"
          @dragleave="onDragLeave"
          @drop="onDrop"
          @click="openFilePicker"
        >
          <div
            class="mx-auto mb-2 flex items-center justify-center w-10 h-10 rounded-full bg-muted transition-colors duration-200"
            :class="isDragOver && 'bg-primary/20'"
          >
            <ImagePlus
              class="w-5 h-5 text-muted-foreground transition-colors duration-200"
              :class="isDragOver && 'text-primary'"
            />
          </div>
          <p class="font-semibold text-foreground text-sm">
            Glissez une image ici
          </p>
          <p class="mt-0.5 text-muted-foreground text-xs">
            ou cliquez pour parcourir
          </p>
          <p v-if="allowedFormats" class="mt-2 text-muted-foreground/60 text-xs">
            Formats : {{ allowedFormats }}
            <template v-if="maxSizeMB"> · Max {{ maxSizeMB }} Mo</template>
          </p>
        </div>

        <!-- Error for select mode validation -->
        <p v-if="isSelectMode && selectedError" class="text-destructive text-xs">
          {{ selectedError }}
        </p>
      </template>
    </template>

    <!-- ==================== MULTI FILE MODE ==================== -->
    <template v-else>
      <!-- Drop zone area -->
      <div
        class="group relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200 cursor-pointer"
        :class="[
          isDragOver
            ? 'border-primary bg-primary/10 scale-[1.01]'
            : 'border-border hover:border-primary/40 hover:bg-muted/50',
          (disabled || uploading) && 'opacity-50 cursor-not-allowed pointer-events-none'
        ]"
        @dragover="onDragOver"
        @dragleave="onDragLeave"
        @drop="onDrop"
        @click="openFilePicker"
      >
        <div
          class="mx-auto mb-4 flex items-center justify-center w-14 h-14 rounded-full bg-muted transition-colors duration-200"
          :class="isDragOver && 'bg-primary/20'"
        >
          <ImagePlus
            class="w-7 h-7 text-muted-foreground transition-colors duration-200"
            :class="isDragOver && 'text-primary'"
          />
        </div>
        <p class="font-semibold text-foreground text-sm">
          Glissez vos images ici
        </p>
        <p class="mt-1 text-muted-foreground text-xs">
          ou cliquez pour parcourir
        </p>
        <p class="mt-3 text-muted-foreground/60 text-xs">
          Formats : {{ allowedFormats }}
          <template v-if="maxSizeMB"> · Max {{ maxSizeMB }} Mo</template>
        </p>
      </div>

      <!-- File list -->
      <div v-if="files.length > 0" class="flex flex-col gap-2">
        <!-- Summary bar -->
        <div class="flex items-center justify-between">
          <p class="font-medium text-foreground text-sm">
            <template v-if="uploading || completedCount > 0">
              {{ completedCount }}/{{ files.length }} image(s) téléversée(s)
            </template>
            <template v-else>
              {{ files.length }} fichier(s) sélectionné(s)
            </template>
          </p>
          <span v-if="uploading" class="text-muted-foreground text-xs font-medium">
            {{ overallProgress }}%
          </span>
        </div>

        <!-- Overall progress (during upload) -->
        <div v-if="uploading" class="bg-muted rounded-full w-full h-1.5 overflow-hidden">
          <div
            class="bg-primary rounded-full h-full transition-all duration-500 ease-out"
            :style="{ width: `${overallProgress}%` }"
          />
        </div>

        <!-- File entries -->
        <div class="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1">
          <TransitionGroup
            enter-active-class="transition-all duration-300 ease-out"
            leave-active-class="transition-all duration-200 ease-in"
            enter-from-class="opacity-0 translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-1"
          >
            <div
              v-for="entry in files"
              :key="entry.id"
              class="flex items-center gap-3 bg-muted/40 p-3 rounded-lg border border-transparent transition-colors"
              :class="{
                'border-destructive/20 bg-destructive/5': entry.status === 'error',
                'border-green-500/20 bg-green-500/5': entry.status === 'ready' || entry.status === 'complete',
              }"
            >
              <!-- Thumbnail -->
              <div class="shrink-0 w-10 h-10 rounded-md overflow-hidden bg-muted">
                <AppImage
                  v-if="entry.thumbnailUrl"
                  :src="entry.thumbnailUrl"
                  :alt="entry.file.name"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <ImagePlus class="w-4 h-4 text-muted-foreground/50" />
                </div>
              </div>

              <!-- File info + progress -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <p class="text-foreground text-sm truncate flex-1">{{ entry.file.name }}</p>
                  <Badge :variant="statusBadge(entry.status).variant" class="text-[10px]">
                    {{ statusBadge(entry.status).label }}
                  </Badge>
                </div>

                <div class="flex items-center gap-2 mt-1">
                  <span class="text-muted-foreground text-xs">
                    {{ formatBytes(entry.file.size) }}
                  </span>

                  <!-- Progress bar (during upload) -->
                  <template v-if="entry.status === 'uploading'">
                    <div class="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        class="bg-primary rounded-full h-full transition-all duration-500 ease-out"
                        :style="{ width: `${entry.progress}%` }"
                      />
                    </div>
                    <span class="text-muted-foreground text-xs font-medium w-8 text-right">
                      {{ entry.progress }}%
                    </span>
                  </template>
                </div>

                <!-- Error message -->
                <p v-if="entry.error" class="mt-1 text-destructive text-xs">
                  {{ entry.error }}
                </p>
              </div>

              <!-- Actions -->
              <div class="shrink-0 flex items-center gap-1">
                <!-- Retry button for errored files -->
                <button
                  v-if="entry.status === 'error'"
                  type="button"
                  class="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  title="Réessayer"
                  @click.stop="emit('retry', entry.id)"
                >
                  <RotateCcw class="w-3.5 h-3.5" />
                </button>

                <!-- Remove button -->
                <button
                  v-if="!['uploading', 'submitting', 'complete'].includes(entry.status)"
                  type="button"
                  class="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  title="Retirer"
                  @click.stop="emit('file-removed', entry.id)"
                >
                  <X class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </TransitionGroup>
        </div>
      </div>
    </template>
  </div>
</template>
