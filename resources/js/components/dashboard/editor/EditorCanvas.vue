<script setup>
    import { ref, onMounted, onUnmounted, watch, shallowRef, computed } from 'vue'
    import * as THREE from 'three'
    import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
    
    const props = defineProps({
      images: Array,
      currentIndex: Number,
      hotspots: Array,
      mode: {
        type: String,
        default: 'view'
      },
      isCreatingHotspot: Boolean
    })
    
    const emit = defineEmits(['ready', 'hotspot-click', 'hotspot-position-selected', 'hotspot-hover', 'hotspot-hover-end'])
    
    const renderView = ref(null)
    const threeScene = shallowRef(null)
    const camera = shallowRef(null)
    const renderer = shallowRef(null)
    const controls = shallowRef(null)
    const currentMesh = shallowRef(null)
    const textureLoader = shallowRef(null)
    const hotspotSprites = shallowRef([])
    const raycaster = shallowRef(null)
    const mouse = shallowRef(new THREE.Vector2())
    const isTransitioning = ref(false)
    const hoveredHotspot = ref(null)
    
    const currentImage = computed(() => props.images[props.currentIndex])
    const currentHotspots = computed(() => 
      props.hotspots?.filter(h => h.from_image?.slug === currentImage.value?.slug) || []
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
    
      const animate = () => {
        controls.value.update()
        renderer.value.render(threeScene.value, camera.value)
      }
      renderer.value.setAnimationLoop(animate)
    
      renderView.value.addEventListener('click', onCanvasClick)
      renderView.value.addEventListener('mousemove', onMouseMove)
      window.addEventListener('resize', onResize)
      
      emit('ready')
    }
    
    const onCanvasClick = (event) => {
      if (isTransitioning.value) return
      
      const rect = renderView.value.getBoundingClientRect()
      mouse.value.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.value.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    
      raycaster.value.setFromCamera(mouse.value, camera.value)
    
      if (props.isCreatingHotspot) {
        const intersects = raycaster.value.intersectObject(currentMesh.value)
        if (intersects.length > 0) {
          const point = intersects[0].point
          emit('hotspot-position-selected', {
            x: point.x * 0.95,
            y: point.y * 0.95,
            z: point.z * 0.95
          })
        }
        return
      }
    
      const intersects = raycaster.value.intersectObjects(hotspotSprites.value)
      if (intersects.length > 0) {
        const hotspot = intersects[0].object.userData.hotspot
        emit('hotspot-click', hotspot)
      }
    }
    
    const onMouseMove = (event) => {
      if (hotspotSprites.value.length === 0) return
      
      const rect = renderView.value.getBoundingClientRect()
      mouse.value.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.value.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    
      raycaster.value.setFromCamera(mouse.value, camera.value)
      const intersects = raycaster.value.intersectObjects(hotspotSprites.value)
    
      hotspotSprites.value.forEach(sprite => {
        sprite.scale.set(20, 20, 1)
      })
    
      if (intersects.length > 0) {
        const sprite = intersects[0].object
        const hotspot = sprite.userData.hotspot
        sprite.scale.set(24, 24, 1)
        renderView.value.style.cursor = 'pointer'
        
        if (hoveredHotspot.value?.slug !== hotspot.slug) {
          hoveredHotspot.value = hotspot
          const screenPosition = toScreenPosition(sprite.position)
          emit('hotspot-hover', { hotspot, position: screenPosition })
        }
      } else {
        renderView.value.style.cursor = 'default'
        if (hoveredHotspot.value) {
          hoveredHotspot.value = null
          emit('hotspot-hover-end')
        }
      }
    }
    
    const toScreenPosition = (position) => {
      const vector = position.clone()
      vector.project(camera.value)
      
      const rect = renderView.value.getBoundingClientRect()
      const x = (vector.x * 0.5 + 0.5) * rect.width
      const y = (vector.y * -0.5 + 0.5) * rect.height
      
      return { x, y }
    }
    
    const loadPanorama = async (index, transition = false) => {
      if (!props.images[index] || !threeScene.value) return
    
      if (transition) {
        isTransitioning.value = true
        await fadeOut()
      }
    
      clearHotspots()
    
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
    }
    
    const clearHotspots = () => {
      hotspotSprites.value.forEach(sprite => threeScene.value.remove(sprite))
      hotspotSprites.value = []
      hoveredHotspot.value = null
      emit('hotspot-hover-end')
    }
    
    const displayHotspots = () => {
      clearHotspots()
      
      currentHotspots.value.forEach(hotspot => {
        const sprite = createHotspotSprite(hotspot)
        threeScene.value.add(sprite)
        hotspotSprites.value.push(sprite)
      })
    }
    
    const createHotspotSprite = (hotspot) => {
      const canvas = document.createElement('canvas')
      canvas.width = 128
      canvas.height = 128
      const ctx = canvas.getContext('2d')
      
      ctx.beginPath()
      ctx.arc(64, 64, 50, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
      ctx.fill()
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
      ctx.lineWidth = 8
      ctx.stroke()
    
      const texture = new THREE.CanvasTexture(canvas)
      const material = new THREE.SpriteMaterial({ 
        map: texture, 
        transparent: true,
        depthTest: false
      })
      const sprite = new THREE.Sprite(material)
      
      sprite.position.set(hotspot.position_x, hotspot.position_y, hotspot.position_z)
      sprite.scale.set(20, 20, 1)
      sprite.userData.hotspot = hotspot
      
      return sprite
    }
    
    const fadeOut = () => {
      return new Promise(resolve => {
        let opacity = 1
        const interval = setInterval(() => {
          opacity -= 0.05
          if (currentMesh.value) {
            currentMesh.value.material.opacity = opacity
            currentMesh.value.material.transparent = true
          }
          if (opacity <= 0) {
            clearInterval(interval)
            resolve()
          }
        }, 16)
      })
    }
    
    const fadeIn = () => {
      return new Promise(resolve => {
        let opacity = 0
        if (currentMesh.value) {
          currentMesh.value.material.opacity = 0
          currentMesh.value.material.transparent = true
        }
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
      loadPanorama(newIndex)
    })
    
    watch(currentHotspots, () => {
      displayHotspots()
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
    })
    
    defineExpose({ loadPanorama })
    </script>
    
    <template>
      <div ref="renderView" class="w-full h-full"></div>
    </template>