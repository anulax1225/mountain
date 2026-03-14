<script setup>
    import { ref, watch } from 'vue'
    import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
    import { Input } from '@/components/ui/input'
    import { Label } from '@/components/ui/label'
    import { Button } from '@/components/ui/button'
    import { Download, Trash2, Navigation } from 'lucide-vue-next'
    import owl from '@/owl-sdk.js'
    import { useDateTime } from '@/composables/useDateTime'
    import { useFileSize } from '@/composables/useFileSize'
    import { useImagePath } from '@/composables/useImagePath'
    import { useConfirm } from '@/composables/useConfirm'
    import { useApiError } from '@/composables/useApiError'
    import DropzoneUpload from '@/components/dashboard/scene/DropzoneUpload.vue'
    import AppImage from '@/components/AppImage.vue'

    const props = defineProps({
      open: Boolean,
      image: Object,
      sceneName: String,
      canEdit: {
        type: Boolean,
        default: false
      }
    })

    const emit = defineEmits(['update:open', 'download', 'delete', 'image-replaced'])

    const imageName = ref('')
    const saving = ref(false)
    const replacementFile = ref(null)
    const isReplacing = ref(false)

    const { formatDateTime } = useDateTime()
    const { formatBytes } = useFileSize()
    const { getImagePreview } = useImagePath()
    const { confirmAction } = useConfirm()
    const { handleError } = useApiError()

    watch(() => props.image, (newImage) => {
      if (newImage) {
        imageName.value = newImage.name || ''
      }
    }, { immediate: true })

    // Reset replacement state when sheet closes
    watch(() => props.open, (newVal) => {
      if (!newVal) {
        replacementFile.value = null
        isReplacing.value = false
      }
    })

    const saveName = async () => {
      if (!props.image) return

      try {
        saving.value = true
        await owl.images.updateName(props.image.slug, imageName.value)
        emit('update:open', false)
        window.location.reload()
      } catch (error) {
        console.error('Failed to update image name:', error)
      } finally {
        saving.value = false
      }
    }

    const handleFileSelected = (file) => {
      replacementFile.value = file
    }

    const confirmReplacement = async () => {
      if (!replacementFile.value || !props.image) return

      const confirmed = await confirmAction('replace', 'cette image')
      if (!confirmed) {
        replacementFile.value = null
        return
      }

      try {
        isReplacing.value = true
        await owl.images.update(props.image.slug, replacementFile.value)

        emit('update:open', false)
        emit('image-replaced', props.image.slug)
      } catch (error) {
        handleError(error, { context: 'Replacing image', showToast: true })
      } finally {
        isReplacing.value = false
        replacementFile.value = null
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
            <div class="relative bg-muted rounded-lg aspect-video overflow-hidden">
              <AppImage
                :src="getImagePreview(image)"
                :alt="image.name || sceneName"
                class="w-full h-full object-cover"
              />
            </div>

            <form v-if="canEdit" @submit.prevent="saveName" class="space-y-4">
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
                <p class="font-medium text-sm text-foreground">Taille du fichier</p>
                <p class="text-muted-foreground text-sm">{{ formatBytes(image.size) }}</p>
              </div>

              <div>
                <p class="font-medium text-sm text-foreground">Date de création</p>
                <p class="text-muted-foreground text-sm">{{ formatDateTime(image.created_at) }}</p>
              </div>

              <div>
                <p class="font-medium text-sm text-foreground">Points d'accès</p>
                <div class="flex items-center gap-1 text-muted-foreground text-sm">
                  <Navigation class="w-4 h-4" />
                  <span>{{ image.hotspots_from?.length || 0 }} point(s) d'accès depuis cette image</span>
                </div>
              </div>
            </div>

            <div v-if="canEdit" class="space-y-4 border-t border-border pt-4">
              <div>
                <p class="font-medium text-sm text-foreground mb-2">
                  Remplacer l'image
                </p>
                <p class="text-xs text-muted-foreground mb-3">
                  Le fichier de l'image sera remplacé. Les points d'accès et stickers seront conservés.
                </p>

                <DropzoneUpload
                  :multiple="false"
                  mode="select"
                  accept="image/jpeg,image/png"
                  allowed-formats="JPG, PNG"
                  :disabled="isReplacing"
                  @file-selected="handleFileSelected"
                />

                <Button
                  v-if="replacementFile"
                  @click="confirmReplacement"
                  :disabled="isReplacing"
                  class="w-full mt-3"
                >
                  {{ isReplacing ? 'Remplacement...' : 'Confirmer le remplacement' }}
                </Button>
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
                v-if="canEdit"
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
