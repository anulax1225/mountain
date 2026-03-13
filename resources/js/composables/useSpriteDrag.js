import { ref, toValue } from 'vue'
import { SPRITE, TIMING, INTERACTION } from '@/lib/editorConstants.js'

/**
 * Composable for sprite drag-and-drop in the 360° editor
 *
 * @param {object} options
 * @param {import('vue').Ref} options.containerRef - Canvas container element ref
 * @param {import('vue').Ref} options.camera - Three.js camera ref
 * @param {import('vue').Ref} options.controls - OrbitControls ref
 * @param {import('vue').Ref} options.raycaster - Raycaster ref
 * @param {import('vue').Ref} options.mouse - Mouse vector ref
 * @param {import('vue').Ref} options.currentMesh - Current panorama mesh ref
 * @param {object} options.spriteDisplay - useSpriteDisplay instance
 * @param {import('vue').Ref<string>} options.mode - Editor mode
 * @param {import('vue').Ref<boolean>} options.isCreatingHotspot
 * @param {import('vue').Ref<boolean>} options.isCreatingSticker
 * @param {Function} options.onDragEnd - Callback when drag completes
 * @param {Function} options.setCursor - Cursor setter from useCanvasCursor
 */
export function useSpriteDrag({
    containerRef,
    camera,
    controls,
    raycaster,
    mouse,
    currentMesh,
    spriteDisplay,
    mode,
    isCreatingHotspot,
    isCreatingSticker,
    onDragEnd,
    setCursor,
}) {
    const isDragging = ref(false)
    const draggedSprite = ref(null)
    const draggedData = ref(null)
    const dragStartMouse = ref(null)
    const hasDraggedBeyondThreshold = ref(false)
    const justFinishedDrag = ref(false)

    const onMouseDown = (event) => {
        if (toValue(mode) !== 'edit' || !raycaster.value || !camera.value) return
        if (toValue(isCreatingHotspot) || toValue(isCreatingSticker)) return

        const rect = containerRef.value.getBoundingClientRect()
        const mouseX = event.clientX - rect.left
        const mouseY = event.clientY - rect.top

        mouse.value.x = (mouseX / rect.width) * 2 - 1
        mouse.value.y = -(mouseY / rect.height) * 2 + 1

        raycaster.value.setFromCamera(mouse.value, camera.value)

        // Check hotspots first, then stickers
        const managers = [
            { manager: spriteDisplay.hotspotManager.value, type: 'hotspot', dataKey: 'hotspot' },
            { manager: spriteDisplay.stickerManager.value, type: 'sticker', dataKey: 'sticker' },
        ]

        for (const { manager, type, dataKey } of managers) {
            if (!manager) continue
            const intersects = raycaster.value.intersectObjects(manager.getAll())
            if (intersects.length > 0) {
                draggedSprite.value = intersects[0].object
                draggedData.value = {
                    type,
                    data: draggedSprite.value.userData[dataKey],
                    originalPosition: draggedSprite.value.position.clone()
                }
                dragStartMouse.value = { x: mouseX, y: mouseY }
                isDragging.value = true
                hasDraggedBeyondThreshold.value = false

                if (controls.value) {
                    controls.value.enabled = false
                }

                if (draggedSprite.value.material) {
                    draggedSprite.value.material.opacity = 0.5
                    draggedSprite.value.material.transparent = true
                }

                return
            }
        }
    }

    /**
     * Handle mouse move during drag
     * @returns {boolean} true if drag consumed the event
     */
    const onMouseMove = (event) => {
        if (!isDragging.value || !draggedSprite.value || !currentMesh.value) return false

        const rect = containerRef.value.getBoundingClientRect()
        const mouseX = event.clientX - rect.left
        const mouseY = event.clientY - rect.top

        // Check drag threshold
        if (!hasDraggedBeyondThreshold.value) {
            const dx = mouseX - dragStartMouse.value.x
            const dy = mouseY - dragStartMouse.value.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < INTERACTION.DRAG_THRESHOLD_PX) {
                return true // Consumed but not yet dragging
            }
            hasDraggedBeyondThreshold.value = true
        }

        mouse.value.x = (mouseX / rect.width) * 2 - 1
        mouse.value.y = -(mouseY / rect.height) * 2 + 1
        raycaster.value.setFromCamera(mouse.value, camera.value)

        // Intersect with sphere to get new position
        const intersects = raycaster.value.intersectObject(currentMesh.value)
        if (intersects.length > 0) {
            const point = intersects[0].point.clone()
            point.multiplyScalar(SPRITE.POSITION_SCALE)
            draggedSprite.value.position.copy(point)
        }

        setCursor('grabbing')
        return true
    }

    const onMouseUp = () => {
        if (!isDragging.value || !draggedSprite.value) return

        // Re-enable camera rotation
        if (controls.value) {
            controls.value.enabled = true
        }

        // Restore visual feedback
        if (draggedSprite.value.material) {
            draggedSprite.value.material.opacity = 1.0
        }

        // If drag threshold not exceeded, treat as click
        if (!hasDraggedBeyondThreshold.value) {
            isDragging.value = false
            draggedSprite.value = null
            draggedData.value = null
            dragStartMouse.value = null
            return
        }

        // Prevent hover scaling right after drop
        if (draggedData.value.type === 'sticker') {
            justFinishedDrag.value = true
            setTimeout(() => {
                justFinishedDrag.value = false
            }, TIMING.DRAG_FINISH_DELAY_MS)
        }

        // Calculate final position
        const finalPosition = {
            x: draggedSprite.value.position.x / SPRITE.POSITION_SCALE,
            y: draggedSprite.value.position.y / SPRITE.POSITION_SCALE,
            z: draggedSprite.value.position.z / SPRITE.POSITION_SCALE
        }

        onDragEnd({
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
        setCursor('default')
    }

    return {
        isDragging,
        justFinishedDrag,
        onMouseDown,
        onMouseMove,
        onMouseUp,
    }
}
