<script setup>
import { Button } from '@/components/ui/button'
import { ZoomIn, ZoomOut, Maximize2, RotateCcw } from 'lucide-vue-next'
import { ZOOM } from '@/lib/editorConstants.js'

const props = defineProps({
    controls: {
        type: Object,
        default: null
    }
})

const emit = defineEmits(['zoom-in', 'zoom-out', 'reset-zoom'])

const zoomIn = () => {
    if (!props.controls || !props.controls.object) return

    const camera = props.controls.object
    camera.fov = Math.max(ZOOM.MIN_FOV, camera.fov - ZOOM.BUTTON_STEP)
    camera.updateProjectionMatrix()
    emit('zoom-in')
}

const zoomOut = () => {
    if (!props.controls || !props.controls.object) return

    const camera = props.controls.object
    camera.fov = Math.min(ZOOM.MAX_FOV, camera.fov + ZOOM.BUTTON_STEP)
    camera.updateProjectionMatrix()
    emit('zoom-out')
}

const resetZoom = () => {
    if (!props.controls || !props.controls.object) return

    const camera = props.controls.object
    camera.fov = ZOOM.DEFAULT_FOV
    camera.updateProjectionMatrix()
    emit('reset-zoom')
}
</script>

<template>
    <div class="absolute bottom-24 right-6 z-40 flex flex-col gap-2">
        <Button @click="zoomIn" size="icon" variant="secondary"
            class="w-10 h-10 bg-card/90 backdrop-blur shadow-lg hover:bg-card"
            title="Zoom avant">
            <ZoomIn class="w-5 h-5" />
        </Button>

        <Button @click="zoomOut" size="icon" variant="secondary"
            class="w-10 h-10 bg-card/90 backdrop-blur shadow-lg hover:bg-card"
            title="Zoom arrière">
            <ZoomOut class="w-5 h-5" />
        </Button>

        <Button @click="resetZoom" size="icon" variant="secondary"
            class="w-10 h-10 bg-card/90 backdrop-blur shadow-lg hover:bg-card"
            title="Réinitialiser le zoom">
            <RotateCcw class="w-5 h-5" />
        </Button>
    </div>
</template>
