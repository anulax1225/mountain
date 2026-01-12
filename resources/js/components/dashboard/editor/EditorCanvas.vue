<script setup>
    import { ref, onMounted, onUnmounted, watch, shallowRef, computed } from 'vue'
    import * as THREE from 'three'
    import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
    
    const props = defineProps({
        images: Array,
        currentIndex: Number,
        mode: {
            type: String,
            default: 'view'
        },
        isCreatingHotspot: Boolean,
        isCreatingSticker: Boolean
    })
    
    const emit = defineEmits(['ready', 'hotspot-click', 'sticker-click', 'hotspot-position-selected', 'sticker-position-selected', 'hotspot-hover', 'hotspot-hover-end'])
    
    const renderView = ref(null)
    const threeScene = shallowRef(null)
    const camera = shallowRef(null)
    const renderer = shallowRef(null)
    const controls = shallowRef(null)
    const currentMesh = shallowRef(null)
    const textureLoader = shallowRef(null)
    const hotspotSprites = shallowRef([])
    const stickerSprites = shallowRef([])
    const raycaster = shallowRef(null)
    const mouse = shallowRef(new THREE.Vector2())
    const isTransitioning = ref(false)
    const hoveredHotspot = ref(null)
    const hideHoverTimeout = ref(null)
    const skipNextWatch = ref(false)
    
    const currentImage = computed(() => props.images[props.currentIndex])
    const currentHotspots = computed(() =>
        currentImage.value?.hotspots_from || []
    )
    const currentStickers = computed(() =>
        currentImage.value?.stickers || []
    )
    
    const initThreeJS = () => {
        if (!renderView.value) return
    
        threeScene.value = new THREE.Scene()
        threeScene.value.background = new THREE.Color(0x000000)
    
        camera.value = new THREE.PerspectiveCamera(
            75,
            renderView.value.clientWidth / renderView.value.clientHeight,
            0.1,
            1500
        )
        camera.value.position.set(0, 0, 0.1)
    
        renderer.value = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false
        })
        renderer.value.setSize(renderView.value.clientWidth, renderView.value.clientHeight)
        renderer.value.setPixelRatio(window.devicePixelRatio)
        renderView.value.appendChild(renderer.value.domElement)
    
        controls.value = new OrbitControls(camera.value, renderer.value.domElement)
        controls.value.enableDamping = true
        controls.value.dampingFactor = 0.05
        controls.value.enableZoom = true
        controls.value.enablePan = false
        controls.value.rotateSpeed = -0.5
        controls.value.minDistance = 1
        controls.value.maxDistance = 100
    
        textureLoader.value = new THREE.TextureLoader()
        raycaster.value = new THREE.Raycaster()
    
        renderView.value.addEventListener('click', onCanvasClick)
        renderView.value.addEventListener('mousemove', onMouseMove)
        window.addEventListener('resize', onResize)
    
        animate()
        emit('ready')
    }
    
    const animate = () => {
        requestAnimationFrame(animate)
        if (controls.value) controls.value.update()
        if (renderer.value && threeScene.value && camera.value) {
            renderer.value.render(threeScene.value, camera.value)
        }
    }
    
    const onCanvasClick = (event) => {
        if (!raycaster.value || !camera.value || !currentMesh.value) return
    
        const rect = renderView.value.getBoundingClientRect()
        mouse.value.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
        mouse.value.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    
        raycaster.value.setFromCamera(mouse.value, camera.value)
    
        // Creating hotspot
        if (props.isCreatingHotspot) {
            const intersects = raycaster.value.intersectObject(currentMesh.value)
            if (intersects.length > 0) {
                const point = intersects[0].point.clone()
                point.multiplyScalar(0.95)
                emit('hotspot-position-selected', {
                    x: point.x,
                    y: point.y,
                    z: point.z
                })
            }
            return
        }
    
        // Creating sticker
        if (props.isCreatingSticker) {
            const intersects = raycaster.value.intersectObject(currentMesh.value)
            if (intersects.length > 0) {
                const point = intersects[0].point.clone()
                point.multiplyScalar(0.95)
                emit('sticker-position-selected', {
                    x: point.x,
                    y: point.y,
                    z: point.z
                })
            }
            return
        }
    
        // View mode - hotspot navigation
        if (props.mode === 'view') {
            const intersects = raycaster.value.intersectObjects(hotspotSprites.value)
            if (intersects.length > 0) {
                const sprite = intersects[0].object
                const hotspot = sprite.userData.hotspot
                emit('hotspot-click', hotspot)
            }
            return
        }
    
        // Edit mode - sticker deletion
        if (props.mode === 'edit') {
            const intersects = raycaster.value.intersectObjects(stickerSprites.value)
            if (intersects.length > 0) {
                const sprite = intersects[0].object
                const sticker = sprite.userData.sticker
                emit('sticker-click', sticker)
            }
        }
    }
    
    const onMouseMove = (event) => {
        if (!raycaster.value || !camera.value || props.mode !== 'view') return
    
        const rect = renderView.value.getBoundingClientRect()
        mouse.value.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
        mouse.value.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    
        raycaster.value.setFromCamera(mouse.value, camera.value)
        const intersects = raycaster.value.intersectObjects(hotspotSprites.value)
    
        if (intersects.length > 0) {
            const sprite = intersects[0].object
            const hotspot = sprite.userData.hotspot
    
            if (!hoveredHotspot.value || hoveredHotspot.value.id !== hotspot.id) {
                hoveredHotspot.value = hotspot
    
                const screenPosition = sprite.position.clone()
                screenPosition.project(camera.value)
    
                const x = (screenPosition.x * 0.5 + 0.5) * renderView.value.clientWidth
                const y = (screenPosition.y * -0.5 + 0.5) * renderView.value.clientHeight
    
                emit('hotspot-hover', {
                    hotspot,
                    position: { x, y }
                })
            }
    
            if (hideHoverTimeout.value) {
                clearTimeout(hideHoverTimeout.value)
                hideHoverTimeout.value = null
            }
        } else {
            if (hoveredHotspot.value) {
                hideHoverTimeout.value = setTimeout(() => {
                    hoveredHotspot.value = null
                    emit('hotspot-hover-end')
                }, 100)
            }
        }
    }
    
    const loadPanorama = async (index, transition = true, rotation = null, skipWatch = false) => {
        if (!props.images[index] || !threeScene.value) return
    
        if (rotation || skipWatch) {
            skipNextWatch.value = true
        }
    
        if (transition) {
            isTransitioning.value = true
            await fadeOut()
        }
    
        clearHotspots()
        clearStickers()
    
        if (currentMesh.value) {
            threeScene.value.remove(currentMesh.value)
        }
    
        const texture = await textureLoader.value.loadAsync(`/images/${props.images[index].slug}/download`)
        texture.colorSpace = THREE.SRGBColorSpace
        texture.minFilter = THREE.LinearFilter
        texture.magFilter = THREE.LinearFilter
    
        const geometry = new THREE.SphereGeometry(500, 60, 40)
        geometry.scale(-1, 1, 1)
    
        const material = new THREE.MeshBasicMaterial({ map: texture })
        const mesh = new THREE.Mesh(geometry, material)
    
        threeScene.value.add(mesh)
        currentMesh.value = mesh
    
        if (transition) {
            await fadeIn()
            isTransitioning.value = false
        }
    
        // Apply rotation if provided
        if (rotation && rotation.x !== null && rotation.y !== null && controls.value) {
            // Set camera rotation using spherical coordinates
            // rotation.x = azimuthal angle (horizontal)
            // rotation.y = polar angle (vertical)
            const radius = 0.1
            const x = radius * Math.sin(rotation.y) * Math.sin(rotation.x)
            const y = radius * Math.cos(rotation.y)
            const z = radius * Math.sin(rotation.y) * Math.cos(rotation.x)
            
            camera.value.position.set(x, y, z)
            camera.value.lookAt(0, 0, 0)
            controls.value.update()
        }
    
        displayHotspots()
        displayStickers()
    }
    
    const clearHotspots = () => {
        hotspotSprites.value.forEach(sprite => threeScene.value.remove(sprite))
        hotspotSprites.value = []
        hoveredHotspot.value = null
        if (hideHoverTimeout.value) {
            clearTimeout(hideHoverTimeout.value)
            hideHoverTimeout.value = null
        }
        emit('hotspot-hover-end')
    }
    
    const clearStickers = () => {
        stickerSprites.value.forEach(sprite => threeScene.value.remove(sprite))
        stickerSprites.value = []
    }
    
    const createHotspotSprite = (hotspot) => {
        let material
    
        // Check for custom image first
        if (hotspot.custom_image) {
            const texture = new THREE.TextureLoader().load(`/hotspot-icons/${hotspot.custom_image}`)
            material = new THREE.SpriteMaterial({ 
                map: texture,
                sizeAttenuation: false
            })
        } 
        // Check for custom color
        else if (hotspot.custom_color) {
            const canvas = document.createElement('canvas')
            canvas.width = 64
            canvas.height = 64
            const ctx = canvas.getContext('2d')
            
            ctx.fillStyle = hotspot.custom_color
            ctx.beginPath()
            ctx.arc(32, 32, 28, 0, Math.PI * 2)
            ctx.fill()
            
            // White border
            ctx.strokeStyle = '#ffffff'
            ctx.lineWidth = 4
            ctx.beginPath()
            ctx.arc(32, 32, 28, 0, Math.PI * 2)
            ctx.stroke()
            
            const texture = new THREE.CanvasTexture(canvas)
            material = new THREE.SpriteMaterial({ 
                map: texture,
                sizeAttenuation: false
            })
        } 
        // Default white dot
        else {
            const canvas = document.createElement('canvas')
            canvas.width = 64
            canvas.height = 64
            const ctx = canvas.getContext('2d')
            
            ctx.fillStyle = '#ffffff'
            ctx.beginPath()
            ctx.arc(32, 32, 24, 0, Math.PI * 2)
            ctx.fill()
            
            ctx.strokeStyle = '#000000'
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.arc(32, 32, 24, 0, Math.PI * 2)
            ctx.stroke()
            
            const texture = new THREE.CanvasTexture(canvas)
            material = new THREE.SpriteMaterial({ 
                map: texture,
                sizeAttenuation: false
            })
        }
    
        const sprite = new THREE.Sprite(material)
        sprite.scale.set(0.05, 0.05, 1)
        
        return sprite
    }
    
    const createStickerSprite = (sticker) => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
    
        if (sticker.type === 'emoji') {
            // Emoji sticker
            canvas.width = 128
            canvas.height = 128
            
            ctx.font = '80px Arial'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(sticker.content, 64, 64)
        } else if (sticker.type === 'text') {
            // Text sticker - measure text to set canvas size
            const fontSize = sticker.font_size || 48
            const fontFamily = sticker.font_family || 'Arial'
            ctx.font = `${fontSize}px ${fontFamily}`
            
            const metrics = ctx.measureText(sticker.content)
            const padding = 20
            canvas.width = metrics.width + padding * 2
            canvas.height = fontSize + padding * 2
            
            // Background
            if (sticker.background_color) {
                ctx.fillStyle = sticker.background_color
                ctx.fillRect(0, 0, canvas.width, canvas.height)
            }
            
            // Text
            ctx.font = `${fontSize}px ${fontFamily}`
            ctx.fillStyle = sticker.color || '#ffffff'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(sticker.content, canvas.width / 2, canvas.height / 2)
        }
    
        const texture = new THREE.CanvasTexture(canvas)
        const material = new THREE.SpriteMaterial({ 
            map: texture,
            sizeAttenuation: false
        })
    
        const sprite = new THREE.Sprite(material)
        const scale = sticker.scale || 1.0
        sprite.scale.set(0.1 * scale, 0.1 * scale, 1)
        
        return sprite
    }
    
    const displayHotspots = () => {
        clearHotspots()
    
        console.log('Displaying hotspots:', currentHotspots.value)
    
        currentHotspots.value.forEach(hotspot => {
            console.log('Creating sprite for hotspot:', hotspot.slug, hotspot)
    
            const sprite = createHotspotSprite(hotspot)
    
            const position = new THREE.Vector3(
                hotspot.position_x,
                hotspot.position_y,
                hotspot.position_z
            )
            position.multiplyScalar(0.95)
    
            sprite.position.copy(position)
            sprite.userData.hotspot = hotspot
    
            threeScene.value.add(sprite)
            hotspotSprites.value.push(sprite)
        })
    
        console.log('Hotspot sprites created:', hotspotSprites.value.length)
    }
    
    const displayStickers = () => {
        clearStickers()
    
        console.log('Displaying stickers:', currentStickers.value)
    
        currentStickers.value.forEach(sticker => {
            console.log('Creating sprite for sticker:', sticker.slug, sticker)
    
            const sprite = createStickerSprite(sticker)
    
            const position = new THREE.Vector3(
                sticker.position_x,
                sticker.position_y,
                sticker.position_z
            )
            position.multiplyScalar(0.95)
    
            sprite.position.copy(position)
            sprite.userData.sticker = sticker
    
            threeScene.value.add(sprite)
            stickerSprites.value.push(sprite)
        })
    
        console.log('Sticker sprites created:', stickerSprites.value.length)
    }
    
    const fadeOut = () => {
        return new Promise((resolve) => {
            if (!currentMesh.value) {
                resolve()
                return
            }
    
            currentMesh.value.material.transparent = true
            let opacity = 1
    
            const interval = setInterval(() => {
                opacity -= 0.05
                if (currentMesh.value) {
                    currentMesh.value.material.opacity = opacity
                }
                if (opacity <= 0) {
                    clearInterval(interval)
                    resolve()
                }
            }, 16)
        })
    }
    
    const fadeIn = () => {
        return new Promise((resolve) => {
            if (!currentMesh.value) {
                resolve()
                return
            }
    
            currentMesh.value.material.transparent = true
            currentMesh.value.material.opacity = 0
            let opacity = 0
    
            const interval = setInterval(() => {
                opacity += 0.05
                if (currentMesh.value) {
                    currentMesh.value.material.opacity = opacity
                }
                if (opacity >= 1) {
                    if (currentMesh.value) {
                        currentMesh.value.material.transparent = false
                    }
                    clearInterval(interval)
                    resolve()
                }
            }, 16)
        })
    }
    
    const onResize = () => {
        if (!renderView.value || !camera.value || !renderer.value) return
    
        const width = renderView.value.clientWidth
        const height = renderView.value.clientHeight
    
        camera.value.aspect = width / height
        camera.value.updateProjectionMatrix()
        renderer.value.setSize(width, height)
    }
    
    watch(() => props.currentIndex, (newIndex) => {
        if (skipNextWatch.value) {
            skipNextWatch.value = false
            return
        }
        loadPanorama(newIndex)
    })
    
    watch(currentHotspots, () => {
        console.log('Hotspots changed, re-displaying:', currentHotspots.value)
        if (threeScene.value) {
            displayHotspots()
        }
    }, { deep: true })
    
    watch(currentStickers, () => {
        console.log('Stickers changed, re-displaying:', currentStickers.value)
        if (threeScene.value) {
            displayStickers()
        }
    }, { deep: true })
    
    onMounted(() => {
        initThreeJS()
        if (props.images.length > 0) {
            loadPanorama(props.currentIndex)
        }
    })
    
    onUnmounted(() => {
        if (renderView.value) {
            renderView.value.removeEventListener('click', onCanvasClick)
            renderView.value.removeEventListener('mousemove', onMouseMove)
        }
        window.removeEventListener('resize', onResize)
        if (renderer.value) {
            renderer.value.dispose()
        }
        if (hideHoverTimeout.value) {
            clearTimeout(hideHoverTimeout.value)
        }
    })
    
    defineExpose({ 
        loadPanorama, 
        displayHotspots,
        displayStickers,
        controls 
    })
    </script>
    
    <template>
        <div ref="renderView" class="w-full h-full"></div>
    </template>