<script setup>
    import { Card, CardContent } from '@/components/ui/card'
    import { Button } from '@/components/ui/button'
    import { Download, Trash2, Navigation } from 'lucide-vue-next'
    import { useFileSize } from '@/composables/useFileSize'
    import { useImagePath } from '@/composables/useImagePath'

    const props = defineProps({
      image: Object,
      sceneName: String
    })

    const emit = defineEmits(['view', 'download', 'delete'])

    const { formatBytes } = useFileSize()
    const { getImageUrl } = useImagePath()
    </script>
    
    <template>
      <Card class="hover:shadow-lg overflow-hidden transition-shadow cursor-pointer">
        <div class="relative aspect-video" @click="emit('view', image)">
          <img
            :src="getImageUrl(image.slug)"
            :alt="image.name || sceneName"
            class="w-full h-full object-cover"
          />
        </div>
        <CardContent class="pt-4">
          <div class="mb-2">
            <p class="font-medium text-sm text-zinc-900 dark:text-zinc-100 truncate">
              {{ image.name || 'Sans nom' }}
            </p>
          </div>
          <div class="flex justify-between items-center gap-2">
            <div class="flex-1 min-w-0">
              <p class="text-zinc-500 dark:text-zinc-400 text-xs">{{ formatBytes(image.size) }}</p>
              <div class="flex items-center gap-1 text-zinc-400 dark:text-zinc-500 text-xs">
                <Navigation class="w-3 h-3" />
                <span>{{ image.hotspots_from?.length || 0 }} point(s) d'accès</span>
              </div>
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
          </div>
        </CardContent>
      </Card>
    </template>