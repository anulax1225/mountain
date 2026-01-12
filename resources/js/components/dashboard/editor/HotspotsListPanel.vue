<script setup>
    import { computed } from 'vue'
    import { ScrollArea } from '@/components/ui/scroll-area'
    import { Button } from '@/components/ui/button'
    import { Badge } from '@/components/ui/badge'
    import { Pencil, Trash2, Eye } from 'lucide-vue-next'
    
    const props = defineProps({
      currentImage: Object
    })
    
    const emit = defineEmits(['edit', 'delete', 'view'])
    
    const currentHotspots = computed(() => 
      props.currentImage?.hotspots_from || []
    )
    </script>
    
    <template>
      <div class="top-20 right-4 absolute bg-white/95 dark:bg-zinc-800/95 shadow-xl backdrop-blur-sm border border-zinc-200 dark:border-zinc-700 p-4 rounded-lg w-80">
        <div class="mb-3 pb-2 border-zinc-200 dark:border-zinc-700 border-b">
          <div class="flex justify-between items-center">
            <h3 class="font-semibold text-zinc-900 dark:text-zinc-100">Points d'accès</h3>
            <Badge variant="secondary">{{ currentHotspots.length }}</Badge>
          </div>
          <p class="text-zinc-500 dark:text-zinc-400 text-xs">Image actuelle</p>
        </div>
    
        <ScrollArea class="max-h-[calc(100vh-16rem)]">
          <div v-if="currentHotspots.length === 0" class="py-8 text-center">
            <p class="text-zinc-400 text-sm">Aucun point d'accès</p>
          </div>
    
          <div v-else class="space-y-2">
            <div
              v-for="hotspot in currentHotspots"
              :key="hotspot.slug"
              class="relative flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-900 p-2 rounded-lg transition-colors group"
            >
              <div 
                v-if="hotspot.to_image" 
                class="relative rounded overflow-hidden flex-shrink-0 w-16 aspect-video"
              >
                <img 
                  :src="`/images/${hotspot.to_image.slug}/download`" 
                  :alt="hotspot.to_image.name"
                  class="w-full h-full object-cover"
                />
              </div>
              <div 
                v-else 
                class="flex justify-center items-center bg-zinc-200 dark:bg-zinc-800 rounded flex-shrink-0 w-16 aspect-video"
              >
                <Eye class="w-4 h-4 text-zinc-400" />
              </div>
    
              <div class="flex-1 min-w-0">
                <p class="font-medium text-sm text-zinc-900 dark:text-zinc-100 truncate">
                  {{ hotspot.to_image?.name || 'Sans destination' }}
                </p>
                <p class="text-zinc-500 dark:text-zinc-400 text-xs truncate">
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