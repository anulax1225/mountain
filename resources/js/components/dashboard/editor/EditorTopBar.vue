<script setup>
    import { Link } from '@inertiajs/vue3'
    import { Button } from '@/components/ui/button'
    import { Badge } from '@/components/ui/badge'
    import { ArrowLeft, Plus, Eye, Pencil, Maximize, Minimize } from 'lucide-vue-next'
    
    defineProps({
      sceneName: String,
      sceneSlug: String,
      mode: String,
      isFullscreen: Boolean
    })
    
    const emit = defineEmits(['create-hotspot', 'toggle-mode', 'toggle-fullscreen'])
    </script>
    
    <template>
      <div class="top-0 right-0 left-0 absolute bg-gradient-to-b from-black/50 to-transparent backdrop-blur-sm p-4">
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-3">
            <Link :href="`/dashboard/scenes/${sceneSlug}`">
              <Button variant="secondary" size="icon-sm">
                <ArrowLeft class="w-4 h-4" />
              </Button>
            </Link>
            <div class="text-white">
              <div class="flex items-center gap-2">
                <h1 class="font-semibold text-sm">{{ sceneName }}</h1>
                <Badge :variant="mode === 'edit' ? 'default' : 'secondary'" class="text-xs">
                  {{ mode === 'edit' ? 'Édition' : 'Aperçu' }}
                </Badge>
              </div>
              <p class="text-white/60 text-xs">Éditeur 360°</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <Button 
              v-if="mode === 'edit'"
              variant="default" 
              size="sm" 
              @click="emit('create-hotspot')"
            >
              <Plus class="mr-2 w-4 h-4" />
              Ajouter un point d'accès
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              @click="emit('toggle-mode')"
            >
              <component :is="mode === 'edit' ? Eye : Pencil" class="mr-2 w-4 h-4" />
              {{ mode === 'edit' ? 'Mode aperçu' : 'Mode édition' }}
            </Button>
            <Button 
              variant="secondary" 
              size="icon-sm" 
              @click="emit('toggle-fullscreen')"
            >
              <component :is="isFullscreen ? Minimize : Maximize" class="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </template>