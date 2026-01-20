<script setup>
import { Button } from '@/components/ui/button'
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-vue-next'
import { CAMERA, CONTROLS } from '@/lib/editorConstants.js'

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
    const currentDistance = camera.position.length()
    const newDistance = Math.max(currentDistance * 0.7, CONTROLS.MIN_DISTANCE)

    camera.position.normalize().multiplyScalar(newDistance)
    props.controls.update()
    emit('zoom-in')
}

const zoomOut = () => {
    if (!props.controls || !props.controls.object) return

    const camera = props.controls.object
    const currentDistance = camera.position.length()
    const newDistance = Math.min(currentDistance * 1.35, CONTROLS.MAX_DISTANCE)

    camera.position.normalize().multiplyScalar(newDistance)
    props.controls.update()
    emit('zoom-out')
}

const resetZoom = () => {
    if (!props.controls || !props.controls.object) return

    const camera = props.controls.object
    camera.position.set(0, 0, CAMERA.DISTANCE)
    props.controls.update()
    emit('reset-zoom')
}
</script>

<template>
    <div class="absolute bottom-24 right-6 z-40 flex flex-col gap-2">
        <Button @click="zoomIn" size="icon" variant="secondary"
            class="w-10 h-10 bg-white/90 dark:bg-zinc-800/90 backdrop-blur shadow-lg hover:bg-white dark:hover:bg-zinc-800"
            title="Zoom avant">
            <ZoomIn class="w-5 h-5" />
        </Button>

        <Button @click="zoomOut" size="icon" variant="secondary"
            class="w-10 h-10 bg-white/90 dark:bg-zinc-800/90 backdrop-blur shadow-lg hover:bg-white dark:hover:bg-zinc-800"
            title="Zoom arrière">
            <ZoomOut class="w-5 h-5" />
        </Button>

        <Button @click="resetZoom" size="icon" variant="secondary"
            class="w-10 h-10 bg-white/90 dark:bg-zinc-800/90 backdrop-blur shadow-lg hover:bg-white dark:hover:bg-zinc-800"
            title="Réinitialiser le zoom">
            <Maximize2 class="w-5 h-5" />
        </Button>
    </div>
</template>
