<script setup>
    import { ref, watch } from 'vue'
    import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
    import { Input } from '@/components/ui/input'
    import { Label } from '@/components/ui/label'
    import { Button } from '@/components/ui/button'
    import { Download, Trash2, Navigation } from 'lucide-vue-next'
    import owl from '@/owl-sdk.js'
    
    const props = defineProps({
      open: Boolean,
      image: Object,
      sceneName: String
    })
    
    const emit = defineEmits(['update:open', 'download', 'delete'])
    
    const imageName = ref('')
    const saving = ref(false)
    
    watch(() => props.image, (newImage) => {
      if (newImage) {
        imageName.value = newImage.name || ''
      }
    }, { immediate: true })
    
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
    }
    
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
                :src="`/images/${image.slug}/download`" 
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
                <p class="text-zinc-500 dark:text-zinc-400 text-sm">{{ formatFileSize(image.size) }}</p>
              </div>
              
              <div>
                <p class="font-medium text-sm text-zinc-700 dark:text-zinc-300">Date de création</p>
                <p class="text-zinc-500 dark:text-zinc-400 text-sm">{{ new Date(image.created_at).toLocaleString() }}</p>
              </div>
    
              <div>
                <p class="font-medium text-sm text-zinc-700 dark:text-zinc-300">Points d'accès</p>
                <div class="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 text-sm">
                  <Navigation class="w-4 h-4" />
                  <span>{{ image.hotspots_from?.length || 0 }} point(s) d'accès depuis cette image</span>
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