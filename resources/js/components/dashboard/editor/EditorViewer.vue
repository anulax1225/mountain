<script setup>
import { ref, onMounted, computed, onUnmounted, nextTick } from 'vue'
import EditorCanvas from '@/components/dashboard/editor/EditorCanvas.vue'
import ImageThumbnailsPanel from '@/components/dashboard/editor/ImageThumbnailsPanel.vue'
import owl from '@/owl-sdk.js'

const props = defineProps({
    project: Object,
})

const images = ref(props.project.scenes.reduce((acc, scene) => {
    return acc.concat(scene.images)
}, []))
const currentImageIndex = ref(images.value.findIndex(img => img.id === props.project.start_image.id) || 0)
const mode = ref('view')
const isCreatingHotspot = ref(false)
const targetDialogOpen = ref(false)
const pendingHotspotPosition = ref(null)
const hoveredHotspot = ref(null)
const hotspotHoverPosition = ref(null)
const editingHotspot = ref(null)
const isPopoverHovered = ref(false)
const editorCanvasRef = ref(null)

const handleHotspotPositionSelected = (position) => {
    pendingHotspotPosition.value = position
    isCreatingHotspot.value = false
    editingHotspot.value = null
    targetDialogOpen.value = true
}

const handleHotspotClick = async (hotspot) => {
    if (mode.value === 'edit') return

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

const handleImageSelect = (index) => {
    currentImageIndex.value = index
}

</script>
<template>
    <EditorCanvas ref="editorCanvasRef" :images="images" :current-index="currentImageIndex" :mode="mode"
        @hotspot-click="handleHotspotClick" @hotspot-position-selected="handleHotspotPositionSelected"
        @hotspot-hover="handleHotspotHover" @hotspot-hover-end="handleHotspotHoverEnd" />

    <ImageThumbnailsPanel :images="images" :current-index="currentImageIndex" @select="handleImageSelect" />
</template>