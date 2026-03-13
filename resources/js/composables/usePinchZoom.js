import { ref } from 'vue'
import { ZOOM, INTERACTION } from '@/lib/editorConstants.js'

/**
 * Composable for pinch-to-zoom gesture handling in the 360° editor
 *
 * Tracks two-finger pinch gestures and adjusts camera FOV accordingly.
 * Uses the Pointer Events API for unified touch/mouse support.
 *
 * @param {object} options
 * @param {import('vue').Ref} options.camera - Three.js camera ref
 */
export function usePinchZoom({ camera }) {
    const pointers = new Map()
    const isActive = ref(false)
    let lastPinchDistance = null

    const getDistance = () => {
        const entries = [...pointers.values()]
        if (entries.length < 2) return null

        const dx = entries[0].x - entries[1].x
        const dy = entries[0].y - entries[1].y
        return Math.sqrt(dx * dx + dy * dy)
    }

    const onPointerDown = (event) => {
        pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })

        if (pointers.size === 2) {
            isActive.value = true
            lastPinchDistance = getDistance()
        }
    }

    const onPointerMove = (event) => {
        if (!pointers.has(event.pointerId)) return false

        pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })

        if (pointers.size < 2 || !isActive.value || !camera.value) return false

        const currentDistance = getDistance()
        if (lastPinchDistance !== null && currentDistance !== null) {
            const delta = lastPinchDistance - currentDistance
            const newFov = camera.value.fov + delta * INTERACTION.PINCH_ZOOM_SPEED
            camera.value.fov = Math.max(ZOOM.MIN_FOV, Math.min(ZOOM.MAX_FOV, newFov))
            camera.value.updateProjectionMatrix()
        }
        lastPinchDistance = currentDistance

        return true
    }

    const onPointerUp = (event) => {
        pointers.delete(event.pointerId)

        if (pointers.size < 2) {
            isActive.value = false
            lastPinchDistance = null
        }
    }

    return {
        isActive,
        onPointerDown,
        onPointerMove,
        onPointerUp,
    }
}
