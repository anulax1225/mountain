import { watch, toValue } from 'vue'

/**
 * Composable for managing canvas cursor based on editor state
 *
 * @param {import('vue').Ref} containerRef - Canvas container element ref
 * @param {object} options - Reactive options
 * @param {import('vue').Ref<string>} options.mode - Current editor mode ('view' | 'edit')
 * @param {import('vue').Ref<boolean>} options.isCreatingHotspot - Whether creating a hotspot
 * @param {import('vue').Ref<boolean>} options.isCreatingSticker - Whether creating a sticker
 * @param {import('vue').Ref<boolean>} options.isCreatingBlurRegion - Whether creating a blur region
 */
export function useCanvasCursor(containerRef, { mode, isCreatingHotspot, isCreatingSticker, isCreatingBlurRegion }) {
    const setCursor = (cursor) => {
        if (containerRef.value) {
            containerRef.value.style.cursor = cursor
        }
    }

    const resetCursor = () => {
        if (toValue(isCreatingHotspot) || toValue(isCreatingSticker) || toValue(isCreatingBlurRegion)) {
            setCursor('crosshair')
        } else {
            setCursor('default')
        }
    }

    // Watch for mode changes to reset cursor
    watch(() => toValue(mode), () => {
        setCursor('default')
    })

    // Watch for creation mode changes to update cursor
    watch(
        [() => toValue(isCreatingHotspot), () => toValue(isCreatingSticker), () => toValue(isCreatingBlurRegion)],
        ([creatingHotspot, creatingSticker, creatingBlurRegion]) => {
            if (!containerRef.value) return

            if (creatingHotspot || creatingSticker || creatingBlurRegion) {
                setCursor('crosshair')
            } else {
                setCursor('default')
            }
        }
    )

    return { setCursor, resetCursor }
}
