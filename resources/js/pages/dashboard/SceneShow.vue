<script setup>
import { ref, onMounted, computed } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Upload, Trash2, Download, Grid3x3, LayoutGrid, Maximize2, X, ChevronLeft, ChevronRight, Presentation } from 'lucide-vue-next'
import { Link } from '@inertiajs/vue3'
import owl from '@/owl-sdk.js'

const props = defineProps({
  auth: Object,
  sceneSlug: String,
})

const scene = ref(null)
const project = ref(null)
const images = ref([])
const loading = ref(true)
const imageSheetOpen = ref(false)
const selectedImage = ref(null)
const viewMode = ref('grid') // 'grid', 'list', or 'slider'
const currentSlideIndex = ref(0)
const isFullscreen = ref(false)

const imageFiles = ref([])
const imageInput = ref(null)
const uploadingImages = ref(false)

const currentSlide = computed(() => images.value[currentSlideIndex.value])

const loadScene = async () => {
  try {
    loading.value = true
    const response = await owl.scenes.get(props.sceneSlug)
    scene.value = response.data
    
    // Load project data
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

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  imageFiles.value = files
}

const uploadImages = async () => {
  if (!imageFiles.value.length) return
  
  try {
    uploadingImages.value = true
    
    for (const file of imageFiles.value) {
      await owl.images.upload(props.sceneSlug, file)
    }
    
    imageSheetOpen.value = false
    imageFiles.value = []
    if (imageInput.value) {
      imageInput.value.value = ''
    }
    await loadImages()
  } catch (error) {
    console.error('Failed to upload images:', error)
  } finally {
    uploadingImages.value = false
  }
}

const deleteImage = async (imageSlug) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette image?')) return
  
  try {
    await owl.images.delete(imageSlug)
    await loadImages()
  } catch (error) {
    console.error('Failed to delete image:', error)
  }
}

const downloadImage = async (imageSlug, imagePath) => {
  try {
    const blob = await owl.images.download(imageSlug)
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = imagePath.split('/').pop()
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (error) {
    console.error('Failed to download image:', error)
  }
}

const viewImage = (image) => {
  selectedImage.value = image
}

const closeImageView = () => {
  selectedImage.value = null
}

const nextSlide = () => {
  if (currentSlideIndex.value < images.value.length - 1) {
    currentSlideIndex.value++
  }
}

const prevSlide = () => {
  if (currentSlideIndex.value > 0) {
    currentSlideIndex.value--
  }
}

const goToSlide = (index) => {
  currentSlideIndex.value = index
}

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
}

const exitFullscreen = () => {
  isFullscreen.value = false
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

onMounted(() => {
  loadScene()
})
</script>

<template>
  <DashboardLayout :auth="auth" :project="project" :scene="scene">
    <div class="mx-auto max-w-7xl">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-8">
        <Link :href="`/dashboard/projects/${scene?.project?.slug}`">
          <Button variant="ghost" size="icon">
            <ArrowLeft class="w-5 h-5" />
          </Button>
        </Link>
        <div class="flex-1">
          <h1 class="font-bold text-zinc-900 text-3xl">{{ scene?.name || 'Loading...' }}</h1>
          <p class="mt-1 text-zinc-600">{{ images.length }} image(s)</p>
        </div>
        <div class="flex items-center gap-2">
          <!-- Editor Button -->
          <Link :href="`/dashboard/editor/${sceneSlug}`">
            <Button variant="outline">
              <svg class="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
              </svg>
              Éditeur 360°
            </Button>
          </Link>

          <!-- View Mode Toggle -->
          <div class="flex gap-1 bg-zinc-100 p-1 rounded-lg">
            <Button
              variant="ghost"
              size="icon-sm"
              :class="viewMode === 'grid' ? 'bg-white shadow-sm' : ''"
              @click="viewMode = 'grid'"
            >
              <Grid3x3 class="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              :class="viewMode === 'list' ? 'bg-white shadow-sm' : ''"
              @click="viewMode = 'list'"
            >
              <LayoutGrid class="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              :class="viewMode === 'slider' ? 'bg-white shadow-sm' : ''"
              @click="viewMode = 'slider'; currentSlideIndex = 0"
            >
              <Presentation class="w-4 h-4" />
            </Button>
          </div>
          
          <!-- Upload Button -->
          <Sheet v-model:open="imageSheetOpen">
            <SheetTrigger as-child>
              <Button>
                <Upload class="mr-2 w-4 h-4" />
                Ajouter des images
              </Button>
            </SheetTrigger>
          </Sheet>
        </div>
      </div>

      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="border-4 border-zinc-300 border-t-zinc-900 rounded-full w-8 h-8 animate-spin"></div>
      </div>

      <div v-else>
        <!-- Slider View -->
        <div v-if="viewMode === 'slider' && images.length > 0" class="space-y-4">
          <Card class="overflow-hidden">
            <CardContent class="relative p-0">
              <div class="relative bg-zinc-900 aspect-video">
                <img 
                  :src="`/images/${currentSlide.slug}/download`" 
                  :alt="scene.name"
                  class="w-full h-full object-contain"
                />
                
                <!-- Fullscreen Button -->
                <Button
                  variant="secondary"
                  size="icon"
                  class="top-4 right-4 absolute"
                  @click="toggleFullscreen"
                >
                  <Maximize2 class="w-4 h-4" />
                </Button>

                <!-- Navigation Buttons -->
                <Button
                  v-if="currentSlideIndex > 0"
                  variant="secondary"
                  size="icon"
                  class="top-1/2 left-4 absolute -translate-y-1/2"
                  @click="prevSlide"
                >
                  <ChevronLeft class="w-5 h-5" />
                </Button>
                <Button
                  v-if="currentSlideIndex < images.length - 1"
                  variant="secondary"
                  size="icon"
                  class="top-1/2 right-4 absolute -translate-y-1/2"
                  @click="nextSlide"
                >
                  <ChevronRight class="w-5 h-5" />
                </Button>

                <!-- Slide Counter -->
                <div class="bottom-4 left-1/2 absolute bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs -translate-x-1/2">
                  {{ currentSlideIndex + 1 }} / {{ images.length }}
                </div>
              </div>

              <!-- Slide Info -->
              <div class="flex justify-between items-center gap-4 p-4">
                <div class="flex-1 min-w-0">
                  <p class="text-zinc-500 text-sm">{{ formatFileSize(currentSlide.size) }}</p>
                  <p class="text-zinc-400 text-xs">0 point d'accès</p>
                </div>
                <div class="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    @click="downloadImage(currentSlide.slug, currentSlide.path)"
                  >
                    <Download class="mr-2 w-4 h-4" />
                    Télécharger
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    @click="deleteImage(currentSlide.slug)"
                  >
                    <Trash2 class="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Thumbnails -->
          <div class="flex gap-2 pb-2 overflow-x-auto">
            <button
              v-for="(image, index) in images"
              :key="image.slug"
              @click="goToSlide(index)"
              :class="[
                'relative flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden transition-all',
                currentSlideIndex === index 
                  ? 'ring-2 ring-purple-500 ring-offset-2' 
                  : 'opacity-60 hover:opacity-100'
              ]"
            >
              <img 
                :src="`/images/${image.slug}/download`" 
                :alt="scene.name"
                class="w-full h-full object-cover"
              />
            </button>
          </div>
        </div>

        <!-- Grid View -->
        <div v-else-if="viewMode === 'grid'" class="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <Card 
            v-for="image in images" 
            :key="image.slug"
            class="hover:shadow-lg overflow-hidden transition-shadow cursor-pointer"
          >
            <div class="relative aspect-video" @click="viewImage(image)">
              <img 
                :src="`/images/${image.slug}/download`" 
                :alt="scene.name"
                class="w-full h-full object-cover"
              />
            </div>
            <CardContent class="flex justify-between items-center gap-2 pt-4">
              <div class="flex-1 min-w-0">
                <p class="text-zinc-500 text-sm">{{ formatFileSize(image.size) }}</p>
                <p class="text-zinc-400 text-xs">0 point d'accès</p>
              </div>
              <div class="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon-sm"
                  @click.stop="downloadImage(image.slug, image.path)"
                >
                  <Download class="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon-sm"
                  @click.stop="deleteImage(image.slug)"
                >
                  <Trash2 class="w-4 h-4 text-red-600" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- List View -->
        <div v-else-if="viewMode === 'list'" class="space-y-4">
          <Card v-for="image in images" :key="image.slug" class="hover:shadow-md transition-shadow">
            <CardContent class="flex items-center gap-4 p-4">
              <div 
                class="relative flex-shrink-0 bg-zinc-100 rounded-lg w-32 h-20 overflow-hidden cursor-pointer"
                @click="viewImage(image)"
              >
                <img 
                  :src="`/images/${image.slug}/download`" 
                  :alt="scene.name"
                  class="w-full h-full object-cover"
                />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-zinc-500 text-sm">{{ formatFileSize(image.size) }}</p>
                <p class="text-zinc-400 text-xs">Créé le {{ new Date(image.created_at).toLocaleDateString() }}</p>
                <p class="text-zinc-400 text-xs">0 point d'accès</p>
              </div>
              <div class="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  @click="downloadImage(image.slug, image.path)"
                >
                  <Download class="mr-2 w-4 h-4" />
                  Télécharger
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  @click="deleteImage(image.slug)"
                >
                  <Trash2 class="w-4 h-4 text-red-600" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Empty State -->
        <div v-if="images.length === 0" class="flex flex-col justify-center items-center bg-zinc-50 py-16 rounded-lg">
          <Upload class="mb-4 w-16 h-16 text-zinc-300" />
          <h3 class="mb-2 font-semibold text-zinc-900">Aucune image</h3>
          <p class="mb-4 text-zinc-500">Commencez par ajouter des images panoramiques à cette scène</p>
          <Button @click="imageSheetOpen = true">
            <Upload class="mr-2 w-4 h-4" />
            Ajouter des images
          </Button>
        </div>
      </div>

      <!-- Image Upload Sheet -->
      <Sheet v-model:open="imageSheetOpen">
        <SheetContent class="px-6">
          <SheetHeader>
            <SheetTitle>Ajouter des images</SheetTitle>
            <SheetDescription>
              Téléverser des images panoramiques pour {{ scene?.name }}
            </SheetDescription>
          </SheetHeader>
          <form @submit.prevent="uploadImages" class="space-y-4 mt-6">
            <div class="space-y-2">
              <Label for="image-files">Images panoramiques (max 20 MB chacune)</Label>
              <Input 
                id="image-files" 
                ref="imageInput"
                type="file" 
                accept="image/*"
                multiple
                @change="handleFileSelect"
                required
              />
              <p class="text-zinc-500 text-xs">Formats acceptés: JPG, PNG, WebP. Vous pouvez sélectionner plusieurs fichiers.</p>
              <div v-if="imageFiles.length > 0" class="space-y-1 pt-2">
                <p class="font-medium text-zinc-700 text-sm">{{ imageFiles.length }} fichier(s) sélectionné(s):</p>
                <ul class="space-y-1">
                  <li 
                    v-for="(file, index) in imageFiles" 
                    :key="index"
                    class="text-zinc-600 text-xs"
                  >
                    {{ file.name }} ({{ formatFileSize(file.size) }})
                  </li>
                </ul>
              </div>
            </div>
            <Button 
              type="submit" 
              class="w-full" 
              :disabled="imageFiles.length === 0 || uploadingImages"
            >
              <Upload class="mr-2 w-4 h-4" />
              {{ uploadingImages ? 'Téléversement...' : `Téléverser ${imageFiles.length} image(s)` }}
            </Button>
          </form>
        </SheetContent>
      </Sheet>

      <!-- Full Image View Modal -->
      <Sheet :open="!!selectedImage" @update:open="(open) => !open && closeImageView()">
        <SheetContent side="right" class="px-0 w-full sm:max-w-4xl">
          <SheetHeader class="px-6">
            <SheetTitle>Détails de l'image</SheetTitle>
            <SheetDescription>
              {{ formatFileSize(selectedImage?.size) }} • Créé le {{ new Date(selectedImage?.created_at).toLocaleDateString() }} • 0 point d'accès
            </SheetDescription>
          </SheetHeader>
          <Separator class="my-4" />
          <div class="px-6 pb-6 max-h-[calc(100vh-120px)] overflow-auto">
            <img 
              v-if="selectedImage"
              :src="`/storage/${selectedImage.path}`" 
              :alt="scene.name"
              class="rounded-lg w-full"
            />
          </div>
          <div class="flex gap-2 px-6 pb-6">
            <Button 
              variant="outline" 
              class="flex-1"
              @click="downloadImage(selectedImage.slug, selectedImage.path)"
            >
              <Download class="mr-2 w-4 h-4" />
              Télécharger
            </Button>
            <Button 
              variant="destructive" 
              @click="deleteImage(selectedImage.slug); closeImageView()"
            >
              <Trash2 class="mr-2 w-4 h-4" />
              Supprimer
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <!-- Fullscreen Modal -->
      <div 
        v-if="isFullscreen && currentSlide"
        class="z-[100] fixed inset-0 bg-black"
      >
        <!-- Close Button -->
        <Button
          variant="ghost"
          size="icon"
          class="top-4 right-4 absolute hover:bg-white/20 text-white"
          @click="exitFullscreen"
        >
          <X class="w-5 h-5" />
        </Button>

        <!-- Navigation -->
        <Button
          v-if="currentSlideIndex > 0"
          variant="ghost"
          size="icon"
          class="top-1/2 left-4 absolute hover:bg-white/20 text-white -translate-y-1/2"
          @click="prevSlide"
        >
          <ChevronLeft class="w-6 h-6" />
        </Button>
        <Button
          v-if="currentSlideIndex < images.length - 1"
          variant="ghost"
          size="icon"
          class="top-1/2 right-4 absolute hover:bg-white/20 text-white -translate-y-1/2"
          @click="nextSlide"
        >
          <ChevronRight class="w-6 h-6" />
        </Button>

        <!-- Image -->
        <div class="flex justify-center items-center w-full h-full">
          <img 
            :src="`/images/${currentSlide.slug}/download`" 
            :alt="scene.name"
            class="max-w-full max-h-full object-contain"
          />
        </div>

        <!-- Counter -->
        <div class="bottom-4 left-1/2 absolute bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white -translate-x-1/2">
          {{ currentSlideIndex + 1 }} / {{ images.length }}
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>