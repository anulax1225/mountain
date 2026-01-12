<script setup>
import { ref, onMounted, onUnmounted, shallowRef, useTemplateRef } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Move, Maximize2, Info, ChevronLeft, ChevronRight, X } from 'lucide-vue-next'
import { Link } from '@inertiajs/vue3'
import owl from '@/owl-sdk.js'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const props = defineProps({
  auth: Object,
  sceneSlug: String,
})

const scene = ref(null)
const project = ref(null)
const images = ref([])
const currentImageIndex = ref(0)
const loading = ref(true)

const renderView = ref(null);
const threeScene = shallowRef(null)
const camera = shallowRef(null)
const renderer = shallowRef(null)
const controls = shallowRef(null)
const currentMesh = shallowRef(null)
const textureLoader = shallowRef(null)

const isFullscreen = ref(false)
const showInfo = ref(true)
const showThumbnails = ref(true)

const loadScene = async () => {
  try {
    loading.value = true
    const response = await owl.scenes.get(props.sceneSlug)
    scene.value = response.data

    if (scene.value?.project) {
      project.value = scene.value.project
    }

    await loadImages()
  } catch (error) {
    console.error('Failed to load scene:', error)
  } finally {
    loading.value = false
  }
}

const loadImages = async () => {
  try {
    const response = await owl.images.list(props.sceneSlug)
    images.value = response.data || []
  } catch (error) {
    console.error('Failed to load images:', error)
  }
}

const initThreeJS = async () => {
  if (!renderView.value) renderView.value = document.querySelector("#renderView");
  
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
}

const loadPanorama = async (index) => {
  if (!images.value[index] || !threeScene.value) return

  currentImageIndex.value = index

  if (currentMesh.value) {
    threeScene.value.remove(currentMesh.value)
  }

  const texture = await textureLoader.value.loadAsync(`/images/${images.value[index].slug}/download`)
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

const toggleFullscreen = () => {
  if (!isFullscreen.value) {
    document.querySelector("#fullscreenElement").requestFullscreen();
    isFullscreen.value = true
  } else {
    if (document.fullscreenElement) document.exitFullscreen()
    isFullscreen.value = false
  }
}

const nextImage = () => {
  if (currentImageIndex.value < images.value.length - 1) {
    loadPanorama(currentImageIndex.value + 1)
  }
}

const prevImage = () => {
  if (currentImageIndex.value > 0) {
    loadPanorama(currentImageIndex.value - 1)
  }
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const init = async () => {
  await loadScene();
  await initThreeJS();
  await loadPanorama(0);
}

onMounted(async () => {
  await init();
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  if (renderer.value) {
    renderer.value.dispose()
  }
})
</script>

<template>
  <DashboardLayout :auth="auth" :project="project" :scene="scene">
    <div class="relative -m-6 w-[calc(100%+3rem)] h-[calc(100vh-4rem)]">
      <div v-if="loading" class="absolute inset-0 flex justify-center items-center bg-zinc-900">
        <div class="border-4 border-zinc-600 border-t-white rounded-full w-8 h-8 animate-spin"></div>
      </div>

      <div v-else-if="images.length === 0"
        class="absolute inset-0 flex flex-col justify-center items-center bg-zinc-900">
        <p class="mb-4 text-white">Aucune image dans cette scène</p>
        <Link :href="`/dashboard/scenes/${sceneSlug}`">
          <Button>Ajouter des images</Button>
        </Link>
      </div>

      <div v-else id="fullscreenElement" class="relative w-full h-full">
        <!-- Canvas -->
        <div id="renderView" class="w-full h-full"></div>

        <!-- Top Bar -->
        <div class="top-0 right-0 left-0 absolute bg-gradient-to-b from-black/50 to-transparent backdrop-blur-sm p-4">
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-3">
              <Link :href="`/dashboard/scenes/${sceneSlug}`">
                <Button variant="secondary" size="icon-sm">
                  <ArrowLeft class="w-4 h-4" />
                </Button>
              </Link>
              <div class="text-white">
                <h1 class="font-semibold text-sm">{{ scene?.name }}</h1>
                <p class="text-white/60 text-xs">Éditeur 360°</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <Button variant="secondary" size="sm" @click="showThumbnails = !showThumbnails">
                {{ showThumbnails ? 'Masquer' : 'Afficher' }} miniatures
              </Button>
              <Button variant="secondary" size="sm" @click="showInfo = !showInfo">
                <Info class="mr-2 w-4 h-4" />
                {{ showInfo ? 'Masquer' : 'Afficher' }} infos
              </Button>
              <Button variant="secondary" size="icon-sm" @click="toggleFullscreen">
                <Maximize2 class="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <!-- Navigation Arrows -->
        <div class="top-1/2 left-4 absolute -translate-y-1/2" v-if="currentImageIndex > 0">
          <Button variant="secondary" size="icon" @click="prevImage">
            <ChevronLeft class="w-5 h-5" />
          </Button>
        </div>
        <div class="top-1/2 right-4 absolute -translate-y-1/2" v-if="currentImageIndex < images.length - 1">
          <Button variant="secondary" size="icon" @click="nextImage">
            <ChevronRight class="w-5 h-5" />
          </Button>
        </div>

        <!-- Mode Indicator -->
        <div class="right-6 bottom-6 absolute">
          <div
            class="flex items-center gap-2 bg-purple-500/90 dark:bg-purple-600/90 backdrop-blur-sm px-3 py-2 rounded-lg text-white text-xs">
            <Move class="w-4 h-4" />
            <span>Mode Navigation</span>
          </div>
        </div>

        <!-- Thumbnails -->
        <div class="right-0 bottom-0 left-0 absolute flex flex-col items-center gap-2">
          <div
            class="bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full max-w-16 text-white text-sm -translate-x-1/2">
            {{ currentImageIndex + 1 }} / {{ images.length }}
          </div>
          <div v-if="showThumbnails"
            class="bg-black/50 backdrop-blur-sm p-3 rounded-lg">
            <div class="flex gap-x-4 overflow-x-auto">
              <button v-for="(image, index) in images" :key="image.slug" @click="loadPanorama(index)" :class="[
                'relative flex-shrink-0 w-24 h-16 rounded-md overflow-hidden transition-all',
                currentImageIndex === index
                  ? 'border border-white/75'
                  : 'opacity-60 hover:opacity-100'
              ]">
                <img :src="`/images/${image.slug}/download`" :alt="scene.name" class="w-full h-full object-cover" />
              </button>
            </div>
          </div>
        </div>

        <!-- Info Panel -->
        <div v-if="showInfo" class="top-20 right-4 absolute w-72">
          <Card class="bg-black/50 dark:bg-black/70 backdrop-blur-md border-white/20 dark:border-white/10">
            <CardContent class="space-y-4 pt-6 text-white">
              <div>
                <h3 class="mb-3 font-semibold">Image actuelle</h3>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-white/60">Taille:</span>
                    <span class="font-medium">
                      {{ Math.round(images[currentImageIndex].size / 1024 / 1024 * 100) / 100 }} MB
                    </span>
                  </div>
                </div>
              </div>

              <div class="pt-4 border-white/20 dark:border-white/10 border-t">
                <h3 class="mb-3 font-semibold">Points d'accès</h3>
                <div class="flex flex-col justify-center items-center bg-white/5 py-8 rounded-lg">
                  <Info class="mb-2 w-8 h-8 text-white/40" />
                  <p class="text-white/60 text-xs text-center">Aucun point d'accès</p>
                </div>
              </div>

              <div class="pt-4 border-white/20 dark:border-white/10 border-t">
                <h3 class="mb-3 font-semibold">Contrôles</h3>
                <div class="space-y-2 text-white/60 text-xs">
                  <div class="flex items-center gap-2">
                    <div class="bg-white/10 px-2 py-1 rounded font-mono">Clic + Glisser</div>
                    <span>Rotation</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="bg-white/10 px-2 py-1 rounded font-mono">Molette</div>
                    <span>Zoom</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>