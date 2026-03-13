<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useThreeScene } from '@/composables/useThreeScene.js'
import { usePanoramaLoader } from '@/composables/usePanoramaLoader.js'
import { useInjectedEditorInteraction } from '@/composables/useEditorInteraction.js'
import { useSpriteDisplay } from '@/composables/useSpriteDisplay.js'
import { useCanvasCursor } from '@/composables/useCanvasCursor.js'
import { useSpriteDrag } from '@/composables/useSpriteDrag.js'
import { useHoverDetection } from '@/composables/useHoverDetection.js'
import { useCanvasClick } from '@/composables/useCanvasClick.js'
import { CONTROLS, ZOOM } from '@/lib/editorConstants.js'
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
})

const emit = defineEmits([
    'ready',
    'hotspot-click',
    'hotspot-click-edit',
    'sticker-click',
    'hotspot-position-selected',
    'sticker-position-selected',
    'sprite-drag-end',
])

const renderView = ref(null)
const skipNextWatch = ref(false)
const isLoadingPanorama = ref(false)

const { getImagePreview } = useImagePath()
const interaction = useInjectedEditorInteraction()

const currentImage = computed(() => props.images[props.currentIndex])
const currentHotspots = computed(() => currentImage.value?.hotspots_from || [])
const currentStickers = computed(() => currentImage.value?.stickers || [])

// --- Core Three.js ---
const {
    threeScene, camera, controls, raycaster, mouse, textureLoader,
    init: initThreeScene
} = useThreeScene(renderView, {
    onReady: () => emit('ready')
})

// --- Panorama loader ---
const {
    currentMesh, loadPanorama: loadPanoramaBase, preloadImages, cancelPreloads
} = usePanoramaLoader(threeScene, textureLoader)

// --- Sprite display ---
const sprites = useSpriteDisplay(threeScene, interaction)

// --- Cursor ---
const { setCursor, resetCursor } = useCanvasCursor(renderView, {
    mode: () => props.mode,
    isCreatingHotspot: () => props.isCreatingHotspot,
    isCreatingSticker: () => props.isCreatingSticker,
})

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
    clearHoverTimeout: hover.clearHoverTimeout,
    onHotspotClick: (hotspot) => emit('hotspot-click', hotspot),
    onHotspotClickEdit: (payload) => emit('hotspot-click-edit', payload),
    onStickerClick: (payload) => emit('sticker-click', payload),
    onHotspotPositionSelected: (pos) => emit('hotspot-position-selected', pos),
    onStickerPositionSelected: (pos) => emit('sticker-position-selected', pos),
})

// --- Mouse move orchestrator ---
const onMouseMove = (event) => {
    if (!raycaster.value || !camera.value) return

    const rect = renderView.value.getBoundingClientRect()
    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top

    mouse.value.x = (mouseX / rect.width) * 2 - 1
    mouse.value.y = -(mouseY / rect.height) * 2 + 1
    raycaster.value.setFromCamera(mouse.value, camera.value)

    // Drag takes priority
    if (drag.onMouseMove(event)) return

    // Hover detection
    hover.onMouseMove(mouseX, mouseY)
}

// --- Wheel zoom ---
const onWheel = (event) => {
    if (!camera.value || !controls.value) return

    event.preventDefault()

    const delta = event.deltaY > 0 ? 1 : -1
    const currentDistance = camera.value.position.length()
    const newDistance = delta > 0
        ? Math.min(currentDistance * (1 + ZOOM.SPEED), CONTROLS.MAX_DISTANCE)
        : Math.max(currentDistance * (1 - ZOOM.SPEED), CONTROLS.MIN_DISTANCE)

    camera.value.position.normalize().multiplyScalar(newDistance)
    controls.value.update()
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

    isLoadingPanorama.value = false

    await fullResReady

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

// --- Lifecycle ---
onMounted(() => {
    const initialized = initThreeScene()

    if (initialized && threeScene.value) {
        sprites.init(threeScene.value)

        renderView.value.addEventListener('mousedown', drag.onMouseDown)
        renderView.value.addEventListener('mouseup', drag.onMouseUp)
        renderView.value.addEventListener('click', click.onClick)
        renderView.value.addEventListener('mousemove', onMouseMove)
        renderView.value.addEventListener('wheel', onWheel, { passive: false })

        if (controls.value) {
            let isControlsActive = false
            controls.value.addEventListener('start', () => {
                isControlsActive = true
                hover.clearHoverTimeout()
                interaction.clearHoverStates()
                interaction.setSelectedSticker(null)
            })
            controls.value.addEventListener('end', () => {
                isControlsActive = false
            })
            controls.value.addEventListener('change', () => {
                if (isControlsActive) {
                    hover.clearHoverTimeout()
                    interaction.clearHoverStates()
                    interaction.setSelectedSticker(null)
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
        renderView.value.removeEventListener('mousedown', drag.onMouseDown)
        renderView.value.removeEventListener('mouseup', drag.onMouseUp)
        renderView.value.removeEventListener('click', click.onClick)
        renderView.value.removeEventListener('mousemove', onMouseMove)
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
    clearSprites: sprites.clearAll,
    controls,
    camera,
    renderView,
    hotspotManager: () => sprites.hotspotManager.value,
    stickerManager: () => sprites.stickerManager.value,
    cleanup
})
</script>

<template>
    <div ref="renderView" class="w-full h-full"></div>
</template>
