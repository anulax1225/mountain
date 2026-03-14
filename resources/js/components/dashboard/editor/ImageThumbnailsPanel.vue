<script setup>
    import { ref, computed } from 'vue'
    import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
    import AppImage from '@/components/AppImage.vue'
    import { useImagePath } from '@/composables/useImagePath'
    import { ChevronDown, ChevronUp } from 'lucide-vue-next'

    const props = defineProps({
      images: Array,
      scenes: Array,
      currentIndex: Number
    })

    const emit = defineEmits(['select'])

    const { getImagePreview } = useImagePath()
    const collapsed = ref(false)

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
      <div class="right-0 bottom-0 left-0 absolute flex justify-center px-2 sm:px-4 md:px-20 lg:px-32 2xl:px-64 xl:px-48 pb-2 sm:pb-4">
        <div class="flex flex-col items-center max-w-96">
          <button
            @click="collapsed = !collapsed"
            class="flex justify-center items-center bg-card/95 hover:bg-card shadow-lg backdrop-blur-lg mb-1 border border-border border-b-0 rounded-t-lg w-10 h-6 transition-colors"
            :title="collapsed ? 'Afficher les miniatures' : 'Masquer les miniatures'"
          >
            <ChevronDown v-if="!collapsed" class="w-4 h-4 text-muted-foreground" />
            <ChevronUp v-else class="w-4 h-4 text-muted-foreground" />
          </button>

          <Transition name="slide">
            <div v-show="!collapsed" class="bg-card/95 shadow-2xl backdrop-blur-lg border border-border rounded-xl max-w-96">
              <ScrollArea class="w-full">
                <div class="flex items-stretch gap-0 p-2 sm:p-3">
                  <template v-for="(group, groupIdx) in sceneGroups" :key="group.sceneSlug">
                    <!-- Vertical separator between groups -->
                    <div
                      v-if="groupIdx > 0"
                      class="mx-2 sm:mx-3 bg-border w-px shrink-0"
                    ></div>

                    <!-- Scene group -->
                    <div class="flex flex-col gap-1.5 shrink-0">
                      <!-- Scene name on top -->
                      <div class="px-1 max-w-32 sm:max-w-none font-medium text-[10px] text-muted-foreground sm:text-xs truncate">
                        {{ group.sceneName }}
                      </div>

                      <!-- Images row -->
                      <div class="flex items-center gap-1.5 sm:gap-2">
                        <button
                          v-for="item in group.images"
                          :key="item.image.slug"
                          @click="emit('select', item.index)"
                          :class="[
                            'relative aspect-video rounded-lg overflow-hidden transition-all shrink-0 border-2',
                            'w-20 sm:w-28 md:w-32',
                            item.index === currentIndex
                              ? 'border-primary ring-2 ring-primary/30 scale-105'
                              : 'border-transparent opacity-60 hover:opacity-100 hover:border-muted-foreground hover:scale-102'
                          ]"
                        >
                          <AppImage
                            :src="getImagePreview(item.image)"
                            :alt="item.image.name"
                            class="w-full h-full object-cover"
                          />
                          <div class="absolute inset-0 bg-linear-to-t from-card/90 via-transparent to-transparent"></div>
                          <div class="right-1 sm:right-1.5 bottom-0.5 sm:bottom-1 left-1 sm:left-1.5 absolute">
                            <p class="drop-shadow-lg font-medium text-[10px] text-card-foreground sm:text-xs truncate">
                              {{ item.image.name || 'Sans nom' }}
                            </p>
                          </div>
                        </button>
                      </div>
                    </div>
                  </template>
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          </Transition>
        </div>
      </div>
    </template>

    <style scoped>
    .slide-enter-active,
    .slide-leave-active {
      transition: all 0.3s ease;
      transform-origin: bottom;
    }

    .slide-enter-from,
    .slide-leave-to {
      opacity: 0;
      transform: translateY(100%);
    }
    </style>
