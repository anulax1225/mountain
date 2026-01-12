<script setup>
    import { ref, computed } from 'vue'
    import { ScrollArea } from '@/components/ui/scroll-area'
    
    const props = defineProps({
      images: Array,
      currentIndex: Number
    })
    
    const emit = defineEmits(['select'])
    </script>
    
    <template>
      <div class="right-0 bottom-0 left-0 absolute bg-gradient-to-t from-black/50 to-transparent backdrop-blur-sm p-4">
        <ScrollArea class="w-full">
          <div class="flex gap-2 pb-2">
            <button
              v-for="(image, index) in images"
              :key="image.slug"
              @click="emit('select', index)"
              :class="[
                'relative aspect-video rounded-lg overflow-hidden transition-all flex-shrink-0',
                'w-32 sm:w-40',
                index === currentIndex
                  ? 'ring-2 ring-white scale-105'
                  : 'opacity-70 hover:opacity-100 hover:scale-105'
              ]"
            >
              <img 
                :src="`/images/${image.slug}/download`" 
                :alt="image.name"
                class="w-full h-full object-cover"
              />
              <div 
                v-if="index === currentIndex"
                class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"
              ></div>
              <div class="bottom-1 left-1 right-1 absolute">
                <p class="font-medium text-white text-xs truncate drop-shadow-lg">
                  {{ image.name || 'Sans nom' }}
                </p>
              </div>
            </button>
          </div>
        </ScrollArea>
      </div>
    </template>