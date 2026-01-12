<script setup>
import { ref, onMounted, computed } from 'vue'
import { Link } from '@inertiajs/vue3'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Button } from '@/components/ui/button'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import EditorCanvas from '@/components/dashboard/editor/EditorCanvas.vue'
import EditorTopBar from '@/components/dashboard/editor/EditorTopBar.vue'
import EditorNavigation from '@/components/dashboard/editor/EditorNavigation.vue'
import EditorInfoPanel from '@/components/dashboard/editor/EditorInfoPanel.vue'
import EditorThumbnails from '@/components/dashboard/editor/EditorThumbnails.vue'
import EditorModeIndicator from '@/components/dashboard/editor/EditorModeIndicator.vue'
import owl from '@/owl-sdk.js'

const props = defineProps({
  auth: Object,
  sceneSlug: String,
})

const scene = ref(null)
const project = ref(null)
const images = ref([])
const currentImageIndex = ref(0)
const loading = ref(true)
const isFullscreen = ref(false)
const showInfo = ref(true)
const showThumbnails = ref(true)

const currentImage = computed(() => images.value[currentImageIndex.value])

const loadScene = async () => {
  try {
    loading.value = true
    const response = await owl.scenes.get(props.sceneSlug)
    scene.value = response.data
    if (scene.value?.project) {
      project.value = scene.value.project
    }
    await loadImages()
  } catch (error) {
    console.error('Failed to load scene:', error)
  } finally {
    loading.value = false
  }
}

const loadImages = async () => {
  try {
    const response = await owl.images.list(props.sceneSlug)
    images.value = response.data || []
  } catch (error) {
    console.error('Failed to load images:', error)
  }
}

const nextImage = () => {
  if (currentImageIndex.value < images.value.length - 1) {
    currentImageIndex.value++
  }
}

const prevImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
  }
}

const toggleFullscreen = () => {
  if (!isFullscreen.value) {
    document.querySelector("#fullscreenElement").requestFullscreen()
    isFullscreen.value = true
  } else {
    if (document.fullscreenElement) document.exitFullscreen()
    isFullscreen.value = false
  }
}

onMounted(() => {
  loadScene()
})
</script>

<template>
  <DashboardLayout :auth="auth" :project="project" :scene="scene">
    <div class="relative -m-6 w-[calc(100%+3rem)] h-[calc(100vh-4rem)]">
      <LoadingSpinner v-if="loading" class="absolute inset-0 bg-zinc-900" />

      <EmptyState
        v-else-if="images.length === 0"
        title="Aucune image dans cette scène"
        class="absolute inset-0 bg-zinc-900 text-white"
      >
        <Link :href="`/dashboard/scenes/${sceneSlug}`">
          <Button>Ajouter des images</Button>
        </Link>
      </EmptyState>

      <div v-else id="fullscreenElement" class="relative w-full h-full">
        <EditorCanvas :images="images" :current-index="currentImageIndex" />
        
        <EditorTopBar
          :scene-name="scene?.name"
          :scene-slug="sceneSlug"
          :show-info="showInfo"
          :show-thumbnails="showThumbnails"
          @toggle-info="showInfo = !showInfo"
          @toggle-thumbnails="showThumbnails = !showThumbnails"
          @toggle-fullscreen="toggleFullscreen"
        />

        <EditorNavigation
          :current-index="currentImageIndex"
          :total-images="images.length"
          @prev="prevImage"
          @next="nextImage"
        />

        <EditorModeIndicator mode="Navigation" />

        <EditorThumbnails
          :images="images"
          :current-index="currentImageIndex"
          :scene-name="scene?.name"
          :show="showThumbnails"
          @select="currentImageIndex = $event"
        />

        <EditorInfoPanel
          :current-image="currentImage"
          :show="showInfo"
        />
      </div>
    </div>
  </DashboardLayout>
</template>