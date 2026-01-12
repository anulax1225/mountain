<script setup>
import { ref, onMounted, computed } from 'vue'
import { Link } from '@inertiajs/vue3'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Button } from '@/components/ui/button'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import EditorCanvas from '@/components/dashboard/editor/EditorCanvas.vue'
import EditorTopBar from '@/components/dashboard/editor/EditorTopBar.vue'
import HotspotTargetDialog from '@/components/dashboard/editor/HotspotTargetDialog.vue'
import owl from '@/owl-sdk.js'

const props = defineProps({
  auth: Object,
  sceneSlug: String,
})

const scene = ref(null)
const project = ref(null)
const images = ref([])
const hotspots = ref([])
const allScenes = ref([])
const currentImageIndex = ref(0)
const loading = ref(true)
const mode = ref('view')
const isCreatingHotspot = ref(false)
const targetDialogOpen = ref(false)
const pendingHotspotPosition = ref(null)

const currentImage = computed(() => images.value[currentImageIndex.value])

const loadScene = async () => {
  try {
    loading.value = true
    const response = await owl.scenes.get(props.sceneSlug)
    scene.value = response.data
    if (scene.value?.project) {
      project.value = scene.value.project
    }
    await Promise.all([
      loadImages(),
      loadHotspots(),
      loadAllScenes()
    ])
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

const loadHotspots = async () => {
  try {
    const response = await owl.hotspots.list(props.sceneSlug)
    hotspots.value = response.data || []
  } catch (error) {
    console.error('Failed to load hotspots:', error)
  }
}

const loadAllScenes = async () => {
  try {
    if (!project.value?.slug) return
    
    const response = await owl.scenes.list(project.value.slug)
    const scenes = response.data || []
    
    for (const scene of scenes) {
      const imagesResponse = await owl.images.list(scene.slug)
      scene.images = imagesResponse.data || []
    }
    
    allScenes.value = scenes
  } catch (error) {
    console.error('Failed to load all scenes:', error)
  }
}

const startCreatingHotspot = () => {
  isCreatingHotspot.value = true
}

const handleHotspotPositionSelected = (position) => {
  pendingHotspotPosition.value = position
  isCreatingHotspot.value = false
  targetDialogOpen.value = true
}

const handleTargetImageSelected = async (targetImage) => {
  if (!pendingHotspotPosition.value || !currentImage.value) return

  try {
    await owl.hotspots.create(props.sceneSlug, {
      from_image_id: currentImage.value.id,
      to_image_id: targetImage.id,
      position_x: pendingHotspotPosition.value.x,
      position_y: pendingHotspotPosition.value.y,
      position_z: pendingHotspotPosition.value.z,
    })

    pendingHotspotPosition.value = null
    await loadHotspots()
  } catch (error) {
    console.error('Failed to create hotspot:', error)
  }
}

const handleHotspotClick = (hotspot) => {
  if (!hotspot.to_image?.id) return

  const targetIndex = images.value.findIndex(img => img.id === hotspot.to_image.id)
  if (targetIndex !== -1) {
    currentImageIndex.value = targetIndex
  }
}

const toggleMode = () => {
  mode.value = mode.value === 'view' ? 'edit' : 'view'
  isCreatingHotspot.value = false
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

      <div v-else class="relative w-full h-full">
        <EditorCanvas 
          :images="images" 
          :current-index="currentImageIndex"
          :hotspots="hotspots"
          :mode="mode"
          :is-creating-hotspot="isCreatingHotspot"
          @hotspot-click="handleHotspotClick"
          @hotspot-position-selected="handleHotspotPositionSelected"
        />
        
        <EditorTopBar
          :scene-name="scene?.name"
          :scene-slug="sceneSlug"
          :mode="mode"
          @create-hotspot="startCreatingHotspot"
          @toggle-mode="toggleMode"
        />

        <HotspotTargetDialog
          v-model:open="targetDialogOpen"
          :all-scenes="allScenes"
          :current-image-id="currentImage?.id"
          @select="handleTargetImageSelected"
        />
      </div>
    </div>
  </DashboardLayout>
</template>