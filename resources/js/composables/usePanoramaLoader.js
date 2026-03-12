import { ref, shallowRef } from 'vue'
import * as THREE from 'three'
import { SPHERE, TRANSITION } from '@/lib/editorConstants.js'
import { applyCameraRotation } from '@/lib/spatialMath.js'

// Module-level cache: persists across component instances until page reload
const imageCache = new Map() // url → HTMLImageElement

/**
 * Create a configured THREE.Texture from a cached HTMLImageElement
 */
function createTextureFromCache(image) {
    const texture = new THREE.Texture(image)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.needsUpdate = true
    return texture
}

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

    const currentMesh = shallowRef(null)
    const isTransitioning = ref(false)

    /**
     * Load a panoramic image and create a sphere mesh
     * @param {string} imageUrl - URL of the panoramic image
     * @param {boolean} transition - Whether to fade in/out
     * @param {Object} rotation - Optional camera rotation {x, y, z}
     * @param {OrbitControls} controls - Camera controls for applying rotation
     * @param {string|null} previewUrl - Optional preview URL for progressive loading
     * @returns {Promise<THREE.Mesh>}
     */
    const loadPanorama = async (imageUrl, transition = true, rotation = null, controls = null, previewUrl = null) => {
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

        // Load texture: use cache if available, otherwise preview then full-res
        const isCached = imageCache.has(imageUrl)
        let texture

        if (isCached) {
            texture = createTextureFromCache(imageCache.get(imageUrl))
        } else {
            const initialUrl = previewUrl || imageUrl
            texture = await textureLoaderRef.value.loadAsync(initialUrl)
            texture.colorSpace = THREE.SRGBColorSpace
            texture.minFilter = THREE.LinearFilter
            texture.magFilter = THREE.LinearFilter

            // If loaded full-res directly (no preview), cache it
            if (!previewUrl) {
                imageCache.set(imageUrl, texture.image)
            }
        }

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

        // If preview was used and not cached, preload full-res in background and swap
        if (previewUrl && !isCached) {
            textureLoaderRef.value.loadAsync(imageUrl).then(fullTexture => {
                fullTexture.colorSpace = THREE.SRGBColorSpace
                fullTexture.minFilter = THREE.LinearFilter
                fullTexture.magFilter = THREE.LinearFilter
                fullTexture.needsUpdate = true

                // Cache the image data for future visits
                imageCache.set(imageUrl, fullTexture.image)

                // Only swap if this mesh is still the current one
                if (currentMesh.value === mesh) {
                    const oldTexture = mesh.material.map
                    mesh.material.map = fullTexture
                    mesh.material.needsUpdate = true
                    oldTexture?.dispose()
                } else {
                    fullTexture.dispose()
                }
            }).catch(err => {
                console.warn('Failed to load full-res texture:', err)
            })
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
