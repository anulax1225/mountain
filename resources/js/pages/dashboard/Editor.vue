<script setup>
import { ref, onMounted, computed, onUnmounted, nextTick } from 'vue'
import { Link } from '@inertiajs/vue3'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Button } from '@/components/ui/button'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import EditorCanvas from '@/components/dashboard/editor/EditorCanvas.vue'
import EditorTopBar from '@/components/dashboard/editor/EditorTopBar.vue'
import HotspotTargetDialog from '@/components/dashboard/editor/HotspotTargetDialog.vue'
import HotspotPopover from '@/components/dashboard/editor/HotspotPopover.vue'
import ImageThumbnailsPanel from '@/components/dashboard/editor/ImageThumbnailsPanel.vue'
import HotspotsListPanel from '@/components/dashboard/editor/HotspotsListPanel.vue'
import owl from '@/owl-sdk.js'

const props = defineProps({
    auth: Object,
    sceneSlug: String,
})

const scene = ref(null)
const project = ref(null)
const images = ref([])
const allScenes = ref([])
const currentImageIndex = ref(0)
const loading = ref(true)
const mode = ref('view')
const isCreatingHotspot = ref(false)
const targetDialogOpen = ref(false)
const pendingHotspotPosition = ref(null)
const hoveredHotspot = ref(null)
const hotspotHoverPosition = ref(null)
const editingHotspot = ref(null)
const isFullscreen = ref(false)
const editorContainer = ref(null)
const isPopoverHovered = ref(false)
const editorCanvasRef = ref(null)

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
        images.value = [...(response.data || [])]
        console.log('Loaded images with hotspots:', images.value)

        // Force refresh hotspots display
        await nextTick()
        if (editorCanvasRef.value) {
            editorCanvasRef.value.displayHotspots()
        }
    } catch (error) {
        console.error('Failed to load images:', error)
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
    editingHotspot.value = null
    targetDialogOpen.value = true
}

const handleTargetImageSelected = async (targetImage) => {
    if (!pendingHotspotPosition.value || !currentImage.value) return

    try {
        if (editingHotspot.value) {
            console.log('Updating hotspot:', editingHotspot.value.slug)
            await owl.hotspots.update(props.sceneSlug, editingHotspot.value.slug, {
                from_image_id: currentImage.value.id,
                to_image_id: targetImage.id,
                position_x: pendingHotspotPosition.value.x,
                position_y: pendingHotspotPosition.value.y,
                position_z: pendingHotspotPosition.value.z,
            })
            editingHotspot.value = null
        } else {
            console.log('Creating new hotspot')
            await owl.hotspots.create(props.sceneSlug, {
                from_image_id: currentImage.value.id,
                to_image_id: targetImage.id,
                position_x: pendingHotspotPosition.value.x,
                position_y: pendingHotspotPosition.value.y,
                position_z: pendingHotspotPosition.value.z,
            })
        }

        pendingHotspotPosition.value = null
        targetDialogOpen.value = false
        await loadImages()
        console.log('Images reloaded after hotspot save')
    } catch (error) {
        console.error('Failed to save hotspot:', error)
    }
}

const handleHotspotClick = (hotspot) => {
    if (!hotspot.to_image?.id) return

    const targetIndex = images.value.findIndex(img => img.id === hotspot.to_image.id)
    if (targetIndex !== -1) {
        currentImageIndex.value = targetIndex
    }
}

const handleHotspotHover = ({ hotspot, position }) => {
    hoveredHotspot.value = hotspot
    hotspotHoverPosition.value = position
}

const handleHotspotHoverEnd = () => {
    if (!isPopoverHovered.value) {
        hoveredHotspot.value = null
        hotspotHoverPosition.value = null
    }
}

const handlePopoverMouseEnter = () => {
    isPopoverHovered.value = true
}

const handlePopoverMouseLeave = () => {
    isPopoverHovered.value = false
    hoveredHotspot.value = null
    hotspotHoverPosition.value = null
}

const handleImageSelect = (index) => {
    currentImageIndex.value = index
}

const handleEditHotspot = (hotspot) => {
    editingHotspot.value = hotspot
    pendingHotspotPosition.value = {
        x: hotspot.position_x,
        y: hotspot.position_y,
        z: hotspot.position_z
    }
    targetDialogOpen.value = true
}

const handleDeleteHotspot = async (hotspot) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce point d\'accès ?')) return

    try {
        console.log('Deleting hotspot:', hotspot.slug)
        await owl.hotspots.delete(props.sceneSlug, hotspot.slug)

        // Hide popover immediately
        hoveredHotspot.value = null
        hotspotHoverPosition.value = null

        await loadImages()
        console.log('Images reloaded after hotspot delete')
    } catch (error) {
        console.error('Failed to delete hotspot:', error)
    }
}

const toggleMode = () => {
    mode.value = mode.value === 'view' ? 'edit' : 'view'
    isCreatingHotspot.value = false
}

const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
        try {
            await editorContainer.value.requestFullscreen()
            isFullscreen.value = true
        } catch (err) {
            console.error('Failed to enter fullscreen:', err)
        }
    } else {
        try {
            await document.exitFullscreen()
            isFullscreen.value = false
        } catch (err) {
            console.error('Failed to exit fullscreen:', err)
        }
    }
}

const handleFullscreenChange = () => {
    isFullscreen.value = !!document.fullscreenElement
}

onMounted(() => {
    loadScene()
    document.addEventListener('fullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
    document.removeEventListener('fullscreenchange', handleFullscreenChange)
})
</script>

<template>
    <DashboardLayout :auth="auth" :project="project" :scene="scene">
        <div ref="editorContainer" :class="[
            'relative -m-6 w-[calc(100%+3rem)]',
            isFullscreen ? 'h-screen' : 'h-[calc(100vh-4rem)]'
        ]">
            <LoadingSpinner v-if="loading" class="absolute inset-0 bg-zinc-900" />

            <EmptyState v-else-if="images.length === 0" title="Aucune image dans cette scène"
                class="absolute inset-0 bg-zinc-900 text-white">
                <Link :href="`/dashboard/scenes/${sceneSlug}`">
                    <Button>Ajouter des images</Button>
                </Link>
            </EmptyState>

            <div v-else class="relative w-full h-full">
                <EditorCanvas ref="editorCanvasRef" :images="images" :current-index="currentImageIndex" :mode="mode"
                    :is-creating-hotspot="isCreatingHotspot" @hotspot-click="handleHotspotClick"
                    @hotspot-position-selected="handleHotspotPositionSelected" @hotspot-hover="handleHotspotHover"
                    @hotspot-hover-end="handleHotspotHoverEnd" />

                <EditorTopBar :scene-name="scene?.name" :scene-slug="sceneSlug" :mode="mode"
                    :is-fullscreen="isFullscreen" @create-hotspot="startCreatingHotspot" @toggle-mode="toggleMode"
                    @toggle-fullscreen="toggleFullscreen" />

                <ImageThumbnailsPanel :images="images" :current-index="currentImageIndex" @select="handleImageSelect" />

                <HotspotsListPanel v-if="mode === 'edit'" :current-image="currentImage" @edit="handleEditHotspot"
                    @delete="handleDeleteHotspot" />

                <HotspotPopover :hotspot="hoveredHotspot" :position="hotspotHoverPosition" :mode="mode"
                    :visible="!!hoveredHotspot" @edit="handleEditHotspot" @delete="handleDeleteHotspot"
                    @mouseenter="handlePopoverMouseEnter" @mouseleave="handlePopoverMouseLeave" />

                <HotspotTargetDialog v-model:open="targetDialogOpen" :all-scenes="allScenes"
                    :current-image-id="currentImage?.id" @select="handleTargetImageSelected" />
            </div>
        </div>
    </DashboardLayout>
</template>