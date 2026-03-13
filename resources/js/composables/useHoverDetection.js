import { ref, toValue } from 'vue'
import { INTERACTION, TIMING } from '@/lib/editorConstants.js'

/**
 * Composable for hover detection on sprites in the 360° editor
 *
 * Hotspots (view mode): screen-space distance with hysteresis
 * Stickers (edit mode): raycaster intersection
 *
 * @param {object} options
 * @param {import('vue').Ref} options.containerRef - Canvas container element ref
 * @param {import('vue').Ref} options.camera - Three.js camera ref
 * @param {import('vue').Ref} options.raycaster - Raycaster ref
 * @param {object} options.spriteDisplay - useSpriteDisplay instance
 * @param {object} options.interaction - useEditorInteraction instance
 * @param {import('vue').Ref<string>} options.mode - Editor mode
 * @param {import('vue').Ref<boolean>} options.isCreatingHotspot
 * @param {import('vue').Ref<boolean>} options.isCreatingSticker
 * @param {import('vue').Ref<boolean>} options.justFinishedDrag - From useSpriteDrag
 * @param {Function} options.setCursor - Cursor setter from useCanvasCursor
 * @param {Function} options.resetCursor - Cursor resetter from useCanvasCursor
 */
export function useHoverDetection({
    containerRef,
    camera,
    raycaster,
    spriteDisplay,
    interaction,
    mode,
    isCreatingHotspot,
    isCreatingSticker,
    justFinishedDrag,
    setCursor,
    resetCursor,
}) {
    const hideHoverTimeout = ref(null)

    const clearHoverTimeout = () => {
        if (hideHoverTimeout.value) {
            clearTimeout(hideHoverTimeout.value)
            hideHoverTimeout.value = null
        }
    }

    /**
     * Detect hotspot hover using screen-space distance (view mode)
     */
    const detectHotspotHover = (mouseX, mouseY) => {
        const manager = spriteDisplay.hotspotManager.value
        if (!manager) return

        const sprites = manager.getAll()
        let closestSlug = null
        let closestDistance = Infinity
        let closestScreenPos = null

        for (const sprite of sprites) {
            const screenPos = sprite.position.clone()
            screenPos.project(camera.value)

            // Skip sprites behind the camera
            if (screenPos.z > 1) continue

            const sx = (screenPos.x * 0.5 + 0.5) * containerRef.value.clientWidth
            const sy = (screenPos.y * -0.5 + 0.5) * containerRef.value.clientHeight

            const dx = mouseX - sx
            const dy = mouseY - sy
            const dist = Math.sqrt(dx * dx + dy * dy)

            if (dist < closestDistance) {
                closestDistance = dist
                closestSlug = sprite.userData.hotspot?.slug
                closestScreenPos = { x: sx, y: sy }
            }
        }

        // Hysteresis: smaller threshold to enter, larger to maintain
        const isCurrentlyHovered = interaction.hoveredHotspotSlug.value && interaction.hoveredHotspotSlug.value === closestSlug
        const threshold = isCurrentlyHovered
            ? INTERACTION.HOVER_DISTANCE_PX
            : INTERACTION.HOVER_ENTER_DISTANCE_PX

        if (closestSlug && closestDistance <= threshold) {
            if (closestSlug !== interaction.hoveredHotspotSlug.value) {
                interaction.setHoveredHotspotWithPosition(closestSlug, closestScreenPos)
            }
            if (hideHoverTimeout.value) {
                clearTimeout(hideHoverTimeout.value)
                hideHoverTimeout.value = null
            }
        } else {
            if (interaction.hoveredHotspotSlug.value && !hideHoverTimeout.value) {
                hideHoverTimeout.value = setTimeout(() => {
                    interaction.clearHotspotHoverIfNotPopover()
                }, TIMING.HOVER_HIDE_DELAY_MS)
            }
        }
    }

    /**
     * Detect sticker hover using raycaster (edit mode)
     */
    const detectStickerHover = () => {
        const manager = spriteDisplay.stickerManager.value
        if (!manager) return

        const intersects = raycaster.value.intersectObjects(manager.getAll())

        if (intersects.length > 0) {
            const sprite = intersects[0].object
            const sticker = sprite.userData.sticker

            if (sticker?.slug !== interaction.hoveredStickerSlug.value) {
                interaction.setHoveredSticker(sticker?.slug)
            }

            setCursor('pointer')
        } else {
            if (interaction.hoveredStickerSlug.value) {
                interaction.setHoveredSticker(null)
            }
            resetCursor()
        }
    }

    /**
     * Main mouse move handler for hover detection
     * Call this after drag handling has been checked
     */
    const onMouseMove = (mouseX, mouseY) => {
        // View mode - hotspot hover
        if (toValue(mode) === 'view' && spriteDisplay.hotspotManager.value) {
            detectHotspotHover(mouseX, mouseY)
        }

        // Edit mode - sticker hover (skip if just finished dragging)
        if (toValue(mode) === 'edit' && spriteDisplay.stickerManager.value
            && !toValue(isCreatingHotspot) && !toValue(isCreatingSticker)
            && !toValue(justFinishedDrag)) {
            detectStickerHover()
        }
    }

    return {
        hideHoverTimeout,
        clearHoverTimeout,
        onMouseMove,
    }
}
