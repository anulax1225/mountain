<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import * as THREE from 'three'
import { useThreeScene } from '@/composables/useThreeScene.js'
import { usePanoramaLoader } from '@/composables/usePanoramaLoader.js'
import { SpriteFactory, SpriteManager } from '@/lib/spriteFactory.js'
import { SPRITE, TIMING } from '@/lib/editorConstants.js'

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

const emit = defineEmits(['ready', 'hotspot-click', 'sticker-click', 'hotspot-position-selected', 'sticker-position-selected', 'hotspot-hover', 'hotspot-hover-end'])

const renderView = ref(null)
const hoveredHotspot = ref(null)
const hideHoverTimeout = ref(null)
const skipNextWatch = ref(false)

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

    // View mode - hotspot navigation
    if (props.mode === 'view' && hotspotManager) {
        const intersects = raycaster.value.intersectObjects(hotspotManager.getAll())
        if (intersects.length > 0) {
            const sprite = intersects[0].object
            const hotspot = sprite.userData.hotspot
            emit('hotspot-click', hotspot)
        }
        return
    }

    // Edit mode - sticker deletion
    if (props.mode === 'edit' && stickerManager) {
        const intersects = raycaster.value.intersectObjects(stickerManager.getAll())
        if (intersects.length > 0) {
            const sprite = intersects[0].object
            const sticker = sprite.userData.sticker
            emit('sticker-click', sticker)
        }
    }
}

// Mouse move handler for hotspot hover
const onMouseMove = (event) => {
    if (!raycaster.value || !camera.value || props.mode !== 'view' || !hotspotManager) return

    const rect = renderView.value.getBoundingClientRect()
    mouse.value.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouse.value.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    raycaster.value.setFromCamera(mouse.value, camera.value)
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
    }
}, { deep: true })

onMounted(() => {
    // Initialize Three.js
    const initialized = initThreeScene()

    if (initialized && threeScene.value) {
        // Initialize sprite managers
        hotspotManager = new SpriteManager(threeScene.value)
        stickerManager = new SpriteManager(threeScene.value)

        // Add event listeners
        renderView.value.addEventListener('click', onCanvasClick)
        renderView.value.addEventListener('mousemove', onMouseMove)

        // Load initial panorama
        if (props.images.length > 0) {
            loadPanorama(props.currentIndex)
        }
    }
})

// Cleanup on unmount (handled by composable, but cleanup event listeners)
const cleanup = () => {
    if (renderView.value) {
        renderView.value.removeEventListener('click', onCanvasClick)
        renderView.value.removeEventListener('mousemove', onMouseMove)
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
