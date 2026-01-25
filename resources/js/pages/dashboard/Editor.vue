<script setup>
import { ref, onMounted, computed, onUnmounted, nextTick } from 'vue'
import { Link } from '@inertiajs/vue3'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Button } from '@/components/ui/button'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import EditorCanvas from '@/components/dashboard/editor/EditorCanvas.vue'
import EditorTopBar from '@/components/dashboard/editor/EditorTopBar.vue'
import HotspotTargetDialog from '@/components/dashboard/editor/HotspotTargetDialog.vue'
import HotspotOrientationDialog from '@/components/dashboard/editor/HotspotOrientationDialog.vue'
import HotspotPopover from '@/components/dashboard/editor/HotspotPopover.vue'
import ImageThumbnailsPanel from '@/components/dashboard/editor/ImageThumbnailsPanel.vue'
import HotspotsListPanel from '@/components/dashboard/editor/HotspotsListPanel.vue'
import HotspotCustomizeDialog from '@/components/dashboard/editor/HotspotCustomizeDialog.vue'
import StickerCreationDialog from '@/components/dashboard/editor/StickerCreationDialog.vue'
import StickerEditDialog from '@/components/dashboard/editor/StickerEditDialog.vue'
import StickerContextMenu from '@/components/dashboard/editor/StickerContextMenu.vue'
import EditorZoomControls from '@/components/dashboard/editor/EditorZoomControls.vue'
import { Maximize, Minimize, VenetianMask } from 'lucide-vue-next'
import owl from '@/owl-sdk.js'
import { calculateReturnRotation } from '@/lib/spatialMath.js'
import { TIMING } from '@/lib/editorConstants.js'
import { useConfirm } from '@/composables/useConfirm'
import { useApiError } from '@/composables/useApiError'
import { useEditorInteraction } from '@/composables/useEditorInteraction'
import { useHeaderVisibility } from '@/composables'

const props = defineProps({
    auth: Object,
    projectSlug: String,
})

const project = ref(null)
const scenes = ref([])
const images = ref([])
const currentImageIndex = ref(0)
const loading = ref(true)
const mode = ref('view')
const isCreatingHotspot = ref(false)
const isCreatingSticker = ref(false)
const targetDialogOpen = ref(false)
const orientationDialogOpen = ref(false)
const customizeDialogOpen = ref(false)
const stickerDialogOpen = ref(false)
const pendingHotspotPosition = ref(null)
const pendingStickerPosition = ref(null)
const pendingTargetImage = ref(null)
const pendingRotation = ref(null)
const pendingReturnPosition = ref(null)
const pendingBidirectional = ref(false)
const editingHotspot = ref(null)
const isFullscreen = ref(false)
const editorContainer = ref(null)
const isPopoverHovered = ref(false)
const editorCanvasRef = ref(null)

// Sticker edit state
const stickerEditDialogOpen = ref(false)
const stickerContextMenuVisible = ref(false)
const stickerContextMenuPosition = ref(null)
const editingSticker = ref(null)

// Immersion mode state
const isImmersive = ref(false)

// Composables
const { confirmDelete } = useConfirm()
const { handleError } = useApiError()
const interaction = useEditorInteraction()

// Hotspot hover position (calculated on demand)
const hotspotHoverPosition = ref(null)
const { isVisible: headerVisible } = useHeaderVisibility('dashboardHeaderVisible', true)
// Computed: get the currently hovered hotspot data from images
const hoveredHotspot = computed(() => {
    if (!interaction.hoveredHotspotSlug.value) return null

    // Find the hotspot by slug in current image's hotspots
    const hotspot = currentImage.value?.hotspots_from?.find(
        h => h.slug === interaction.hoveredHotspotSlug.value
    )
    return hotspot || null
})

const currentImage = computed(() => images.value[currentImageIndex.value])

// Get the scene slug for the current image (needed for hotspot creation)
const currentImageSceneSlug = computed(() => {
    const image = currentImage.value
    if (!image) return null
    const scene = scenes.value.find(s => s.images?.some(img => img.id === image.id))
    return scene?.slug || null
})

const loadProject = async () => {
    try {
        loading.value = true
        const response = await owl.projects.get(props.projectSlug)
        project.value = response
        await loadScenesWithImages()
    } catch (error) {
        console.error('Failed to load project:', error)
    } finally {
        loading.value = false
    }
}

const loadScenesWithImages = async () => {
    try {
        const response = await owl.scenes.list(props.projectSlug)
        const loadedScenes = response.data || []

        // Load images for each scene
        for (const scene of loadedScenes) {
            const imagesResponse = await owl.images.list(scene.slug)
            scene.images = imagesResponse.data || []

            // Load stickers for each image
            for (const image of scene.images) {
                try {
                    const stickersResponse = await owl.stickers.list(image.slug)
                    image.stickers = stickersResponse.data || []
                } catch (error) {
                    console.error(`Failed to load stickers for image ${image.slug}:`, error)
                    image.stickers = []
                }
            }
        }

        scenes.value = loadedScenes

        // Flatten images from all scenes into a single array for navigation
        // Keep track of scene info for each image
        const flatImages = []
        for (const scene of loadedScenes) {
            for (const image of scene.images) {
                flatImages.push({
                    ...image,
                    sceneName: scene.name,
                    sceneSlug: scene.slug
                })
            }
        }
        images.value = flatImages

        console.log('Loaded scenes with images:', scenes.value)
        console.log('Flattened images:', images.value)

        await nextTick()
        if (editorCanvasRef.value) {
            editorCanvasRef.value.displayHotspots()
            editorCanvasRef.value.displayStickers()
        }
    } catch (error) {
        console.error('Failed to load scenes with images:', error)
    }
}

const reloadImages = async () => {
    await loadScenesWithImages()
}

const startCreatingHotspot = () => {
    isCreatingHotspot.value = true
    isCreatingSticker.value = false
}

const startCreatingSticker = () => {
    isCreatingSticker.value = true
    isCreatingHotspot.value = false
}

const handleHotspotPositionSelected = (position) => {
    pendingHotspotPosition.value = position
    isCreatingHotspot.value = false
    editingHotspot.value = null
    targetDialogOpen.value = true
}

const handleStickerPositionSelected = (position) => {
    pendingStickerPosition.value = position
    isCreatingSticker.value = false
    stickerDialogOpen.value = true
}

const handleTargetImageSelected = (targetImage) => {
    pendingTargetImage.value = targetImage
    targetDialogOpen.value = false

    setTimeout(() => {
        orientationDialogOpen.value = true
    }, TIMING.DIALOG_TRANSITION_DELAY_MS)
}

const handleOrientationSaved = async (data) => {
    if (!pendingHotspotPosition.value || !currentImage.value || !pendingTargetImage.value) return

    const { rotation, createBidirectional, returnPosition } = data

    pendingRotation.value = rotation
    pendingReturnPosition.value = returnPosition
    pendingBidirectional.value = createBidirectional

    orientationDialogOpen.value = false

    // Open customize dialog
    setTimeout(() => {
        customizeDialogOpen.value = true
    }, TIMING.DIALOG_TRANSITION_DELAY_MS)
}

const handleHotspotCustomized = async (customization) => {
    if (!pendingHotspotPosition.value || !currentImage.value || !pendingTargetImage.value || !pendingRotation.value) return

    try {
        const hotspotData = {
            from_image_id: currentImage.value.id,
            to_image_id: pendingTargetImage.value.id,
            position_x: pendingHotspotPosition.value.x,
            position_y: pendingHotspotPosition.value.y,
            position_z: pendingHotspotPosition.value.z,
            target_rotation_x: pendingRotation.value.x,
            target_rotation_y: pendingRotation.value.y,
            target_rotation_z: pendingRotation.value.z,
            custom_image: customization.image,
            custom_color: customization.color,
        }

        if (editingHotspot.value) {
            console.log('Updating hotspot:', editingHotspot.value.slug)
            await owl.hotspots.update(editingHotspot.value.slug, hotspotData)
            editingHotspot.value = null
        } else {
            // Create hotspot under the scene of the current (from) image
            const fromImageSceneSlug = currentImageSceneSlug.value
            if (!fromImageSceneSlug) {
                console.error('Could not determine scene for current image')
                return
            }

            console.log('Creating new hotspot in scene:', fromImageSceneSlug)
            await owl.hotspots.create(fromImageSceneSlug, hotspotData)

            if (pendingBidirectional.value && pendingReturnPosition.value) {
                console.log('Checking for existing return hotspot')

                // Check if return hotspot already exists
                const existingReturnHotspot = images.value
                    .find(img => img.id === pendingTargetImage.value.id)
                    ?.hotspots_from
                    ?.find(h => h.to_image_id === currentImage.value.id)

                if (!existingReturnHotspot) {
                    console.log('Creating return hotspot')

                    const returnRotation = calculateReturnRotation(
                        pendingHotspotPosition.value,
                        pendingRotation.value
                    )

                    const returnHotspotData = {
                        from_image_id: pendingTargetImage.value.id,
                        to_image_id: currentImage.value.id,
                        position_x: pendingReturnPosition.value.x,
                        position_y: pendingReturnPosition.value.y,
                        position_z: pendingReturnPosition.value.z,
                        target_rotation_x: returnRotation.x,
                        target_rotation_y: returnRotation.y,
                        target_rotation_z: returnRotation.z,
                        custom_image: customization.image,
                        custom_color: customization.color,
                    }

                    // Create return hotspot under the scene of the target (to) image
                    const targetImage = images.value.find(img => img.id === pendingTargetImage.value.id)
                    const targetSceneSlug = targetImage?.sceneSlug
                    if (targetSceneSlug) {
                        await owl.hotspots.create(targetSceneSlug, returnHotspotData)
                    }
                } else {
                    console.log('Return hotspot already exists, skipping creation')
                }
            }
        }

        customizeDialogOpen.value = false
        pendingHotspotPosition.value = null
        pendingTargetImage.value = null
        pendingRotation.value = null
        pendingReturnPosition.value = null
        pendingBidirectional.value = false

        await reloadImages()
        console.log('Images reloaded after hotspot creation/update')
    } catch (error) {
        console.error('Failed to save hotspot:', error)
    }
}

const handleStickerSaved = async (stickerData) => {
    if (!currentImage.value) return

    try {
        console.log('Creating sticker:', stickerData)
        await owl.stickers.create(currentImage.value.slug, stickerData)

        stickerDialogOpen.value = false
        pendingStickerPosition.value = null

        await reloadImages()
        console.log('Images reloaded after sticker creation')
    } catch (error) {
        console.error('Failed to create sticker:', error)
    }
}

const handleStickerClick = ({ sticker, position }) => {
    editingSticker.value = sticker
    stickerContextMenuPosition.value = position
    stickerContextMenuVisible.value = true
    // Ensure the selected state is set (in case select event wasn't emitted)
    interaction.setSelectedSticker(sticker?.slug)
}

const handleEditSticker = (sticker) => {
    editingSticker.value = sticker
    stickerContextMenuVisible.value = false
    interaction.setSelectedSticker(null) // Clear selection when opening edit dialog
    stickerEditDialogOpen.value = true
}

const handleStickerEdited = async (updatedData) => {
    if (!editingSticker.value) return

    try {
        console.log('Updating sticker:', editingSticker.value.slug, updatedData)
        await owl.stickers.update(editingSticker.value.slug, updatedData)

        stickerEditDialogOpen.value = false
        editingSticker.value = null

        await reloadImages()
        console.log('Images reloaded after sticker update')
    } catch (error) {
        handleError(error, { context: 'Updating sticker', showToast: true })
    }
}

const handleContextMenuDeleteSticker = async (sticker) => {
    stickerContextMenuVisible.value = false
    interaction.setSelectedSticker(null) // Clear selection

    const confirmed = await confirmDelete('ce sticker')
    if (!confirmed) return

    await handleDeleteSticker(sticker)
}

const handleDeleteSticker = async (sticker) => {
    try {
        console.log('Deleting sticker:', sticker.slug)
        await owl.stickers.delete(sticker.slug)

        editingSticker.value = null

        await reloadImages()
        console.log('Images reloaded after sticker delete')
    } catch (error) {
        handleError(error, { context: 'Deleting sticker', showToast: true })
    }
}

const handleHotspotClick = async (hotspot) => {
    const targetIndex = images.value.findIndex(img => img.id === hotspot.to_image_id)
    if (targetIndex !== -1) {
        const hasRotation = hotspot.target_rotation_x !== null && hotspot.target_rotation_y !== null

        // Always load panorama directly to ensure it completes before reloading images
        if (editorCanvasRef.value) {
            if (hasRotation) {
                await editorCanvasRef.value.loadPanorama(targetIndex, true, {
                    x: hotspot.target_rotation_x,
                    y: hotspot.target_rotation_y,
                    z: hotspot.target_rotation_z
                })
            } else {
                await editorCanvasRef.value.loadPanorama(targetIndex, true, null, true)
            }
        }

        // Update index after panorama loads
        currentImageIndex.value = targetIndex

        // Reload images to get fresh hotspot data
        await reloadImages()
    }
}

const handleHotspotClickEdit = ({ hotspot, position }) => {
    // Reuse existing hover mechanism to show popover in edit mode
    interaction.setHoveredHotspot(hotspot?.slug)
    hotspotHoverPosition.value = position
}

const handleHotspotHoverStart = ({ slug, hotspot, position }) => {
    interaction.setHoveredHotspot(slug)
    hotspotHoverPosition.value = position
}

const handleHotspotHoverEnd = () => {
    if (!isPopoverHovered.value) {
        interaction.setHoveredHotspot(null)
        hotspotHoverPosition.value = null
    }
}

const handlePopoverMouseEnter = () => {
    isPopoverHovered.value = true
}

const handlePopoverMouseLeave = () => {
    isPopoverHovered.value = false
    interaction.setHoveredHotspot(null)
    hotspotHoverPosition.value = null
}

// Sticker interaction handlers
const handleStickerHoverStart = ({ slug }) => {
    interaction.setHoveredSticker(slug)
}

const handleStickerHoverEnd = () => {
    interaction.setHoveredSticker(null)
}

const handleStickerSelect = ({ slug }) => {
    interaction.setSelectedSticker(slug)
}

const handleImageSelect = (index) => {
    currentImageIndex.value = index
}

const handleEditHotspot = (hotspot) => {
    editingHotspot.value = hotspot
    pendingHotspotPosition.value = {
        x: hotspot.position_x,
        y: hotspot.position_y,
        z: hotspot.position_z
    }
    targetDialogOpen.value = true
}

const handleDeleteHotspot = async (hotspot) => {
    const confirmed = await confirmDelete('ce point d\'accès')
    if (!confirmed) return

    try {
        console.log('Deleting hotspot:', hotspot.slug)
        await owl.hotspots.delete(hotspot.slug)

        interaction.clearHoverStates()
        hotspotHoverPosition.value = null

        await reloadImages()
        console.log('Images reloaded after hotspot delete')
    } catch (error) {
        handleError(error, { context: 'Deleting hotspot', showToast: true })
    }
}

const handleSpriteDragEnd = async ({ type, data, newPosition, originalPosition }) => {
    try {
        console.log(`Updating ${type} position:`, data.slug, newPosition)

        if (type === 'hotspot') {
            await owl.hotspots.patch(data.slug, {
                position_x: newPosition.x,
                position_y: newPosition.y,
                position_z: newPosition.z
            })
        } else if (type === 'sticker') {
            await owl.stickers.patch(data.slug, {
                position_x: newPosition.x,
                position_y: newPosition.y,
                position_z: newPosition.z
            })
        }

        await reloadImages()
        console.log(`Images reloaded after ${type} position update`)
    } catch (error) {
        handleError(error, { context: 'Updating position', showToast: true })

        // Revert position on error by reloading
        await reloadImages()
    }
}

const toggleMode = () => {
    mode.value = mode.value === 'view' ? 'edit' : 'view'
    isCreatingHotspot.value = false
    isCreatingSticker.value = false
    // Clear all interaction state when switching modes
    interaction.clearAllStates()
    hotspotHoverPosition.value = null
    // Exit immersion mode when switching to edit mode
    if (mode.value === 'edit') {
        isImmersive.value = false
    }
}

const toggleImmersion = () => {
    isImmersive.value = !isImmersive.value
}

const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
        await editorContainer.value?.requestFullscreen()
    } else {
        await document.exitFullscreen()
    }
}

const handleFullscreenChange = () => {
    isFullscreen.value = !!document.fullscreenElement
}

const handleCameraMove = () => {
    // Close all popovers and context menus when camera moves
    interaction.clearHoverStates()
    hotspotHoverPosition.value = null
    stickerContextMenuVisible.value = false
    isPopoverHovered.value = false
}

onMounted(() => {
    loadProject()
    document.addEventListener('fullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
    document.removeEventListener('fullscreenchange', handleFullscreenChange)
})
</script>

<template>
    <DashboardLayout :auth="auth" :project="project" :collapsible-header="true">
        <div ref="editorContainer" :class="[
            'relative -m-6 w-[calc(100%+3rem)]',
            isFullscreen || !headerVisible ? 'h-screen' : 'h-[calc(100vh-4rem)]'
        ]">
            <LoadingSpinner v-if="loading" class="absolute inset-0 bg-zinc-950" />

            <EmptyState v-else-if="images.length === 0" title="Aucune image dans ce projet"
                class="absolute inset-0 bg-zinc-950 text-white">
                <Link :href="`/dashboard/projects/${projectSlug}`">
                    <Button>Ajouter des images</Button>
                </Link>
            </EmptyState>

            <div v-else class="relative w-full h-full">
                <EditorCanvas ref="editorCanvasRef" :images="images" :current-index="currentImageIndex" :mode="mode"
                    :is-creating-hotspot="isCreatingHotspot" :is-creating-sticker="isCreatingSticker"
                    :hovered-hotspot-slug="interaction.hoveredHotspotSlug.value"
                    :hovered-sticker-slug="interaction.hoveredStickerSlug.value"
                    :selected-sticker-slug="interaction.selectedStickerSlug.value"
                    @hotspot-click="handleHotspotClick" @hotspot-click-edit="handleHotspotClickEdit"
                    @hotspot-position-selected="handleHotspotPositionSelected"
                    @sticker-position-selected="handleStickerPositionSelected" @sticker-click="handleStickerClick"
                    @sticker-select="handleStickerSelect"
                    @sticker-hover-start="handleStickerHoverStart" @sticker-hover-end="handleStickerHoverEnd"
                    @sprite-drag-end="handleSpriteDragEnd" @camera-move="handleCameraMove"
                    @hotspot-hover-start="handleHotspotHoverStart" @hotspot-hover-end="handleHotspotHoverEnd" />

                <!-- Control buttons on right side (middle height to avoid overlap) -->
                <div class="top-1/2 right-6 z-10 absolute flex flex-col gap-2 -translate-y-1/2">
                    <!-- Fullscreen button (always visible when not in immersion mode) -->
                    <Transition name="fade">
                        <Button
                            v-show="!isImmersive"
                            @click="toggleFullscreen"
                            size="icon"
                            variant="secondary"
                            class="bg-white/90 hover:bg-white dark:bg-zinc-800/90 dark:hover:bg-zinc-800 shadow-lg backdrop-blur w-10 h-10"
                            :title="isFullscreen ? 'Quitter le plein écran' : 'Plein écran'"
                        >
                            <Maximize v-if="!isFullscreen" class="w-5 h-5" />
                            <Minimize v-else class="w-5 h-5" />
                        </Button>
                    </Transition>

                    <!-- Immersion mode toggle (only in view mode, not in immersion) -->
                    <Transition name="fade">
                        <Button
                            v-show="mode === 'view' && !isImmersive"
                            @click="toggleImmersion"
                            size="icon"
                            variant="secondary"
                            class="bg-white/90 hover:bg-white dark:bg-zinc-800/90 dark:hover:bg-zinc-800 shadow-lg backdrop-blur w-10 h-10"
                            title="Mode immersion"
                        >
                            <VenetianMask class="w-5 h-5" />
                        </Button>
                    </Transition>

                    <!-- Exit immersion button (only visible in immersion mode) -->
                    <Transition name="fade">
                        <Button
                            v-show="isImmersive"
                            @click="toggleImmersion"
                            size="icon"
                            variant="secondary"
                            class="bg-white/10 hover:bg-white/20 dark:bg-zinc-800/10 dark:hover:bg-zinc-800/20 shadow-lg backdrop-blur w-10 h-10"
                            title="Quitter le mode immersion"
                        >
                            <VenetianMask class="w-5 h-5" />
                        </Button>
                    </Transition>
                </div>

                <Transition name="fade">
                    <EditorTopBar
                        v-show="!isImmersive"
                        :project-name="project?.name"
                        :project-slug="projectSlug"
                        :current-scene-name="currentImage?.sceneName"
                        :mode="mode"
                        @create-hotspot="startCreatingHotspot"
                        @create-sticker="startCreatingSticker"
                        @toggle-mode="toggleMode"
                    />
                </Transition>

                <Transition name="fade">
                    <ImageThumbnailsPanel
                        v-show="!isImmersive"
                        :images="images"
                        :scenes="scenes"
                        :current-index="currentImageIndex"
                        @select="handleImageSelect"
                    />
                </Transition>

                <Transition name="fade">
                    <EditorZoomControls
                        v-show="!isImmersive"
                        :controls="editorCanvasRef?.controls"
                    />
                </Transition>

                <Transition name="fade">
                    <HotspotsListPanel
                        v-if="mode === 'edit'"
                        v-show="!isImmersive"
                        :current-image="currentImage"
                        @edit="handleEditHotspot"
                        @delete="handleDeleteHotspot"
                        class="z-20"
                    />
                </Transition>

                <HotspotPopover :hotspot="hoveredHotspot" :position="hotspotHoverPosition" :mode="mode"
                    :visible="!!hoveredHotspot" @edit="handleEditHotspot" @delete="handleDeleteHotspot"
                    @mouseenter="handlePopoverMouseEnter" @mouseleave="handlePopoverMouseLeave" />

                <HotspotTargetDialog v-model:open="targetDialogOpen" :all-scenes="scenes"
                    :current-image-id="currentImage?.id" @select="handleTargetImageSelected" />

                <HotspotOrientationDialog v-model:open="orientationDialogOpen" :target-image="pendingTargetImage"
                    :initial-rotation="editingHotspot && editingHotspot.target_rotation_x !== null ?
                        { x: editingHotspot.target_rotation_x, y: editingHotspot.target_rotation_y, z: editingHotspot.target_rotation_z }
                        : null
                        " @save="handleOrientationSaved" />

                <HotspotCustomizeDialog v-model:open="customizeDialogOpen" @save="handleHotspotCustomized" />

                <StickerCreationDialog v-model:open="stickerDialogOpen" :position="pendingStickerPosition"
                    @save="handleStickerSaved" />

                <StickerContextMenu :sticker="editingSticker" :position="stickerContextMenuPosition"
                    :visible="stickerContextMenuVisible" @edit="handleEditSticker"
                    @delete="handleContextMenuDeleteSticker" />

                <StickerEditDialog v-model:open="stickerEditDialogOpen" :sticker="editingSticker"
                    @save="handleStickerEdited" />
            </div>
        </div>
    </DashboardLayout>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>