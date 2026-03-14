<script setup>
    import { computed } from 'vue'
    import { ScrollArea } from '@/components/ui/scroll-area'
    import { Button } from '@/components/ui/button'
    import { Badge } from '@/components/ui/badge'
    import { Pencil, Trash2, Eye } from 'lucide-vue-next'
    import { useImagePath } from '@/composables/useImagePath'

    const props = defineProps({
      currentImage: Object
    })

    const emit = defineEmits(['edit', 'delete', 'view'])

    const { getImagePreview } = useImagePath()

    const currentHotspots = computed(() =>
      props.currentImage?.hotspots_from || []
    )
    </script>
    
    <template>
      <div class="top-20 right-4 absolute bg-card/95 shadow-xl backdrop-blur-lg border border-border p-4 rounded-xl w-80">
        <div class="mb-3 pb-2 border-border border-b">
          <div class="flex justify-between items-center">
            <h3 class="font-semibold text-foreground">Points d'accès</h3>
            <Badge variant="secondary">{{ currentHotspots.length }}</Badge>
          </div>
          <p class="text-muted-foreground text-xs">Image actuelle</p>
        </div>

        <ScrollArea class="max-h-[calc(100dvh-16rem)]">
          <div v-if="currentHotspots.length === 0" class="py-8 text-center">
            <p class="text-muted-foreground text-sm">Aucun point d'accès</p>
          </div>

          <div v-else class="space-y-2">
            <div
              v-for="hotspot in currentHotspots"
              :key="hotspot.slug"
              class="relative flex items-center gap-2 bg-muted hover:bg-muted p-2 rounded-lg transition-colors group"
            >
              <div
                v-if="hotspot.to_image"
                class="relative rounded overflow-hidden flex-shrink-0 w-16 aspect-video"
              >
                <img
                  :src="getImagePreview(hotspot.to_image)"
                  :alt="hotspot.to_image.name"
                  class="w-full h-full object-cover"
                />
              </div>
              <div
                v-else
                class="flex justify-center items-center bg-muted rounded flex-shrink-0 w-16 aspect-video"
              >
                <Eye class="w-4 h-4 text-muted-foreground" />
              </div>

              <div class="flex-1 min-w-0">
                <p class="font-medium text-sm text-foreground truncate">
                  {{ hotspot.to_image?.name || 'Sans destination' }}
                </p>
                <p class="text-muted-foreground text-xs truncate">
                  Position: {{ Math.round(hotspot.position_x) }}, {{ Math.round(hotspot.position_y) }}, {{ Math.round(hotspot.position_z) }}
                </p>
              </div>

              <div class="flex flex-col gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  class="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                  @click="emit('edit', hotspot)"
                >
                  <Pencil class="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  class="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                  @click="emit('delete', hotspot)"
                >
                  <Trash2 class="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </template>