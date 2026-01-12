<script setup>
import { ref, onMounted, onUnmounted, watch, shallowRef } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const props = defineProps({
  images: Array,
  currentIndex: Number
})

const emit = defineEmits(['ready'])

const renderView = ref(null)
const threeScene = shallowRef(null)
const camera = shallowRef(null)
const renderer = shallowRef(null)
const controls = shallowRef(null)
const currentMesh = shallowRef(null)
const textureLoader = shallowRef(null)

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

  textureLoader.value = new THREE.TextureLoader()

  const animate = () => {
    controls.value.update()
    renderer.value.render(threeScene.value, camera.value)
  }
  renderer.value.setAnimationLoop(animate)

  window.addEventListener('resize', onResize)
  emit('ready')
}

const loadPanorama = async (index) => {
  if (!props.images[index] || !threeScene.value) return

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

onMounted(() => {
  initThreeJS()
  if (props.images.length > 0) {
    loadPanorama(props.currentIndex)
  }
})

onUnmounted(() => {
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