<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import * as THREE from 'three'
import { useThreeScene } from '@/composables/useThreeScene.js'
import { usePanoramaLoader } from '@/composables/usePanoramaLoader.js'
import { SpriteFactory, SpriteManager } from '@/lib/spriteFactory.js'
import { SPRITE, TIMING, CONTROLS } from '@/lib/editorConstants.js'

const props = defineProps({
    images: Array,
    currentIndex: Number,
    mode: {
        type: String,
        default: 'view'
    },
    isCreatingHotspot: Boolean,
    isCreatingSticker: Boolean
})

const emit = defineEmits(['ready', 'hotspot-click', 'hotspot-click-edit', 'sticker-click', 'hotspot-position-selected', 'sticker-position-selected', 'hotspot-hover', 'hotspot-hover-end', 'sprite-drag-end'])

const renderView = ref(null)
const hoveredHotspot = ref(null)
const hideHoverTimeout = ref(null)
const skipNextWatch = ref(false)
const hoveredSticker = ref(null)
const selectedSticker = ref(null)

// Drag state
const isDragging = ref(false)
const draggedSprite = ref(null)
const draggedData = ref(null) // { type: 'hotspot' | 'sticker', data: original object, originalPosition }
const dragStartMouse = ref(null)
const hasDraggedBeyondThreshold = ref(false)

const DRAG_THRESHOLD_PX = 5

// Sprite managers
let hotspotManager = null
let stickerManager = null

const currentImage = computed(() => props.images[props.currentIndex])
const currentHotspots = computed(() => currentImage.value?.hotspots_from || [])
const currentStickers = computed(() => currentImage.value?.stickers || [])

// Initialize Three.js scene
const {
    threeScene,
    camera,
    renderer,
    controls,
    raycaster,
    mouse,
    textureLoader,
    init: initThreeScene
} = useThreeScene(renderView, {
    onReady: () => emit('ready')
})

// Initialize panorama loader
const {
    currentMesh,
    isTransitioning,
    loadPanorama: loadPanoramaBase
} = usePanoramaLoader(threeScene, textureLoader)

// Mouse down handler for drag start
const onMouseDown = (event) => {
    if (props.mode !== 'edit' || !raycaster.value || !camera.value) return
    if (props.isCreatingHotspot || props.isCreatingSticker) return

    const rect = renderView.value.getBoundingClientRect()
    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top

    mouse.value.x = (mouseX / rect.width) * 2 - 1
    mouse.value.y = -(mouseY / rect.height) * 2 + 1

    raycaster.value.setFromCamera(mouse.value, camera.value)

    // Check hotspots first
    if (hotspotManager) {
        const hotspotIntersects = raycaster.value.intersectObjects(hotspotManager.getAll())
        if (hotspotIntersects.length > 0) {
            draggedSprite.value = hotspotIntersects[0].object
            draggedData.value = {
                type: 'hotspot',
                data: draggedSprite.value.userData.hotspot,
                originalPosition: draggedSprite.value.position.clone()
            }
            dragStartMouse.value = { x: mouseX, y: mouseY }
            isDragging.value = true
            hasDraggedBeyondThreshold.value = false

            // Visual feedback
            if (draggedSprite.value.material) {
                draggedSprite.value.material.opacity = 0.5
                draggedSprite.value.material.transparent = true
            }

            return
        }
    }

    // Check stickers
    if (stickerManager) {
        const stickerIntersects = raycaster.value.intersectObjects(stickerManager.getAll())
        if (stickerIntersects.length > 0) {
            draggedSprite.value = stickerIntersects[0].object
            draggedData.value = {
                type: 'sticker',
                data: draggedSprite.value.userData.sticker,
                originalPosition: draggedSprite.value.position.clone()
            }
            dragStartMouse.value = { x: mouseX, y: mouseY }
            isDragging.value = true
            hasDraggedBeyondThreshold.value = false

            // Visual feedback
            if (draggedSprite.value.material) {
                draggedSprite.value.material.opacity = 0.5
                draggedSprite.value.material.transparent = true
            }

            return
        }
    }
}

// Canvas click handler
const onCanvasClick = (event) => {
    if (!raycaster.value || !camera.value || !currentMesh.value) return

    const rect = renderView.value.getBoundingClientRect()
    mouse.value.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouse.value.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    raycaster.value.setFromCamera(mouse.value, camera.value)

    // Creating hotspot
    if (props.isCreatingHotspot) {
        const intersects = raycaster.value.intersectObject(currentMesh.value)
        if (intersects.length > 0) {
            const point = intersects[0].point.clone()
            point.multiplyScalar(SPRITE.POSITION_SCALE)
            emit('hotspot-position-selected', {
                x: point.x,
                y: point.y,
                z: point.z
            })
        }
        return
    }

    // Creating sticker
    if (props.isCreatingSticker) {
        const intersects = raycaster.value.intersectObject(currentMesh.value)
        if (intersects.length > 0) {
            const point = intersects[0].point.clone()
            point.multiplyScalar(SPRITE.POSITION_SCALE)
            emit('sticker-position-selected', {
                x: point.x,
                y: point.y,
                z: point.z
            })
        }
        return
    }

    // Hotspot interaction - both view and edit modes
    if (hotspotManager && !props.isCreatingHotspot && !props.isCreatingSticker) {
        const intersects = raycaster.value.intersectObjects(hotspotManager.getAll())
        if (intersects.length > 0) {
            const sprite = intersects[0].object
            const hotspot = sprite.userData.hotspot

            if (props.mode === 'view') {
                // Navigate to target image
                emit('hotspot-click', hotspot)
            } else {
                // Edit mode - show hotspot edit options
                const screenPosition = sprite.position.clone()
                screenPosition.project(camera.value)

                const x = (screenPosition.x * 0.5 + 0.5) * renderView.value.clientWidth
                const y = (screenPosition.y * -0.5 + 0.5) * renderView.value.clientHeight

                emit('hotspot-click-edit', { hotspot, position: { x, y } })
            }
            return
        }
    }

    // Edit mode - sticker context menu
    if (props.mode === 'edit' && stickerManager) {
        const intersects = raycaster.value.intersectObjects(stickerManager.getAll())
        if (intersects.length > 0) {
            const sprite = intersects[0].object
            const sticker = sprite.userData.sticker

            // Clear previous selection
            if (selectedSticker.value && selectedSticker.value !== sprite) {
                selectedSticker.value.scale.divideScalar(1.2)
            }

            // Set new selection and keep it scaled
            selectedSticker.value = sprite
            if (!sprite.scale._x || sprite.scale._x < 1.15) { // Check if not already scaled
                sprite.scale.multiplyScalar(1.2)
            }

            // Calculate screen position for context menu
            const screenPosition = sprite.position.clone()
            screenPosition.project(camera.value)

            const x = (screenPosition.x * 0.5 + 0.5) * renderView.value.clientWidth
            const y = (screenPosition.y * -0.5 + 0.5) * renderView.value.clientHeight

            emit('sticker-click', { sticker, position: { x, y } })
        }
    }
}

// Mouse move handler for hotspot hover (view mode) and sticker hover (edit mode) and drag
const onMouseMove = (event) => {
    if (!raycaster.value || !camera.value) return

    const rect = renderView.value.getBoundingClientRect()
    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top

    mouse.value.x = (mouseX / rect.width) * 2 - 1
    mouse.value.y = -(mouseY / rect.height) * 2 + 1

    raycaster.value.setFromCamera(mouse.value, camera.value)

    // Drag handling
    if (isDragging.value && draggedSprite.value && currentMesh.value) {
        // Check drag threshold
        if (!hasDraggedBeyondThreshold.value) {
            const dx = mouseX - dragStartMouse.value.x
            const dy = mouseY - dragStartMouse.value.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < DRAG_THRESHOLD_PX) {
                return // Not yet dragging
            }
            hasDraggedBeyondThreshold.value = true
        }

        // Intersect with sphere to get new position
        const intersects = raycaster.value.intersectObject(currentMesh.value)
        if (intersects.length > 0) {
            const point = intersects[0].point.clone()
            point.multiplyScalar(SPRITE.POSITION_SCALE)
            draggedSprite.value.position.copy(point)
        }

        renderView.value.style.cursor = 'grabbing'
        return
    }

    // View mode - hotspot hover
    if (props.mode === 'view' && hotspotManager) {
        const intersects = raycaster.value.intersectObjects(hotspotManager.getAll())

        if (intersects.length > 0) {
            const sprite = intersects[0].object
            const hotspot = sprite.userData.hotspot

            if (!hoveredHotspot.value || hoveredHotspot.value.id !== hotspot.id) {
                hoveredHotspot.value = hotspot

                const screenPosition = sprite.position.clone()
                screenPosition.project(camera.value)

                const x = (screenPosition.x * 0.5 + 0.5) * renderView.value.clientWidth
                const y = (screenPosition.y * -0.5 + 0.5) * renderView.value.clientHeight

                emit('hotspot-hover', {
                    hotspot,
                    position: { x, y }
                })
            }

            if (hideHoverTimeout.value) {
                clearTimeout(hideHoverTimeout.value)
                hideHoverTimeout.value = null
            }
        } else {
            if (hoveredHotspot.value) {
                hideHoverTimeout.value = setTimeout(() => {
                    hoveredHotspot.value = null
                    emit('hotspot-hover-end')
                }, TIMING.HOVER_HIDE_DELAY_MS)
            }
        }
    }

    // Edit mode - sticker hover
    if (props.mode === 'edit' && stickerManager && !props.isCreatingHotspot && !props.isCreatingSticker) {
        const intersects = raycaster.value.intersectObjects(stickerManager.getAll())

        // Clear previous hover effect
        if (hoveredSticker.value && hoveredSticker.value !== selectedSticker.value) {
            hoveredSticker.value.scale.divideScalar(1.2)
        }

        if (intersects.length > 0) {
            const sprite = intersects[0].object
            hoveredSticker.value = sprite

            // Scale up hovered sprite (unless it's selected)
            if (sprite !== selectedSticker.value) {
                sprite.scale.multiplyScalar(1.2)
            }

            // Change cursor
            renderView.value.style.cursor = 'pointer'
        } else {
            hoveredSticker.value = null
            renderView.value.style.cursor = props.isCreatingHotspot || props.isCreatingSticker ? 'crosshair' : 'default'
        }
    }
}

// Mouse up handler for drag end
const onMouseUp = async (event) => {
    if (!isDragging.value || !draggedSprite.value) return

    // Restore visual feedback
    if (draggedSprite.value.material) {
        draggedSprite.value.material.opacity = 1.0
    }

    // If drag threshold not exceeded, treat as click (don't emit drag event)
    if (!hasDraggedBeyondThreshold.value) {
        isDragging.value = false
        draggedSprite.value = null
        draggedData.value = null
        dragStartMouse.value = null
        return
    }

    // Calculate final position
    const finalPosition = {
        x: draggedSprite.value.position.x / SPRITE.POSITION_SCALE,
        y: draggedSprite.value.position.y / SPRITE.POSITION_SCALE,
        z: draggedSprite.value.position.z / SPRITE.POSITION_SCALE
    }

    // Emit drag-end event
    emit('sprite-drag-end', {
        type: draggedData.value.type,
        data: draggedData.value.data,
        newPosition: finalPosition,
        originalPosition: {
            x: draggedData.value.originalPosition.x / SPRITE.POSITION_SCALE,
            y: draggedData.value.originalPosition.y / SPRITE.POSITION_SCALE,
            z: draggedData.value.originalPosition.z / SPRITE.POSITION_SCALE
        }
    })

    // Reset drag state
    isDragging.value = false
    draggedSprite.value = null
    draggedData.value = null
    dragStartMouse.value = null
    hasDraggedBeyondThreshold.value = false
    renderView.value.style.cursor = 'default'
}

// Wheel handler for scroll-to-zoom
const onWheel = (event) => {
    if (!camera.value || !controls.value) return

    event.preventDefault()

    const zoomSpeed = 0.1
    const delta = event.deltaY > 0 ? 1 : -1

    const currentDistance = camera.value.position.length()
    const newDistance = delta > 0
        ? Math.min(currentDistance * (1 + zoomSpeed), CONTROLS.MAX_DISTANCE)
        : Math.max(currentDistance * (1 - zoomSpeed), CONTROLS.MIN_DISTANCE)

    camera.value.position.normalize().multiplyScalar(newDistance)
    controls.value.update()
}

// Load panorama wrapper with hotspot/sticker display
const loadPanorama = async (index, transition = true, rotation = null, skipWatch = false) => {
    if (!props.images[index] || !threeScene.value) return

    if (rotation || skipWatch) {
        skipNextWatch.value = true
    }

    // Load panorama
    await loadPanoramaBase(
        `/images/${props.images[index].slug}/download`,
        transition,
        rotation,
        controls.value
    )

    // Display sprites
    displayHotspots()
    displayStickers()
}

// Display hotspot sprites
const displayHotspots = () => {
    if (!hotspotManager) return

    hotspotManager.clear()

    console.log('Displaying hotspots:', currentHotspots.value)

    currentHotspots.value.forEach(hotspot => {
        console.log('Creating sprite for hotspot:', hotspot.slug, hotspot)

        const sprite = SpriteFactory.createHotspotSprite(hotspot)
        SpriteFactory.positionSprite(sprite, {
            x: hotspot.position_x,
            y: hotspot.position_y,
            z: hotspot.position_z
        })

        hotspotManager.add(sprite, { hotspot })
    })

    console.log('Hotspot sprites created:', hotspotManager.getAll().length)
}

// Display sticker sprites
const displayStickers = () => {
    if (!stickerManager) return

    stickerManager.clear()

    console.log('Displaying stickers:', currentStickers.value)

    currentStickers.value.forEach(sticker => {
        console.log('Creating sprite for sticker:', sticker.slug, sticker)

        const sprite = SpriteFactory.createStickerSprite(sticker)
        SpriteFactory.positionSprite(sprite, {
            x: sticker.position_x,
            y: sticker.position_y,
            z: sticker.position_z
        })

        stickerManager.add(sprite, { sticker })
    })

    console.log('Sticker sprites created:', stickerManager.getAll().length)
}

// Watch for image index changes
watch(() => props.currentIndex, (newIndex) => {
    if (skipNextWatch.value) {
        skipNextWatch.value = false
        return
    }
    loadPanorama(newIndex)
})

// Watch for hotspot changes
watch(currentHotspots, () => {
    console.log('Hotspots changed, re-displaying:', currentHotspots.value)
    if (threeScene.value) {
        displayHotspots()
    }
}, { deep: true })

// Watch for sticker changes
watch(currentStickers, () => {
    console.log('Stickers changed, re-displaying:', currentStickers.value)
    if (threeScene.value) {
        displayStickers()
        // Clear selection when stickers change
        selectedSticker.value = null
        hoveredSticker.value = null
    }
}, { deep: true })

// Watch for mode changes to reset selection
watch(() => props.mode, () => {
    if (selectedSticker.value) {
        selectedSticker.value.scale.divideScalar(1.2)
        selectedSticker.value = null
    }
    hoveredSticker.value = null
    if (renderView.value) {
        renderView.value.style.cursor = 'default'
    }
})

// Watch for creation mode changes to update cursor
watch([() => props.isCreatingHotspot, () => props.isCreatingSticker], ([creatingHotspot, creatingSticker]) => {
    if (!renderView.value) return

    if (creatingHotspot || creatingSticker) {
        renderView.value.style.cursor = 'crosshair'
    } else {
        // When exiting creation mode, always reset cursor to default
        // The mousemove handler will update it to 'pointer' if hovering over a sticker
        renderView.value.style.cursor = 'default'
    }
})

onMounted(() => {
    // Initialize Three.js
    const initialized = initThreeScene()

    if (initialized && threeScene.value) {
        // Initialize sprite managers
        hotspotManager = new SpriteManager(threeScene.value)
        stickerManager = new SpriteManager(threeScene.value)

        // Add event listeners
        renderView.value.addEventListener('mousedown', onMouseDown)
        renderView.value.addEventListener('mouseup', onMouseUp)
        renderView.value.addEventListener('click', onCanvasClick)
        renderView.value.addEventListener('mousemove', onMouseMove)
        renderView.value.addEventListener('wheel', onWheel, { passive: false })

        // Load initial panorama
        if (props.images.length > 0) {
            loadPanorama(props.currentIndex)
        }
    }
})

// Cleanup on unmount (handled by composable, but cleanup event listeners)
const cleanup = () => {
    if (renderView.value) {
        renderView.value.removeEventListener('mousedown', onMouseDown)
        renderView.value.removeEventListener('mouseup', onMouseUp)
        renderView.value.removeEventListener('click', onCanvasClick)
        renderView.value.removeEventListener('mousemove', onMouseMove)
        renderView.value.removeEventListener('wheel', onWheel)
    }
    if (hideHoverTimeout.value) {
        clearTimeout(hideHoverTimeout.value)
    }

    // Clear sprite managers
    if (hotspotManager) hotspotManager.clear()
    if (stickerManager) stickerManager.clear()
}

// Expose methods for parent component
defineExpose({
    loadPanorama,
    displayHotspots,
    displayStickers,
    controls,
    cleanup
})
</script>

<template>
    <div ref="renderView" class="w-full h-full"></div>
</template>
