import { shallowRef, onUnmounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { CAMERA, CONTROLS, SCENE } from '@/lib/editorConstants.js'

/**
 * Composable for managing Three.js scene, camera, renderer, and controls
 * Handles initialization, animation loop, resize, and cleanup
 */
export function useThreeScene(containerRef, options = {}) {
    const {
        cameraFov = CAMERA.FOV,
        cameraNear = CAMERA.NEAR,
        cameraFar = CAMERA.FAR,
        cameraPosition = { x: 0, y: 0, z: CAMERA.DISTANCE },
        enableControls = true,
        controlsConfig = {
            enableDamping: CONTROLS.ENABLE_DAMPING,
            dampingFactor: CONTROLS.DAMPING_FACTOR,
            enableZoom: CONTROLS.ENABLE_ZOOM,
            enablePan: CONTROLS.ENABLE_PAN,
            rotateSpeed: CONTROLS.ROTATE_SPEED,
            minDistance: CONTROLS.MIN_DISTANCE,
            maxDistance: CONTROLS.MAX_DISTANCE
        },
        backgroundColor = SCENE.BACKGROUND_COLOR,
        onReady = null
    } = options

    const threeScene = shallowRef(null)
    const camera = shallowRef(null)
    const renderer = shallowRef(null)
    const controls = shallowRef(null)
    const raycaster = shallowRef(null)
    const mouse = shallowRef(new THREE.Vector2())
    const textureLoader = shallowRef(null)

    let animationId = null
    let resizeHandler = null

    const init = () => {
        if (!containerRef.value) {
            console.warn('Container ref not available for Three.js initialization')
            return false
        }

        // Create scene
        threeScene.value = new THREE.Scene()
        threeScene.value.background = new THREE.Color(backgroundColor)

        // Create camera
        const width = containerRef.value.clientWidth
        const height = containerRef.value.clientHeight
        camera.value = new THREE.PerspectiveCamera(
            cameraFov,
            width / height,
            cameraNear,
            cameraFar
        )
        camera.value.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z)

        // Create renderer
        renderer.value = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false
        })
        renderer.value.setSize(width, height)
        renderer.value.setPixelRatio(window.devicePixelRatio)
        containerRef.value.appendChild(renderer.value.domElement)

        // Create controls
        if (enableControls) {
            controls.value = new OrbitControls(camera.value, renderer.value.domElement)
            Object.assign(controls.value, controlsConfig)
        }

        // Create utilities
        textureLoader.value = new THREE.TextureLoader()
        raycaster.value = new THREE.Raycaster()

        // Setup resize handler
        resizeHandler = () => onResize()
        window.addEventListener('resize', resizeHandler)

        // Start animation loop
        animate()

        // Emit ready callback
        if (onReady) {
            onReady({
                scene: threeScene.value,
                camera: camera.value,
                renderer: renderer.value,
                controls: controls.value,
                raycaster: raycaster.value,
                textureLoader: textureLoader.value
            })
        }

        return true
    }

    const animate = () => {
        animationId = requestAnimationFrame(animate)

        if (controls.value) {
            controls.value.update()
        }

        if (renderer.value && threeScene.value && camera.value) {
            renderer.value.render(threeScene.value, camera.value)
        }
    }

    const onResize = () => {
        if (!containerRef.value || !camera.value || !renderer.value) return

        const width = containerRef.value.clientWidth
        const height = containerRef.value.clientHeight

        camera.value.aspect = width / height
        camera.value.updateProjectionMatrix()
        renderer.value.setSize(width, height)
    }

    const cleanup = () => {
        // Cancel animation loop
        if (animationId) {
            cancelAnimationFrame(animationId)
            animationId = null
        }

        // Remove resize listener
        if (resizeHandler) {
            window.removeEventListener('resize', resizeHandler)
            resizeHandler = null
        }

        // Dispose renderer
        if (renderer.value && containerRef.value) {
            try {
                containerRef.value.removeChild(renderer.value.domElement)
            } catch (e) {
                // Element might already be removed
            }
            renderer.value.dispose()
        }

        // Clear references
        threeScene.value = null
        camera.value = null
        renderer.value = null
        controls.value = null
        raycaster.value = null
        textureLoader.value = null
    }

    // Auto cleanup on unmount
    onUnmounted(() => {
        cleanup()
    })

    return {
        // Refs
        threeScene,
        camera,
        renderer,
        controls,
        raycaster,
        mouse,
        textureLoader,

        // Methods
        init,
        cleanup,
        onResize
    }
}
