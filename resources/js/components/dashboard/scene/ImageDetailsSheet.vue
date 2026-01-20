<script setup>
    import { ref, watch } from 'vue'
    import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
    import { Input } from '@/components/ui/input'
    import { Label } from '@/components/ui/label'
    import { Button } from '@/components/ui/button'
    import { Download, Trash2, Navigation, Upload } from 'lucide-vue-next'
    import owl from '@/owl-sdk.js'
    import { useDateTime } from '@/composables/useDateTime'
    import { useFileSize } from '@/composables/useFileSize'
    import { useImagePath } from '@/composables/useImagePath'
    import { useConfirm } from '@/composables/useConfirm'
    import { useApiError } from '@/composables/useApiError'
    import { useImageUpload } from '@/composables/useImageUpload'

    const props = defineProps({
      open: Boolean,
      image: Object,
      sceneName: String
    })

    const emit = defineEmits(['update:open', 'download', 'delete', 'image-replaced'])

    const imageName = ref('')
    const saving = ref(false)
    const replacementFile = ref(null)
    const replacementPreview = ref(null)
    const isReplacing = ref(false)
    const fileInputRef = ref(null)

    const { formatDateTime } = useDateTime()
    const { formatBytes } = useFileSize()
    const { getImageUrl } = useImagePath()
    const { confirmAction } = useConfirm()
    const { handleError } = useApiError()
    const upload = useImageUpload({
        maxFileSize: 50 * 1024 * 1024, // 50MB
        allowedTypes: ['image/jpeg', 'image/png'],
        validateEquirectangular: true
    })

    watch(() => props.image, (newImage) => {
      if (newImage) {
        imageName.value = newImage.name || ''
      }
    }, { immediate: true })

    const saveName = async () => {
      if (!props.image) return

      try {
        saving.value = true
        await owl.images.updateName(props.image.slug, imageName.value)
        emit('update:open', false)
        // Trigger reload
        window.location.reload()
      } catch (error) {
        console.error('Failed to update image name:', error)
      } finally {
        saving.value = false
      }
    }

    const handleFileSelect = async (event) => {
      const file = event.target.files[0]
      if (!file) return

      // Validate file
      const validation = await upload.validateFiles([file])
      if (validation.errors.length > 0) {
        const error = validation.errors[0]
        handleError({ message: error.message }, { showToast: true })
        return
      }

      // Create preview
      replacementFile.value = file
      const reader = new FileReader()
      reader.onload = (e) => {
        replacementPreview.value = e.target.result

        // Get image dimensions
        const img = new Image()
        img.onload = () => {
          console.log('Replacement image dimensions:', img.width, 'x', img.height)
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    }

    const confirmReplacement = async () => {
      if (!replacementFile.value || !props.image) return

      const confirmed = await confirmAction('replace', 'cette image')
      if (!confirmed) {
        cancelReplacement()
        return
      }

      try {
        isReplacing.value = true
        await owl.images.update(props.image.slug, replacementFile.value)

        // Emit event to parent to reload scene
        emit('update:open', false)
        emit('image-replaced', props.image.slug)
      } catch (error) {
        handleError(error, { context: 'Replacing image', showToast: true })
      } finally {
        isReplacing.value = false
        cancelReplacement()
      }
    }

    const cancelReplacement = () => {
      replacementFile.value = null
      replacementPreview.value = null
      if (fileInputRef.value) {
        fileInputRef.value.value = ''
      }
    }
    </script>
    
    <template>
      <Sheet :open="open" @update:open="emit('update:open', $event)">
        <SheetContent class="px-6">
          <SheetHeader>
            <SheetTitle>Détails de l'image</SheetTitle>
            <SheetDescription>
              Informations et actions pour cette image
            </SheetDescription>
          </SheetHeader>
          
          <div v-if="image" class="space-y-6 mt-6">
            <div class="relative bg-zinc-100 dark:bg-zinc-800 rounded-lg aspect-video overflow-hidden">
              <img
                :src="getImageUrl(image.slug)"
                :alt="image.name || sceneName"
                class="w-full h-full object-cover"
              />
            </div>

            <form @submit.prevent="saveName" class="space-y-4">
              <div class="space-y-2">
                <Label for="image-name">Nom de l'image</Label>
                <Input
                  id="image-name"
                  v-model="imageName"
                  placeholder="Entrez un nom pour l'image"
                />
              </div>
              <Button
                type="submit"
                class="w-full"
                :disabled="saving"
              >
                {{ saving ? 'Enregistrement...' : 'Enregistrer le nom' }}
              </Button>
            </form>

            <div class="space-y-3">
              <div>
                <p class="font-medium text-sm text-zinc-700 dark:text-zinc-300">Taille du fichier</p>
                <p class="text-zinc-500 dark:text-zinc-400 text-sm">{{ formatBytes(image.size) }}</p>
              </div>

              <div>
                <p class="font-medium text-sm text-zinc-700 dark:text-zinc-300">Date de création</p>
                <p class="text-zinc-500 dark:text-zinc-400 text-sm">{{ formatDateTime(image.created_at) }}</p>
              </div>

              <div>
                <p class="font-medium text-sm text-zinc-700 dark:text-zinc-300">Points d'accès</p>
                <div class="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 text-sm">
                  <Navigation class="w-4 h-4" />
                  <span>{{ image.hotspots_from?.length || 0 }} point(s) d'accès depuis cette image</span>
                </div>
              </div>
            </div>

            <div class="space-y-4 border-t border-zinc-200 dark:border-zinc-800 pt-4">
              <div>
                <p class="font-medium text-sm text-zinc-700 dark:text-zinc-300 mb-2">
                  Remplacer l'image
                </p>
                <p class="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
                  Le fichier de l'image sera remplacé. Les points d'accès et stickers seront conservés.
                </p>

                <input
                  ref="fileInputRef"
                  type="file"
                  accept="image/jpeg,image/png"
                  @change="handleFileSelect"
                  class="hidden"
                />

                <div v-if="!replacementPreview">
                  <Button
                    @click="fileInputRef?.click()"
                    variant="outline"
                    class="w-full"
                  >
                    <Upload class="mr-2 w-4 h-4" />
                    Choisir une nouvelle image
                  </Button>
                </div>

                <div v-else class="space-y-3">
                  <div class="relative bg-zinc-100 dark:bg-zinc-800 rounded-lg aspect-video overflow-hidden">
                    <img
                      :src="replacementPreview"
                      alt="Prévisualisation"
                      class="w-full h-full object-cover"
                    />
                  </div>

                  <div class="flex gap-2">
                    <Button
                      @click="confirmReplacement"
                      :disabled="isReplacing"
                      class="flex-1"
                    >
                      {{ isReplacing ? 'Remplacement...' : 'Confirmer le remplacement' }}
                    </Button>
                    <Button
                      @click="cancelReplacement"
                      variant="outline"
                      :disabled="isReplacing"
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex flex-col gap-2 pt-4">
              <Button
                variant="outline"
                @click="emit('download', image.slug, image.path)"
                class="w-full"
              >
                <Download class="mr-2 w-4 h-4" />
                Télécharger l'image
              </Button>
              <Button
                variant="outline"
                @click="emit('delete', image.slug)"
                class="w-full text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
              >
                <Trash2 class="mr-2 w-4 h-4" />
                Supprimer l'image
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </template>