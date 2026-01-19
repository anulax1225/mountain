import { ref } from 'vue'
import * as THREE from 'three'
import { SPHERE, TRANSITION } from '@/lib/editorConstants.js'
import { applyCameraRotation } from '@/lib/spatialMath.js'

/**
 * Composable for loading and managing panoramic images in Three.js
 * Handles texture loading, mesh creation, and transition effects
 */
export function usePanoramaLoader(sceneRef, textureLoaderRef, options = {}) {
    const {
        sphereRadius = SPHERE.RADIUS,
        sphereSegments = SPHERE.SEGMENTS,
        sphereRings = SPHERE.RINGS,
        transitionDuration = TRANSITION.DURATION_MS,
        transitionStep = TRANSITION.FADE_STEP
    } = options

    const currentMesh = ref(null)
    const isTransitioning = ref(false)

    /**
     * Load a panoramic image and create a sphere mesh
     * @param {string} imageUrl - URL of the panoramic image
     * @param {boolean} transition - Whether to fade in/out
     * @param {Object} rotation - Optional camera rotation {x, y, z}
     * @param {OrbitControls} controls - Camera controls for applying rotation
     * @returns {Promise<THREE.Mesh>}
     */
    const loadPanorama = async (imageUrl, transition = true, rotation = null, controls = null) => {
        if (!sceneRef.value || !textureLoaderRef.value) {
            console.warn('Scene or texture loader not available')
            return null
        }

        // Fade out if transitioning
        if (transition && currentMesh.value) {
            isTransitioning.value = true
            await fadeOut(currentMesh.value, transitionDuration, transitionStep)
        }

        // Remove old mesh
        if (currentMesh.value) {
            sceneRef.value.remove(currentMesh.value)
            // Dispose geometry and material to free memory
            currentMesh.value.geometry?.dispose()
            currentMesh.value.material?.map?.dispose()
            currentMesh.value.material?.dispose()
        }

        // Load texture
        const texture = await textureLoaderRef.value.loadAsync(imageUrl)
        texture.colorSpace = THREE.SRGBColorSpace
        texture.minFilter = THREE.LinearFilter
        texture.magFilter = THREE.LinearFilter

        // Create geometry (inverted sphere for inside view)
        const geometry = new THREE.SphereGeometry(sphereRadius, sphereSegments, sphereRings)
        geometry.scale(SPHERE.SCALE_INVERT, 1, 1) // Invert for inside viewing

        // Create material and mesh
        const material = new THREE.MeshBasicMaterial({ map: texture })
        const mesh = new THREE.Mesh(geometry, material)

        // Add to scene
        sceneRef.value.add(mesh)
        currentMesh.value = mesh

        // Fade in if transitioning
        if (transition) {
            await fadeIn(mesh, transitionDuration, transitionStep)
            isTransitioning.value = false
        }

        // Apply camera rotation if provided
        if (rotation && controls && rotation.x !== null && rotation.y !== null) {
            applyCameraRotation(controls, rotation)
        }

        return mesh
    }

    /**
     * Fade out a mesh
     */
    const fadeOut = (mesh, duration, step) => {
        return new Promise((resolve) => {
            if (!mesh) {
                resolve()
                return
            }

            mesh.material.transparent = true
            let opacity = 1

            const interval = setInterval(() => {
                opacity -= step
                if (mesh.material) {
                    mesh.material.opacity = opacity
                }
                if (opacity <= 0) {
                    clearInterval(interval)
                    resolve()
                }
            }, duration)
        })
    }

    /**
     * Fade in a mesh
     */
    const fadeIn = (mesh, duration, step) => {
        return new Promise((resolve) => {
            if (!mesh) {
                resolve()
                return
            }

            mesh.material.transparent = true
            mesh.material.opacity = 0
            let opacity = 0

            const interval = setInterval(() => {
                opacity += step
                if (mesh.material) {
                    mesh.material.opacity = opacity
                }
                if (opacity >= 1) {
                    if (mesh.material) {
                        mesh.material.transparent = false
                    }
                    clearInterval(interval)
                    resolve()
                }
            }, duration)
        })
    }

    /**
     * Remove current mesh from scene
     */
    const clear = () => {
        if (currentMesh.value && sceneRef.value) {
            sceneRef.value.remove(currentMesh.value)
            currentMesh.value.geometry?.dispose()
            currentMesh.value.material?.map?.dispose()
            currentMesh.value.material?.dispose()
            currentMesh.value = null
        }
    }

    return {
        currentMesh,
        isTransitioning,
        loadPanorama,
        clear,
        fadeIn,
        fadeOut
    }
}
