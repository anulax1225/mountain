<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
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
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const props = defineProps({
    open: Boolean,
    targetImage: Object,
    initialRotation: Object // { x, y, z } or null
})

const emit = defineEmits(['update:open', 'save'])

const previewContainer = ref(null)
const createBidirectional = ref(true)
let scene = null
let camera = null
let renderer = null
let controls = null
let mesh = null
let animationId = null

const initPreview = async () => {
    if (!previewContainer.value || !props.targetImage) return

    // Clean up existing scene
    cleanup()

    // Setup Three.js scene
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000)

    const width = previewContainer.value.clientWidth
    const height = previewContainer.value.clientHeight

    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1500)
    camera.position.set(0, 0, 0.1)

    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(window.devicePixelRatio)
    previewContainer.value.appendChild(renderer.domElement)

    // Setup controls
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.enableZoom = true
    controls.enablePan = false
    controls.rotateSpeed = -0.5
    controls.minDistance = 1
    controls.maxDistance = 100

    // Apply initial rotation if provided
    if (props.initialRotation) {
        controls.setAzimuthalAngle(props.initialRotation.x)
        controls.setPolarAngle(props.initialRotation.y)
        controls.update()
    }

    // Load panorama texture
    const textureLoader = new THREE.TextureLoader()
    const texture = await textureLoader.loadAsync(`/images/${props.targetImage.slug}/download`)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter

    const geometry = new THREE.SphereGeometry(500, 60, 40)
    geometry.scale(-1, 1, 1)

    const material = new THREE.MeshBasicMaterial({ map: texture })
    mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    // Animation loop
    const animate = () => {
        controls.update()
        renderer.render(scene, camera)
        animationId = requestAnimationFrame(animate)
    }
    animate()
}

const cleanup = () => {
    if (animationId) {
        cancelAnimationFrame(animationId)
        animationId = null
    }
    if (renderer && previewContainer.value) {
        previewContainer.value.removeChild(renderer.domElement)
        renderer.dispose()
    }
    scene = null
    camera = null
    renderer = null
    controls = null
    mesh = null
}

const resetOrientation = () => {
    if (controls) {
        controls.reset()
    }
}

const handleSave = () => {
    if (!controls) return

    const rotation = {
        x: controls.getAzimuthalAngle(),
        y: controls.getPolarAngle(),
        z: controls.target.z
    }

    // Calculate the return hotspot position (OPPOSITE side of the sphere from orientation)
    // When you arrive at the target image looking in a direction,
    // the return hotspot should be BEHIND you (opposite direction)
    const azimuthal = rotation.x
    const polar = rotation.y
    const radius = 500 * 0.95

    // Calculate the forward direction vector
    const forwardX = Math.sin(polar) * Math.sin(azimuthal) * radius
    const forwardY = Math.cos(polar) * radius
    const forwardZ = Math.sin(polar) * Math.cos(azimuthal) * radius

    // Invert to get opposite position (behind the camera)
    const returnPosition = {
        x: -forwardX,
        y: -forwardY,
        z: -forwardZ
    }

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
        }, 100)
    } else {
        cleanup()
    }
})

onUnmounted(() => {
    cleanup()
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