<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useThreeScene } from '@/composables/useThreeScene.js'
import { usePanoramaLoader } from '@/composables/usePanoramaLoader.js'
import { useBlurRegions } from '@/composables/useBlurRegions.js'
import { useInjectedEditorInteraction } from '@/composables/useEditorInteraction.js'
import { useSpriteDisplay } from '@/composables/useSpriteDisplay.js'
import { useCanvasCursor } from '@/composables/useCanvasCursor.js'
import { useSpriteDrag } from '@/composables/useSpriteDrag.js'
import { useHoverDetection } from '@/composables/useHoverDetection.js'
import { useCanvasClick } from '@/composables/useCanvasClick.js'
import { usePinchZoom } from '@/composables/usePinchZoom.js'
import { ZOOM } from '@/lib/editorConstants.js'
import { useImagePath } from '@/composables/useImagePath.js'

const props = defineProps({
    images: Array,
    currentIndex: Number,
    mode: {
        type: String,
        default: 'view'
    },
    isCreatingHotspot: Boolean,
    isCreatingSticker: Boolean,
    isCreatingBlurRegion: Boolean,
})

const emit = defineEmits([
    'ready',
    'hotspot-click',
    'hotspot-click-edit',
    'sticker-click',
    'blur-region-click',
    'hotspot-position-selected',
    'sticker-position-selected',
    'blur-region-position-selected',
    'sprite-drag-end',
])

const renderView = ref(null)
const skipNextWatch = ref(false)
const isLoadingPanorama = ref(false)
const isLoadingFullRes = ref(false)
const lastPointerType = ref('mouse')

const { getImagePreview } = useImagePath()
const interaction = useInjectedEditorInteraction()

const currentImage = computed(() => props.images[props.currentIndex])
const currentHotspots = computed(() => currentImage.value?.hotspots_from || [])
const currentStickers = computed(() => currentImage.value?.stickers || [])
const currentBlurRegions = computed(() => currentImage.value?.blur_regions || [])

// --- Core Three.js ---
const {
    threeScene, camera, controls, raycaster, mouse, textureLoader,
    init: initThreeScene
} = useThreeScene(renderView, {
    onReady: () => emit('ready')
})

// --- Panorama loader ---
const {
    currentMesh, loadPanorama: loadPanoramaBase, preloadImages, cancelPreloads, onTextureReady
} = usePanoramaLoader(threeScene, textureLoader)

// --- Blur regions (canvas pre-processing) ---
const { applyBlurRegions } = useBlurRegions(currentMesh, currentBlurRegions)

// Re-apply blur when texture is swapped (preview → full-res)
onTextureReady(() => applyBlurRegions())

// --- Sprite display ---
const sprites = useSpriteDisplay(threeScene, interaction)

// --- Cursor ---
const { setCursor, resetCursor } = useCanvasCursor(renderView, {
    mode: () => props.mode,
    isCreatingHotspot: () => props.isCreatingHotspot,
    isCreatingSticker: () => props.isCreatingSticker,
    isCreatingBlurRegion: () => props.isCreatingBlurRegion,
})

// --- Pinch zoom ---
const pinch = usePinchZoom({ camera })

// --- Drag ---
const drag = useSpriteDrag({
    containerRef: renderView,
    camera,
    controls,
    raycaster,
    mouse,
    currentMesh,
    spriteDisplay: sprites,
    mode: () => props.mode,
    isCreatingHotspot: () => props.isCreatingHotspot,
    isCreatingSticker: () => props.isCreatingSticker,
    onDragEnd: (payload) => emit('sprite-drag-end', payload),
    setCursor,
    pinchActive: pinch.isActive,
})

// --- Hover detection ---
const hover = useHoverDetection({
    containerRef: renderView,
    camera,
    raycaster,
    spriteDisplay: sprites,
    interaction,
    mode: () => props.mode,
    isCreatingHotspot: () => props.isCreatingHotspot,
    isCreatingSticker: () => props.isCreatingSticker,
    justFinishedDrag: drag.justFinishedDrag,
    setCursor,
    resetCursor,
    lastPointerType,
})

// --- Click handling ---
const click = useCanvasClick({
    containerRef: renderView,
    camera,
    raycaster,
    mouse,
    currentMesh,
    spriteDisplay: sprites,
    interaction,
    mode: () => props.mode,
    isCreatingHotspot: () => props.isCreatingHotspot,
    isCreatingSticker: () => props.isCreatingSticker,
    isCreatingBlurRegion: () => props.isCreatingBlurRegion,
    clearHoverTimeout: hover.clearHoverTimeout,
    onHotspotClick: (hotspot) => emit('hotspot-click', hotspot),
    onHotspotClickEdit: (payload) => emit('hotspot-click-edit', payload),
    onStickerClick: (payload) => emit('sticker-click', payload),
    onBlurRegionClick: (payload) => emit('blur-region-click', payload),
    onHotspotPositionSelected: (pos) => emit('hotspot-position-selected', pos),
    onStickerPositionSelected: (pos) => emit('sticker-position-selected', pos),
    onBlurRegionPositionSelected: (pos) => emit('blur-region-position-selected', pos),
})

// --- Pointer event orchestrators ---
const onPointerDown = (event) => {
    lastPointerType.value = event.pointerType
    pinch.onPointerDown(event)
    drag.onPointerDown(event)
}

const onPointerMove = (event) => {
    lastPointerType.value = event.pointerType
    if (!raycaster.value || !camera.value) return

    // Pinch zoom takes priority
    if (pinch.onPointerMove(event)) return

    const rect = renderView.value.getBoundingClientRect()
    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top

    mouse.value.x = (mouseX / rect.width) * 2 - 1
    mouse.value.y = -(mouseY / rect.height) * 2 + 1
    raycaster.value.setFromCamera(mouse.value, camera.value)

    // Drag takes priority
    if (drag.onPointerMove(event)) return

    // Hover detection
    hover.onMouseMove(mouseX, mouseY)
}

const onPointerUp = (event) => {
    pinch.onPointerUp(event)
    drag.onPointerUp(event)
}

// --- Wheel zoom (FOV-based) ---
const onWheel = (event) => {
    if (!camera.value) return

    event.preventDefault()

    const delta = event.deltaY > 0 ? 1 : -1
    const newFov = camera.value.fov + delta * ZOOM.WHEEL_STEP
    camera.value.fov = Math.max(ZOOM.MIN_FOV, Math.min(ZOOM.MAX_FOV, newFov))
    camera.value.updateProjectionMatrix()
}

// --- Panorama loading ---
const loadPanorama = async (index, transition = true, rotation = null, skipWatch = false) => {
    if (!props.images[index] || !threeScene.value) return

    if (rotation || skipWatch) {
        skipNextWatch.value = true
    }

    isLoadingPanorama.value = true
    cancelPreloads()
    sprites.clearAll()

    const image = props.images[index]
    const previewUrl = image.preview_path ? getImagePreview(image) : null
    const { fullResReady } = await loadPanoramaBase(
        `/images/${image.slug}/download`,
        transition,
        rotation,
        controls.value,
        previewUrl
    )

    // Display sprites after transition
    sprites.displayHotspots(image.hotspots_from || [])
    sprites.displayStickers(image.stickers || [])

    // Display blur region indicators (visible only in edit mode)
    sprites.displayBlurRegions(image.blur_regions || [])
    sprites.setBlurIndicatorsVisible(props.mode === 'edit')

    isLoadingPanorama.value = false

    if (previewUrl) {
        isLoadingFullRes.value = true
        await fullResReady
        isLoadingFullRes.value = false
    }

    const hotspots = image.hotspots_from || []
    const preloadUrls = hotspots
        .filter(hotspot => hotspot.to_image?.slug)
        .map(hotspot => `/images/${hotspot.to_image.slug}/download`)
    if (preloadUrls.length > 0) {
        preloadImages(preloadUrls)
    }
}

// --- Watchers ---
watch(() => props.currentIndex, (newIndex) => {
    if (skipNextWatch.value) {
        skipNextWatch.value = false
        return
    }
    loadPanorama(newIndex)
})

watch(currentHotspots, () => {
    if (threeScene.value && !isLoadingPanorama.value) {
        sprites.displayHotspots(currentHotspots.value)
    }
}, { deep: true })

watch(currentStickers, () => {
    if (threeScene.value && !isLoadingPanorama.value) {
        sprites.displayStickers(currentStickers.value)
    }
}, { deep: true })

watch(currentBlurRegions, () => {
    if (threeScene.value && !isLoadingPanorama.value) {
        sprites.displayBlurRegions(currentBlurRegions.value)
        sprites.setBlurIndicatorsVisible(props.mode === 'edit')
    }
}, { deep: true })

// Toggle blur indicators visibility when mode changes
watch(() => props.mode, (newMode) => {
    sprites.setBlurIndicatorsVisible(newMode === 'edit')
})

// --- Lifecycle ---
onMounted(() => {
    const initialized = initThreeScene()

    if (initialized && threeScene.value) {
        sprites.init(threeScene.value)

        renderView.value.addEventListener('pointerdown', onPointerDown)
        renderView.value.addEventListener('pointermove', onPointerMove)
        renderView.value.addEventListener('pointerup', onPointerUp)
        renderView.value.addEventListener('pointercancel', onPointerUp)
        renderView.value.addEventListener('click', click.onClick)
        renderView.value.addEventListener('wheel', onWheel, { passive: false })

        if (controls.value) {
            let isControlsActive = false
            controls.value.addEventListener('start', () => {
                isControlsActive = true
                hover.clearHoverTimeout()
                interaction.clearHoverStates()
                interaction.setSelectedSticker(null)
                interaction.setSelectedBlurRegion(null)
            })
            controls.value.addEventListener('end', () => {
                isControlsActive = false
            })
            controls.value.addEventListener('change', () => {
                if (isControlsActive) {
                    hover.clearHoverTimeout()
                    interaction.clearHoverStates()
                    interaction.setSelectedSticker(null)
                    interaction.setSelectedBlurRegion(null)
                }
            })
        }

        if (props.images.length > 0) {
            loadPanorama(props.currentIndex)
        }
    }
})

const cleanup = () => {
    if (renderView.value) {
        renderView.value.removeEventListener('pointerdown', onPointerDown)
        renderView.value.removeEventListener('pointermove', onPointerMove)
        renderView.value.removeEventListener('pointerup', onPointerUp)
        renderView.value.removeEventListener('pointercancel', onPointerUp)
        renderView.value.removeEventListener('click', click.onClick)
        renderView.value.removeEventListener('wheel', onWheel)
    }
    hover.clearHoverTimeout()
    sprites.clearAll()
}

// --- Expose for parent ---
defineExpose({
    loadPanorama,
    displayHotspots: (image) => sprites.displayHotspots(image ? (image.hotspots_from || []) : currentHotspots.value),
    displayStickers: (image) => sprites.displayStickers(image ? (image.stickers || []) : currentStickers.value),
    displayBlurRegions: (image) => sprites.displayBlurRegions(image ? (image.blur_regions || []) : currentBlurRegions.value),
    clearSprites: sprites.clearAll,
    isLoadingFullRes,
    controls,
    camera,
    renderView,
    hotspotManager: () => sprites.hotspotManager.value,
    stickerManager: () => sprites.stickerManager.value,
    blurRegionManager: () => sprites.blurRegionManager.value,
    cleanup
})
</script>

<template>
    <div ref="renderView" class="w-full h-full touch-none"></div>
</template>
