<script setup>
import { ref, watch } from 'vue'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { RotateCw, Eye, ArrowLeftRight } from 'lucide-vue-next'
import { useThreeScene } from '@/composables/useThreeScene.js'
import { usePanoramaLoader } from '@/composables/usePanoramaLoader.js'
import { calculateOppositePosition } from '@/lib/spatialMath.js'
import { SPHERE, SPRITE, TIMING } from '@/lib/editorConstants.js'

const props = defineProps({
    open: Boolean,
    targetImage: Object,
    initialRotation: Object // { x, y, z } or null
})

const emit = defineEmits(['update:open', 'save'])

const previewContainer = ref(null)
const createBidirectional = ref(true)

// Initialize Three.js scene for preview
const {
    threeScene,
    camera,
    renderer,
    controls,
    textureLoader,
    init: initThreeScene,
    cleanup: cleanupThreeScene
} = useThreeScene(previewContainer)

// Initialize panorama loader
const { loadPanorama } = usePanoramaLoader(threeScene, textureLoader)

const initPreview = async () => {
    if (!previewContainer.value || !props.targetImage) return

    // Clean up existing scene
    cleanupThreeScene()

    // Initialize Three.js
    const initialized = initThreeScene()

    if (!initialized) return

    // Apply initial rotation if provided
    if (props.initialRotation && controls.value) {
        controls.value.setAzimuthalAngle(props.initialRotation.x)
        controls.value.setPolarAngle(props.initialRotation.y)
        controls.value.update()
    }

    // Load panorama
    await loadPanorama(
        `/images/${props.targetImage.slug}/download`,
        false, // No transition for preview
        null, // No rotation (already set via controls)
        null
    )
}

const resetOrientation = () => {
    if (controls.value) {
        controls.value.reset()
    }
}

const handleSave = () => {
    if (!controls.value) return

    const rotation = {
        x: controls.value.getAzimuthalAngle(),
        y: controls.value.getPolarAngle(),
        z: controls.value.target.z
    }

    // Calculate the return hotspot position (OPPOSITE side of the sphere from orientation)
    // When you arrive at the target image looking in a direction,
    // the return hotspot should be BEHIND you (opposite direction)
    const returnPosition = calculateOppositePosition(rotation, SPHERE.RADIUS, SPRITE.POSITION_SCALE)

    emit('save', {
        rotation,
        createBidirectional: createBidirectional.value,
        returnPosition
    })
    emit('update:open', false)
}

const handleCancel = () => {
    emit('update:open', false)
}

watch(() => props.open, (isOpen) => {
    if (isOpen && props.targetImage) {
        setTimeout(() => {
            initPreview()
        }, TIMING.DIALOG_TRANSITION_DELAY_MS)
    } else {
        cleanupThreeScene()
    }
})
</script>

<template>
    <Dialog :open="open" @update:open="emit('update:open', $event)">
        <DialogContent class="sm:max-w-4xl">
            <DialogHeader>
                <DialogTitle>Définir l'orientation de la caméra</DialogTitle>
                <DialogDescription>
                    Faites pivoter la vue pour définir l'angle de caméra souhaité lors de l'arrivée sur cette image
                </DialogDescription>
            </DialogHeader>

            <div class="space-y-4">
                <div ref="previewContainer" class="relative bg-zinc-900 rounded-lg w-full h-[500px] overflow-hidden">
                    <div v-if="!targetImage" class="flex justify-center items-center w-full h-full">
                        <p class="text-white">Chargement...</p>
                    </div>
                </div>

                <div class="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 p-3 rounded-lg">
                    <Eye class="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                    <p class="flex-1 text-sm text-zinc-600 dark:text-zinc-400">
                        Utilisez la souris pour faire pivoter la vue. Cette orientation sera appliquée lors de la
                        navigation vers cette image.
                    </p>
                </div>

                <div
                    class="flex items-center gap-3 bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                    <Checkbox :id="'bidirectional'" v-model:checked="createBidirectional" />
                    <div class="flex items-center gap-2 flex-1">
                        <ArrowLeftRight class="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <Label :for="'bidirectional'" class="text-sm text-blue-900 dark:text-blue-100 cursor-pointer">
                            Créer un point d'accès bidirectionnel (retour automatique)
                        </Label>
                    </div>
                </div>
            </div>

            <DialogFooter class="gap-2">
                <Button variant="outline" @click="resetOrientation">
                    <RotateCw class="mr-2 w-4 h-4" />
                    Réinitialiser
                </Button>
                <Button variant="outline" @click="handleCancel">
                    Annuler
                </Button>
                <Button @click="handleSave">
                    Enregistrer l'orientation
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>
