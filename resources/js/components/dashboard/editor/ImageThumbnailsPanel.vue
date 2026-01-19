<script setup>
    import { ref, computed } from 'vue'
    import { ScrollArea } from '@/components/ui/scroll-area'
    import { useImagePath } from '@/composables/useImagePath'

    const props = defineProps({
      images: Array,
      currentIndex: Number
    })

    const emit = defineEmits(['select'])

    const { getImageUrl } = useImagePath()
    </script>
    
    <template>
      <div class="bottom-0 left-1/4 right-1/4 absolute bg-gradient-to-t from-black/50 to-transparent backdrop-blur-sm rounded-md">
        <ScrollArea class="w-full">
          <div class="flex gap-2 p-2 overflow-x-auto w-full">
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
                :src="getImageUrl(image.slug)"
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