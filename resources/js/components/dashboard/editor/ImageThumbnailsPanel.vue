<script setup>
    import { computed } from 'vue'
    import { ScrollArea } from '@/components/ui/scroll-area'
    import { useImagePath } from '@/composables/useImagePath'

    const props = defineProps({
      images: Array,
      scenes: Array,
      currentIndex: Number
    })

    const emit = defineEmits(['select'])

    const { getImageUrl } = useImagePath()

    // Group images by scene
    const sceneGroups = computed(() => {
      const groups = []
      let currentSceneSlug = null
      let currentGroup = null

      props.images.forEach((image, index) => {
        if (image.sceneSlug !== currentSceneSlug) {
          currentSceneSlug = image.sceneSlug
          currentGroup = {
            sceneName: image.sceneName || 'Sans nom',
            sceneSlug: image.sceneSlug,
            images: []
          }
          groups.push(currentGroup)
        }
        currentGroup.images.push({ image, index })
      })

      return groups
    })
    </script>

    <template>
      <div class="bottom-0 left-0 right-0 absolute px-2 sm:px-4 pb-2 sm:pb-4 md:px-20 lg:px-32 xl:px-48 2xl:px-64">
        <div class="bg-zinc-900 rounded-xl border border-zinc-700/50 shadow-2xl">
          <ScrollArea class="w-full">
            <div class="flex items-stretch gap-0 p-2 sm:p-3">
              <template v-for="(group, groupIdx) in sceneGroups" :key="group.sceneSlug">
                <!-- Vertical separator between groups -->
                <div
                  v-if="groupIdx > 0"
                  class="flex-shrink-0 w-px bg-zinc-600/50 mx-2 sm:mx-3"
                ></div>

                <!-- Scene group -->
                <div class="flex-shrink-0 flex flex-col gap-1.5">
                  <!-- Scene name on top -->
                  <div class="text-zinc-400 text-[10px] sm:text-xs font-medium px-1 truncate max-w-32 sm:max-w-none">
                    {{ group.sceneName }}
                  </div>

                  <!-- Images row -->
                  <div class="flex items-center gap-1.5 sm:gap-2">
                    <button
                      v-for="item in group.images"
                      :key="item.image.slug"
                      @click="emit('select', item.index)"
                      :class="[
                        'relative aspect-video rounded-lg overflow-hidden transition-all flex-shrink-0 border-2',
                        'w-20 sm:w-28 md:w-32',
                        item.index === currentIndex
                          ? 'border-white ring-2 ring-white/30 scale-105'
                          : 'border-transparent opacity-60 hover:opacity-100 hover:border-zinc-500 hover:scale-102'
                      ]"
                    >
                      <img
                        :src="getImageUrl(item.image.slug)"
                        :alt="item.image.name"
                        class="w-full h-full object-cover"
                      />
                      <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                      <div class="bottom-0.5 sm:bottom-1 left-1 right-1 sm:left-1.5 sm:right-1.5 absolute">
                        <p class="font-medium text-white text-[10px] sm:text-xs truncate drop-shadow-lg">
                          {{ item.image.name || 'Sans nom' }}
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              </template>
            </div>
          </ScrollArea>
        </div>
      </div>
    </template>
