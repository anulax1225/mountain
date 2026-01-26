<script setup>
import { ref, onMounted, computed, onUnmounted, nextTick } from 'vue'
import { Button } from '@/components/ui/button'
import { Maximize, Minimize, VenetianMask } from 'lucide-vue-next'
import EditorCanvas from '@/components/dashboard/editor/EditorCanvas.vue'
import ImageThumbnailsPanel from '@/components/dashboard/editor/ImageThumbnailsPanel.vue'
import HotspotPopover from '@/components/dashboard/editor/HotspotPopover.vue'
import owl from '@/owl-sdk.js'
import EditorZoomControls from './EditorZoomControls.vue'

const props = defineProps({
    project: Object,
    onTrackImageView: Function, // Optional tracking callback for image views
    onTrackHotspotClick: Function, // Optional tracking callback for hotspot clicks
})

// Flatten images from all scenes, adding scene info for grouping in ImageThumbnailsPanel
const images = ref(props.project.scenes.reduce((acc, scene) => {
    const imagesWithScene = scene.images.map(image => ({
        ...image,
        sceneName: scene.name,
        sceneSlug: scene.slug
    }))
    return acc.concat(imagesWithScene)
}, []))
const currentImageIndex = ref(images.value.findIndex(img => img.id === props.project.start_image.id) || 0)
const mode = ref('view')
const isCreatingHotspot = ref(false)
const targetDialogOpen = ref(false)
const pendingHotspotPosition = ref(null)
const hoveredHotspotSlug = ref(null) // Track by slug for proper state management
const hoveredHotspot = ref(null)
const hotspotHoverPosition = ref(null)
const editingHotspot = ref(null)
const isPopoverHovered = ref(false)
const editorCanvasRef = ref(null)
const isImmersive = ref(false)
const isFullscreen = ref(false)
const viewerContainer = ref(null)

const handleHotspotPositionSelected = (position) => {
    pendingHotspotPosition.value = position
    isCreatingHotspot.value = false
    editingHotspot.value = null
    targetDialogOpen.value = true
}

const handleHotspotClick = async (hotspot) => {
    if (mode.value === 'edit') return

    // Track hotspot click for analytics
    if (props.onTrackHotspotClick && hotspot.slug) {
        props.onTrackHotspotClick(hotspot.slug)
    }

    const targetIndex = images.value.findIndex(img => img.id === hotspot.to_image_id)
    if (targetIndex !== -1) {
        const hasRotation = hotspot.target_rotation_x !== null && hotspot.target_rotation_y !== null

        // Always load panorama directly to ensure it completes before reloading images
        if (editorCanvasRef.value) {
            if (hasRotation) {
                await editorCanvasRef.value.loadPanorama(targetIndex, true, {
                    x: hotspot.target_rotation_x,
                    y: hotspot.target_rotation_y,
                    z: hotspot.target_rotation_z
                })
            } else {
                await editorCanvasRef.value.loadPanorama(targetIndex, true, null, true)
            }
        }

        // Update index after panorama loads
        currentImageIndex.value = targetIndex

        // Track image view for analytics
        const targetImage = images.value[targetIndex]
        if (props.onTrackImageView && targetImage?.slug) {
            props.onTrackImageView(targetImage.slug)
        }
    }
}

const handleHotspotHoverStart = ({ slug, hotspot, position }) => {
    hoveredHotspotSlug.value = slug
    hoveredHotspot.value = hotspot
    hotspotHoverPosition.value = position
}

const handleHotspotHoverEnd = () => {
    if (!isPopoverHovered.value) {
        hoveredHotspotSlug.value = null
        hoveredHotspot.value = null
        hotspotHoverPosition.value = null
    }
}

const handleImageSelect = (index) => {
    currentImageIndex.value = index

    // Track image view for analytics
    const selectedImage = images.value[index]
    if (props.onTrackImageView && selectedImage?.slug) {
        props.onTrackImageView(selectedImage.slug)
    }
}

const toggleImmersion = () => {
    isImmersive.value = !isImmersive.value
}

const handlePopoverMouseEnter = () => {
    isPopoverHovered.value = true
}

const handlePopoverMouseLeave = () => {
    isPopoverHovered.value = false
    hoveredHotspotSlug.value = null
    hoveredHotspot.value = null
    hotspotHoverPosition.value = null
}

const handleCameraMove = () => {
    // Close popover when camera moves or when clicking empty space
    hoveredHotspotSlug.value = null
    hoveredHotspot.value = null
    hotspotHoverPosition.value = null
    isPopoverHovered.value = false
}

const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
        await viewerContainer.value?.requestFullscreen()
    } else {
        await document.exitFullscreen()
    }
}

const handleFullscreenChange = () => {
    isFullscreen.value = !!document.fullscreenElement
}

onMounted(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
    document.removeEventListener('fullscreenchange', handleFullscreenChange)
})

</script>
<template>
    <div ref="viewerContainer" class="relative w-full h-full">
        <EditorCanvas ref="editorCanvasRef" :images="images" :current-index="currentImageIndex" :mode="mode"
            :hovered-hotspot-slug="hoveredHotspotSlug"
            @hotspot-click="handleHotspotClick" @hotspot-position-selected="handleHotspotPositionSelected"
            @hotspot-hover-start="handleHotspotHoverStart" @hotspot-hover-end="handleHotspotHoverEnd"
            @camera-move="handleCameraMove" />

        <!-- Control buttons on right side (middle height to avoid overlap) -->
        <div class="absolute top-1/2 -translate-y-1/2 right-6 z-40 flex flex-col gap-2">
            <!-- Fullscreen button (always visible when not in immersion mode) -->
            <Transition name="fade">
                <Button v-show="!isImmersive" @click="toggleFullscreen" size="icon" variant="secondary"
                    class="w-10 h-10 bg-white/90 dark:bg-zinc-800/90 backdrop-blur shadow-lg hover:bg-white dark:hover:bg-zinc-800"
                    :title="isFullscreen ? 'Quitter le plein écran' : 'Plein écran'">
                    <Maximize v-if="!isFullscreen" class="w-5 h-5" />
                    <Minimize v-else class="w-5 h-5" />
                </Button>
            </Transition>

            <!-- Immersion mode toggle (not in immersion) -->
            <Transition name="fade">
                <Button v-show="!isImmersive" @click="toggleImmersion" size="icon" variant="secondary"
                    class="w-10 h-10 bg-white/90 dark:bg-zinc-800/90 backdrop-blur shadow-lg hover:bg-white dark:hover:bg-zinc-800"
                    title="Mode immersion">
                    <VenetianMask class="w-5 h-5" />
                </Button>
            </Transition>

            <!-- Exit immersion button (only visible in immersion mode) -->
            <Transition name="fade">
                <Button v-show="isImmersive" @click="toggleImmersion" size="icon" variant="secondary"
                    class="w-10 h-10 bg-white/10 dark:bg-zinc-800/10 backdrop-blur shadow-lg hover:bg-white/20 dark:hover:bg-zinc-800/20"
                    title="Quitter le mode immersion">
                    <VenetianMask class="w-5 h-5" />
                </Button>
            </Transition>
        </div>

        <Transition name="fade">
            <ImageThumbnailsPanel v-show="!isImmersive" :images="images" :current-index="currentImageIndex"
                @select="handleImageSelect" />
        </Transition>

        <Transition name="fade">
            <EditorZoomControls v-show="!isImmersive" :controls="editorCanvasRef?.controls" />
        </Transition>

        <HotspotPopover :hotspot="hoveredHotspot" :position="hotspotHoverPosition" :mode="mode"
            :visible="!!hoveredHotspot" @mouseenter="handlePopoverMouseEnter" @mouseleave="handlePopoverMouseLeave" />
    </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>