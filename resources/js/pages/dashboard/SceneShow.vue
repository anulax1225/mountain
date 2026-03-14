<script setup>
import { ref, computed, watch } from 'vue'
import { Link, router } from '@inertiajs/vue3'
import draggable from 'vuedraggable'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Button } from '@/components/ui/button'
import EmptyState from '@/components/common/EmptyState.vue'
import ImageCard from '@/components/dashboard/scene/ImageCard.vue'
import ImageListItem from '@/components/dashboard/scene/ImageListItem.vue'
import ImageSlider from '@/components/dashboard/scene/ImageSlider.vue'
import ImageThumbnails from '@/components/dashboard/scene/ImageThumbnails.vue'
import ViewModeToggle from '@/components/dashboard/scene/ViewModeToggle.vue'
import ImageUploadSheet from '@/components/dashboard/scene/ImageUploadSheet.vue'
import ImageDetailsSheet from '@/components/dashboard/scene/ImageDetailsSheet.vue'
import ImageFullscreen from '@/components/dashboard/scene/ImageFullscreen.vue'
import { ArrowLeft, Upload } from 'lucide-vue-next'
import owl from '@/owl-sdk.js'
import { useConfirm } from '@/composables/useConfirm'
import { useFileDownload } from '@/composables/useFileDownload'
import { useViewMode } from '@/composables/useViewMode'

const props = defineProps({
  auth: Object,
  scene: Object,
})

const project = computed(() => props.scene?.project || null)
const localImages = ref([...(props.scene?.images || [])])

watch(() => props.scene?.images, (newImages) => {
  if (newImages) {
    localImages.value = [...newImages]
  }
})

const currentSlideIndex = ref(0)
const uploadSheetOpen = ref(false)
const detailsSheetOpen = ref(false)
const fullscreenOpen = ref(false)
const selectedImage = ref(null)

// Permissions
const canEdit = computed(() => project.value?.permissions?.can_edit ?? false)

// Composables
const { confirmDelete } = useConfirm()
const { downloadBlob } = useFileDownload()
const { viewMode } = useViewMode('sceneViewMode', 'grid', ['grid', 'list', 'slider'])

const handleUploadComplete = () => {
  uploadSheetOpen.value = false
  router.reload()
}

const deleteImage = async (imageSlug) => {
  const confirmed = await confirmDelete('cette image')
  if (!confirmed) return

  router.delete(`/dashboard/images/${imageSlug}`, {
    preserveScroll: true,
  })
}

const downloadImage = async (imageSlug, imagePath) => {
  try {
    const blob = await owl.images.download(imageSlug)
    const filename = imagePath.split('/').pop()
    downloadBlob(blob, filename)
  } catch (error) {
    console.error('Failed to download image:', error)
  }
}

const viewImage = (image) => {
  selectedImage.value = image
  detailsSheetOpen.value = true
}

const handleImageReplaced = () => {
  router.reload()
}

const onDragEnd = async () => {
  const slugs = localImages.value.map(img => img.slug)
  try {
    await owl.images.reorder(props.scene.slug, slugs)
  } catch (error) {
    console.error('Failed to reorder images:', error)
    router.reload()
  }
}
</script>

<template>
  <DashboardLayout :auth="auth" :project="project" :scene="scene">
    <div class="mx-auto max-w-7xl">
      <div class="mb-6 md:mb-8 space-y-4">
        <div class="flex items-center gap-4">
          <Link :href="`/dashboard/projects/${scene?.project?.slug}`">
            <Button variant="ghost" size="icon">
              <ArrowLeft class="w-5 h-5" />
            </Button>
          </Link>
          <div class="flex-1 min-w-0">
            <h1 class="font-bold text-foreground text-2xl md:text-3xl truncate">{{ scene?.name }}</h1>
            <p class="mt-1 text-muted-foreground">{{ localImages.length }} image(s)</p>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <Link :href="`/dashboard/editor/${scene?.project?.slug}`">
            <Button variant="outline">
              <svg class="sm:mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
              </svg>
              <span class="hidden sm:inline">Éditeur 360°</span>
            </Button>
          </Link>
          <ViewModeToggle v-model="viewMode" @update:model-value="currentSlideIndex = 0" />
          <Button v-if="canEdit" @click="uploadSheetOpen = true">
            <Upload class="sm:mr-2 w-4 h-4" />
            <span class="hidden sm:inline">Ajouter des images</span>
          </Button>
        </div>
      </div>

      <div v-if="viewMode === 'slider' && localImages.length > 0" class="space-y-4">
        <ImageSlider
          :images="localImages"
          v-model:current-index="currentSlideIndex"
          :scene-name="scene.name"
          :can-edit="canEdit"
          @download="downloadImage"
          @delete="deleteImage"
          @fullscreen="fullscreenOpen = true"
        />
        <ImageThumbnails
          :images="localImages"
          :current-index="currentSlideIndex"
          :scene-name="scene.name"
          @select="currentSlideIndex = $event"
        />
      </div>

      <draggable
        v-else-if="viewMode === 'grid'"
        v-model="localImages"
        item-key="slug"
        :disabled="!canEdit"
        class="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        ghost-class="opacity-30"
        @end="onDragEnd"
      >
        <template #item="{ element: image }">
          <ImageCard
            :image="image"
            :scene-name="scene.name"
            :can-edit="canEdit"
            @view="viewImage"
            @download="downloadImage"
            @delete="deleteImage"
          />
        </template>
      </draggable>

      <draggable
        v-else-if="viewMode === 'list'"
        v-model="localImages"
        item-key="slug"
        :disabled="!canEdit"
        class="space-y-4"
        ghost-class="opacity-30"
        handle=".drag-handle"
        @end="onDragEnd"
      >
        <template #item="{ element: image }">
          <ImageListItem
            :image="image"
            :scene-name="scene.name"
            :can-edit="canEdit"
            @view="viewImage"
            @download="downloadImage"
            @delete="deleteImage"
          />
        </template>
      </draggable>

      <EmptyState
        v-if="localImages.length === 0"
        :icon="Upload"
        title="Aucune image"
        :description="canEdit ? 'Commencez par ajouter des images panoramiques à cette scène' : 'Cette scène ne contient pas encore d\'images'"
      >
        <Button v-if="canEdit" @click="uploadSheetOpen = true">
          <Upload class="mr-2 w-4 h-4" />
          Ajouter des images
        </Button>
      </EmptyState>

      <ImageUploadSheet
        v-model:open="uploadSheetOpen"
        :scene-slug="scene?.slug"
        @upload-complete="handleUploadComplete"
      />

      <ImageDetailsSheet
        v-model:open="detailsSheetOpen"
        :image="selectedImage"
        :scene-name="scene?.name"
        :can-edit="canEdit"
        @download="downloadImage"
        @delete="deleteImage"
        @image-replaced="handleImageReplaced"
      />

      <ImageFullscreen
        v-model:open="fullscreenOpen"
        :images="localImages"
        v-model:current-index="currentSlideIndex"
        :scene-name="scene?.name"
      />
    </div>
  </DashboardLayout>
</template>
