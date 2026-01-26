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
    isCreatingSticker: Boolean,
    // Interaction state (controlled by parent via useEditorInteraction)
    hoveredHotspotSlug: {
        type: String,
        default: null
    },
    hoveredStickerSlug: {
        type: String,
        default: null
    },
    selectedStickerSlug: {
        type: String,
        default: null
    }
})

const emit = defineEmits([
    'ready',
    'hotspot-click',
    'hotspot-click-edit',
    'sticker-click',
    'hotspot-position-selected',
    'sticker-position-selected',
    'hotspot-hover-start',
    'hotspot-hover-end',
    'sticker-hover-start',
    'sticker-hover-end',
    'sticker-select',
    'sprite-drag-end',
    'camera-move'
])

const renderView = ref(null)
const hideHoverTimeout = ref(null)
const skipNextWatch = ref(false)
const isLoadingPanorama = ref(false)
const lastHoverStartTime = ref(0) // Track when we last started hovering to prevent rapid toggling

// Scale multipliers - must match useEditorInteraction
const HOVER_SCALE = 1.15
const SELECTED_SCALE = 1.25

// Drag state
const isDragging = ref(false)
const draggedSprite = ref(null)
const draggedData = ref(null) // { type: 'hotspot' | 'sticker', data: original object, originalPosition }
const dragStartMouse = ref(null)
const hasDraggedBeyondThreshold = ref(false)
const justFinishedDrag = ref(false) // Prevents hover scaling right after drop
const draggedStickerSlug = ref(null) // Track which sticker was just dragged

const DRAG_THRESHOLD_PX = 5

// Sprite managers
let hotspotManager = null
let stickerManager = null

const currentImage = computed(() => props.images[props.currentIndex])

/**
 * Apply interaction scales to all sprites based on current interaction props
 * This is idempotent - safe to call multiple times
 */
const applyInteractionScales = () => {
    // Apply hotspot scales
    if (hotspotManager) {
        hotspotManager.getAll().forEach(sprite => {
            const slug = sprite.userData.hotspot?.slug
            const baseScale = sprite.userData.baseScale
            if (!slug || !baseScale) return

            const isHovered = slug === props.hoveredHotspotSlug
            const multiplier = isHovered ? HOVER_SCALE : 1.0

            sprite.scale.set(
                baseScale.x * multiplier,
                baseScale.y * multiplier,
                baseScale.z * multiplier
            )
        })
    }

    // Apply sticker scales
    if (stickerManager) {
        stickerManager.getAll().forEach(sprite => {
            const slug = sprite.userData.sticker?.slug
            const baseScale = sprite.userData.baseScale
            if (!slug || !baseScale) return

            const isSelected = slug === props.selectedStickerSlug
            const isHovered = slug === props.hoveredStickerSlug
            let multiplier = 1.0

            if (isSelected) {
                multiplier = SELECTED_SCALE
            } else if (isHovered) {
                multiplier = HOVER_SCALE
            }

            sprite.scale.set(
                baseScale.x * multiplier,
                baseScale.y * multiplier,
                baseScale.z * multiplier
            )
        })
    }
}

// Watch for interaction prop changes to apply scales
watch(
    [() => props.hoveredHotspotSlug, () => props.hoveredStickerSlug, () => props.selectedStickerSlug],
    () => {
        applyInteractionScales()
    }
)
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

            // Disable camera rotation during drag
            if (controls.value) {
                controls.value.enabled = false
            }

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

            // Disable camera rotation during drag
            if (controls.value) {
                controls.value.enabled = false
            }

            // Visual feedback
            if (draggedSprite.value.material) {
                draggedSprite.value.material.opacity = 0.5
                draggedSprite.value.material.transparent = true
            }

            return
        }
    }
}

// Helper function to clear hover timeout immediately
const clearHoverTimeout = () => {
    if (hideHoverTimeout.value) {
        clearTimeout(hideHoverTimeout.value)
        hideHoverTimeout.value = null
    }
    lastHoverStartTime.value = 0 // Reset hover start time
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

            // Clear any pending hover timeouts
            clearHoverTimeout()

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

            // Clear any pending hover timeouts
            clearHoverTimeout()

            // Emit selection event - parent handles state
            if (sticker?.slug !== props.selectedStickerSlug) {
                emit('sticker-select', { slug: sticker?.slug })
            }

            // Calculate screen position for context menu
            const screenPosition = sprite.position.clone()
            screenPosition.project(camera.value)

            const x = (screenPosition.x * 0.5 + 0.5) * renderView.value.clientWidth
            const y = (screenPosition.y * -0.5 + 0.5) * renderView.value.clientHeight

            emit('sticker-click', { sticker, position: { x, y } })
            return
        }
    }

    // If we reach here, user clicked on empty space - clear all interaction states
    clearHoverTimeout()
    emit('camera-move')
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

            // Emit hover-start if different hotspot (compare by slug)
            if (hotspot?.slug !== props.hoveredHotspotSlug) {
                const screenPosition = sprite.position.clone()
                screenPosition.project(camera.value)

                const x = (screenPosition.x * 0.5 + 0.5) * renderView.value.clientWidth
                const y = (screenPosition.y * -0.5 + 0.5) * renderView.value.clientHeight

                // Record when we started hovering to prevent rapid toggling
                lastHoverStartTime.value = Date.now()

                emit('hotspot-hover-start', {
                    slug: hotspot?.slug,
                    hotspot,
                    position: { x, y }
                })
            }

            if (hideHoverTimeout.value) {
                clearTimeout(hideHoverTimeout.value)
                hideHoverTimeout.value = null
            }
        } else {
            // Emit hover-end with delay, but only if enough time has passed since hover-start
            // This prevents rapid toggling when the popover blocks the raycaster
            if (props.hoveredHotspotSlug) {
                const timeSinceHoverStart = Date.now() - lastHoverStartTime.value
                const minHoverTime = 300 // Minimum time (ms) hotspot must be hovered before allowing hide

                if (hideHoverTimeout.value) {
                    clearTimeout(hideHoverTimeout.value)
                }

                // Only schedule hide if we've been hovering long enough
                if (timeSinceHoverStart >= minHoverTime) {
                    hideHoverTimeout.value = setTimeout(() => {
                        emit('hotspot-hover-end')
                    }, TIMING.HOVER_HIDE_DELAY_MS)
                }
            }
        }
    }

    // Edit mode - sticker hover (skip if we just finished dragging)
    if (props.mode === 'edit' && stickerManager && !props.isCreatingHotspot && !props.isCreatingSticker && !justFinishedDrag.value) {
        const intersects = raycaster.value.intersectObjects(stickerManager.getAll())

        if (intersects.length > 0) {
            const sprite = intersects[0].object
            const sticker = sprite.userData.sticker

            // Emit hover-start if different sticker (compare by slug)
            if (sticker?.slug !== props.hoveredStickerSlug) {
                emit('sticker-hover-start', { slug: sticker?.slug })
            }

            // Change cursor
            renderView.value.style.cursor = 'pointer'
        } else {
            // Mouse left all stickers - emit hover-end
            if (props.hoveredStickerSlug) {
                emit('sticker-hover-end')
            }
            renderView.value.style.cursor = props.isCreatingHotspot || props.isCreatingSticker ? 'crosshair' : 'default'
        }
    }
}

// Mouse up handler for drag end
const onMouseUp = async (event) => {
    if (!isDragging.value || !draggedSprite.value) return

    // Re-enable camera rotation
    if (controls.value) {
        controls.value.enabled = true
    }

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

    // Store the dragged sticker slug to prevent hover scaling after drop
    if (draggedData.value.type === 'sticker') {
        draggedStickerSlug.value = draggedData.value.data.slug
        justFinishedDrag.value = true
        // Clear the flag after a short delay
        setTimeout(() => {
            justFinishedDrag.value = false
            draggedStickerSlug.value = null
        }, 500)
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

// Clear all sprites (hotspots and stickers)
const clearSprites = () => {
    if (hotspotManager) hotspotManager.clear()
    if (stickerManager) stickerManager.clear()
}

// Load panorama wrapper with hotspot/sticker display
const loadPanorama = async (index, transition = true, rotation = null, skipWatch = false) => {
    if (!props.images[index] || !threeScene.value) return

    if (rotation || skipWatch) {
        skipNextWatch.value = true
    }

    // Set loading flag to prevent watchers from displaying sprites prematurely
    isLoadingPanorama.value = true

    // Clear sprites BEFORE transition starts
    clearSprites()

    // Load panorama (includes fade out/in transition)
    await loadPanoramaBase(
        `/images/${props.images[index].slug}/download`,
        transition,
        rotation,
        controls.value
    )

    // Display sprites AFTER transition completes
    displayHotspots()
    displayStickers()

    // Clear loading flag
    isLoadingPanorama.value = false
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

    // Apply interaction scales after creating sprites
    applyInteractionScales()
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

    // Apply interaction scales after creating sprites
    applyInteractionScales()
}

// Watch for image index changes
watch(() => props.currentIndex, (newIndex) => {
    if (skipNextWatch.value) {
        skipNextWatch.value = false
        return
    }
    loadPanorama(newIndex)
})

// Watch for hotspot changes (but not during panorama loading)
watch(currentHotspots, () => {
    console.log('Hotspots changed, re-displaying:', currentHotspots.value)
    if (threeScene.value && !isLoadingPanorama.value) {
        displayHotspots()
    }
}, { deep: true })

// Watch for sticker changes (but not during panorama loading)
watch(currentStickers, () => {
    console.log('Stickers changed, re-displaying:', currentStickers.value)
    if (threeScene.value && !isLoadingPanorama.value) {
        displayStickers()
        applyInteractionScales()
    }
}, { deep: true })

// Watch for mode changes to reset cursor
watch(() => props.mode, () => {
    if (renderView.value) {
        renderView.value.style.cursor = 'default'
    }
    // Parent will clear interaction state via clearAllStates
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

        // Listen for camera movement to close panels
        if (controls.value) {
            controls.value.addEventListener('change', () => {
                // Clear hover timeout to prevent delayed popover appearance
                clearHoverTimeout()
                emit('camera-move')
            })
        }

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
    clearHoverTimeout()

    // Clear sprite managers
    if (hotspotManager) hotspotManager.clear()
    if (stickerManager) stickerManager.clear()
}

// Expose methods and refs for parent component
defineExpose({
    loadPanorama,
    displayHotspots,
    displayStickers,
    clearSprites,
    controls,
    camera,
    renderView,
    hotspotManager: () => hotspotManager,
    stickerManager: () => stickerManager,
    cleanup
})
</script>

<template>
    <div ref="renderView" class="w-full h-full"></div>
</template>
