<script setup>
    import { Card, CardContent } from '@/components/ui/card'
    import { Button } from '@/components/ui/button'
    import { Download, Trash2, Navigation } from 'lucide-vue-next'
    import { useDateTime } from '@/composables/useDateTime'
    import { useFileSize } from '@/composables/useFileSize'
    import { useImagePath } from '@/composables/useImagePath'

    defineProps({
      image: Object,
      sceneName: String,
      canEdit: {
        type: Boolean,
        default: false
      }
    })

    const emit = defineEmits(['view', 'download', 'delete'])

    const { formatDate } = useDateTime()
    const { formatBytes } = useFileSize()
    const { getImageUrl } = useImagePath()
    </script>
    
    <template>
      <Card class="hover:shadow-md transition-shadow">
        <CardContent class="flex items-center gap-4 p-4">
          <div
            class="relative flex-shrink-0 bg-zinc-100 dark:bg-zinc-800 rounded-lg w-32 h-20 overflow-hidden cursor-pointer"
            @click="emit('view', image)"
          >
            <img
              :src="getImageUrl(image.slug)"
              :alt="image.name || sceneName"
              class="w-full h-full object-cover"
            />
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-sm text-zinc-900 dark:text-zinc-100 truncate mb-1">
              {{ image.name || 'Sans nom' }}
            </p>
            <p class="text-zinc-500 dark:text-zinc-400 text-sm">{{ formatBytes(image.size) }}</p>
            <p class="text-zinc-400 dark:text-zinc-500 text-xs">Créé le {{ formatDate(image.created_at) }}</p>
            <div class="flex items-center gap-1 text-zinc-400 dark:text-zinc-500 text-xs mt-1">
              <Navigation class="w-3 h-3" />
              <span>{{ image.hotspots_from?.length || 0 }} point(s) d'accès</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              @click="emit('download', image.slug, image.path)"
            >
              <Download class="mr-2 w-4 h-4" />
              Télécharger
            </Button>
            <Button
              v-if="canEdit"
              variant="ghost"
              size="icon"
              @click="emit('delete', image.slug)"
            >
              <Trash2 class="w-4 h-4 text-red-600 dark:text-red-400" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </template>