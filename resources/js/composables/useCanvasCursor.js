import { watch, toValue } from 'vue'

/**
 * Composable for managing canvas cursor based on editor state
 *
 * @param {import('vue').Ref} containerRef - Canvas container element ref
 * @param {object} options - Reactive options
 * @param {import('vue').Ref<string>} options.mode - Current editor mode ('view' | 'edit')
 * @param {import('vue').Ref<boolean>} options.isCreatingHotspot - Whether creating a hotspot
 * @param {import('vue').Ref<boolean>} options.isCreatingSticker - Whether creating a sticker
 */
export function useCanvasCursor(containerRef, { mode, isCreatingHotspot, isCreatingSticker }) {
    const setCursor = (cursor) => {
        if (containerRef.value) {
            containerRef.value.style.cursor = cursor
        }
    }

    const resetCursor = () => {
        if (toValue(isCreatingHotspot) || toValue(isCreatingSticker)) {
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
    watch([() => toValue(isCreatingHotspot), () => toValue(isCreatingSticker)], ([creatingHotspot, creatingSticker]) => {
        if (!containerRef.value) return

        if (creatingHotspot || creatingSticker) {
            setCursor('crosshair')
        } else {
            setCursor('default')
        }
    })

    return { setCursor, resetCursor }
}
