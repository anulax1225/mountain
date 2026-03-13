import { toValue } from 'vue'
import { SPRITE } from '@/lib/editorConstants.js'

/**
 * Composable for canvas click handling in the 360° editor
 *
 * Routes clicks based on mode and creation state:
 * - Creating hotspot/sticker: position selection on sphere
 * - View mode: hotspot navigation
 * - Edit mode: hotspot edit, sticker context menu
 * - Empty space: clear interaction state
 *
 * @param {object} options
 * @param {import('vue').Ref} options.containerRef - Canvas container element ref
 * @param {import('vue').Ref} options.camera - Three.js camera ref
 * @param {import('vue').Ref} options.raycaster - Raycaster ref
 * @param {import('vue').Ref} options.mouse - Mouse vector ref
 * @param {import('vue').Ref} options.currentMesh - Current panorama mesh ref
 * @param {object} options.spriteDisplay - useSpriteDisplay instance
 * @param {object} options.interaction - useEditorInteraction instance
 * @param {import('vue').Ref<string>} options.mode - Editor mode
 * @param {import('vue').Ref<boolean>} options.isCreatingHotspot
 * @param {import('vue').Ref<boolean>} options.isCreatingSticker
 * @param {Function} options.clearHoverTimeout - From useHoverDetection
 * @param {Function} options.onHotspotClick - Callback for hotspot click (view mode navigation)
 * @param {Function} options.onHotspotClickEdit - Callback for hotspot click (edit mode)
 * @param {Function} options.onStickerClick - Callback for sticker click (edit mode context menu)
 * @param {Function} options.onHotspotPositionSelected - Callback for hotspot position selection
 * @param {Function} options.onStickerPositionSelected - Callback for sticker position selection
 */
export function useCanvasClick({
    containerRef,
    camera,
    raycaster,
    mouse,
    currentMesh,
    spriteDisplay,
    interaction,
    mode,
    isCreatingHotspot,
    isCreatingSticker,
    clearHoverTimeout,
    onHotspotClick,
    onHotspotClickEdit,
    onStickerClick,
    onHotspotPositionSelected,
    onStickerPositionSelected,
}) {
    const onClick = (event) => {
        if (!raycaster.value || !camera.value || !currentMesh.value) return

        const rect = containerRef.value.getBoundingClientRect()
        mouse.value.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
        mouse.value.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

        raycaster.value.setFromCamera(mouse.value, camera.value)

        // Creating hotspot
        if (toValue(isCreatingHotspot)) {
            const intersects = raycaster.value.intersectObject(currentMesh.value)
            if (intersects.length > 0) {
                const point = intersects[0].point.clone()
                point.multiplyScalar(SPRITE.POSITION_SCALE)
                onHotspotPositionSelected({ x: point.x, y: point.y, z: point.z })
            }
            return
        }

        // Creating sticker
        if (toValue(isCreatingSticker)) {
            const intersects = raycaster.value.intersectObject(currentMesh.value)
            if (intersects.length > 0) {
                const point = intersects[0].point.clone()
                point.multiplyScalar(SPRITE.POSITION_SCALE)
                onStickerPositionSelected({ x: point.x, y: point.y, z: point.z })
            }
            return
        }

        // Hotspot interaction - both view and edit modes
        const hotspotManager = spriteDisplay.hotspotManager.value
        if (hotspotManager) {
            const intersects = raycaster.value.intersectObjects(hotspotManager.getAll())
            if (intersects.length > 0) {
                const sprite = intersects[0].object
                const hotspot = sprite.userData.hotspot

                clearHoverTimeout()

                if (toValue(mode) === 'view') {
                    onHotspotClick(hotspot)
                } else {
                    const screenPosition = sprite.position.clone()
                    screenPosition.project(camera.value)

                    const x = (screenPosition.x * 0.5 + 0.5) * containerRef.value.clientWidth
                    const y = (screenPosition.y * -0.5 + 0.5) * containerRef.value.clientHeight

                    onHotspotClickEdit({ hotspot, position: { x, y } })
                }
                return
            }
        }

        // Edit mode - sticker context menu
        const stickerManager = spriteDisplay.stickerManager.value
        if (toValue(mode) === 'edit' && stickerManager) {
            const intersects = raycaster.value.intersectObjects(stickerManager.getAll())
            if (intersects.length > 0) {
                const sprite = intersects[0].object
                const sticker = sprite.userData.sticker

                clearHoverTimeout()

                if (sticker?.slug !== interaction.selectedStickerSlug.value) {
                    interaction.setSelectedSticker(sticker?.slug)
                }

                const screenPosition = sprite.position.clone()
                screenPosition.project(camera.value)

                const x = (screenPosition.x * 0.5 + 0.5) * containerRef.value.clientWidth
                const y = (screenPosition.y * -0.5 + 0.5) * containerRef.value.clientHeight

                onStickerClick({ sticker, position: { x, y } })
                return
            }
        }

        // Clicked on empty space - clear all interaction states
        clearHoverTimeout()
        interaction.clearHoverStates()
        interaction.setSelectedSticker(null)
    }

    return { onClick }
}
