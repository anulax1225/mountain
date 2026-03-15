<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { Link, router } from '@inertiajs/vue3'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Button } from '@/components/ui/button'
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
import BlurRegionDialog from '@/components/dashboard/editor/BlurRegionDialog.vue'
import BlurRegionContextMenu from '@/components/dashboard/editor/BlurRegionContextMenu.vue'
import EditorZoomControls from '@/components/dashboard/editor/EditorZoomControls.vue'
import { Maximize, Minimize, VenetianMask, Hd, Loader2 } from 'lucide-vue-next'
import owl from '@/owl-sdk.js'
import { calculateReturnRotation } from '@/lib/spatialMath.js'
import { TIMING } from '@/lib/editorConstants.js'
import { useConfirm } from '@/composables/useConfirm'
import { useApiError } from '@/composables/useApiError'
import { provideEditorInteraction } from '@/composables/useEditorInteraction'
import { useHeaderVisibility } from '@/composables'

const props = defineProps({
    auth: Object,
    project: Object,
    scenes: Array,
    canEdit: Boolean,
})

// Flatten images from scenes into a single array for navigation
const images = computed(() => {
    if (!props.scenes) return []
    const flat = []
    for (const scene of props.scenes) {
        for (const image of (scene.images || [])) {
            flat.push({
                ...image,
                sceneName: scene.name,
                sceneSlug: scene.slug,
            })
        }
    }
    return flat
})

const currentImageIndex = ref(0)
const mode = ref('view')
const isCreatingHotspot = ref(false)
const isCreatingSticker = ref(false)
const isCreatingBlurRegion = ref(false)
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
const editorCanvasRef = ref(null)

// Sticker edit state
const stickerEditDialogOpen = ref(false)
const stickerContextMenuVisible = ref(false)
const stickerContextMenuPosition = ref(null)
const editingSticker = ref(null)

// Blur region state
const blurRegionDialogOpen = ref(false)
const blurRegionContextMenuVisible = ref(false)
const blurRegionContextMenuPosition = ref(null)
const pendingBlurRegionPosition = ref(null)
const editingBlurRegion = ref(null)

// Immersion mode state
const isImmersive = ref(false)

// Composables
const { confirmDelete } = useConfirm()
const { handleError } = useApiError()
const interaction = provideEditorInteraction()

const { isVisible: headerVisible } = useHeaderVisibility('dashboardHeaderVisible', true)

// Computed: get the currently hovered hotspot data from images
const hoveredHotspot = computed(() => {
    if (!interaction.hoveredHotspotSlug.value) return null

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
    const scene = props.scenes?.find(s => s.images?.some(img => img.id === image.id))
    return scene?.slug || null
})

// Reload scenes data from server after API mutations
const reloadImages = () => {
    router.reload({ only: ['scenes'], preserveState: true })
}

// Re-display sprites when scenes prop changes
watch(() => props.scenes, async () => {
    await nextTick()
    if (editorCanvasRef.value) {
        editorCanvasRef.value.displayHotspots()
        editorCanvasRef.value.displayStickers()
        editorCanvasRef.value.displayBlurRegions()
    }
}, { deep: true })

const startCreatingHotspot = () => {
    isCreatingHotspot.value = true
    isCreatingSticker.value = false
    isCreatingBlurRegion.value = false
}

const startCreatingSticker = () => {
    isCreatingSticker.value = true
    isCreatingHotspot.value = false
    isCreatingBlurRegion.value = false
}

const startCreatingBlurRegion = () => {
    isCreatingBlurRegion.value = true
    isCreatingHotspot.value = false
    isCreatingSticker.value = false
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
            await owl.hotspots.update(editingHotspot.value.slug, hotspotData)
            editingHotspot.value = null
        } else {
            const fromImageSceneSlug = currentImageSceneSlug.value
            if (!fromImageSceneSlug) {
                console.error('Could not determine scene for current image')
                return
            }

            await owl.hotspots.create(fromImageSceneSlug, hotspotData)

            if (pendingBidirectional.value && pendingReturnPosition.value) {
                const existingReturnHotspot = images.value
                    .find(img => img.id === pendingTargetImage.value.id)
                    ?.hotspots_from
                    ?.find(h => h.to_image_id === currentImage.value.id)

                if (!existingReturnHotspot) {
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

                    const targetImage = images.value.find(img => img.id === pendingTargetImage.value.id)
                    const targetSceneSlug = targetImage?.sceneSlug
                    if (targetSceneSlug) {
                        await owl.hotspots.create(targetSceneSlug, returnHotspotData)
                    }
                }
            }
        }

        customizeDialogOpen.value = false
        pendingHotspotPosition.value = null
        pendingTargetImage.value = null
        pendingRotation.value = null
        pendingReturnPosition.value = null
        pendingBidirectional.value = false

        reloadImages()
    } catch (error) {
        console.error('Failed to save hotspot:', error)
    }
}

const handleStickerSaved = async (stickerData) => {
    if (!currentImage.value) return

    try {
        await owl.stickers.create(currentImage.value.slug, stickerData)

        stickerDialogOpen.value = false
        pendingStickerPosition.value = null

        reloadImages()
    } catch (error) {
        console.error('Failed to create sticker:', error)
    }
}

const handleStickerClick = ({ sticker, position }) => {
    editingSticker.value = sticker
    stickerContextMenuPosition.value = position
    stickerContextMenuVisible.value = true
    interaction.setSelectedSticker(sticker?.slug)
}

const handleEditSticker = (sticker) => {
    editingSticker.value = sticker
    stickerContextMenuVisible.value = false
    interaction.setSelectedSticker(null)
    stickerEditDialogOpen.value = true
}

const handleStickerEdited = async (updatedData) => {
    if (!editingSticker.value) return

    try {
        await owl.stickers.update(editingSticker.value.slug, updatedData)

        stickerEditDialogOpen.value = false
        editingSticker.value = null

        reloadImages()
    } catch (error) {
        handleError(error, { context: 'Updating sticker', showToast: true })
    }
}

const handleContextMenuDeleteSticker = async (sticker) => {
    stickerContextMenuVisible.value = false
    interaction.setSelectedSticker(null)

    const confirmed = await confirmDelete('ce sticker')
    if (!confirmed) return

    await handleDeleteSticker(sticker)
}

const handleDeleteSticker = async (sticker) => {
    try {
        await owl.stickers.delete(sticker.slug)

        editingSticker.value = null

        reloadImages()
    } catch (error) {
        handleError(error, { context: 'Deleting sticker', showToast: true })
    }
}

// --- Blur region handlers ---
const handleBlurRegionPositionSelected = (position) => {
    pendingBlurRegionPosition.value = position
    isCreatingBlurRegion.value = false
    editingBlurRegion.value = null
    blurRegionDialogOpen.value = true
}

const handleBlurRegionSaved = async (data) => {
    if (!currentImage.value) return

    try {
        if (editingBlurRegion.value) {
            await owl.blurRegions.update(editingBlurRegion.value.slug, data)
            editingBlurRegion.value = null
        } else {
            await owl.blurRegions.create(currentImage.value.slug, data)
        }

        blurRegionDialogOpen.value = false
        pendingBlurRegionPosition.value = null

        reloadImages()
    } catch (error) {
        handleError(error, { context: 'Saving blur region', showToast: true })
    }
}

const handleBlurRegionClick = ({ blurRegion, position }) => {
    editingBlurRegion.value = blurRegion
    blurRegionContextMenuPosition.value = position
    blurRegionContextMenuVisible.value = true
    interaction.setSelectedBlurRegion(blurRegion?.slug)
}

const handleEditBlurRegion = (blurRegion) => {
    editingBlurRegion.value = blurRegion
    blurRegionContextMenuVisible.value = false
    interaction.setSelectedBlurRegion(null)
    blurRegionDialogOpen.value = true
}

const handleContextMenuDeleteBlurRegion = async (blurRegion) => {
    blurRegionContextMenuVisible.value = false
    interaction.setSelectedBlurRegion(null)

    const confirmed = await confirmDelete('cette zone de flou')
    if (!confirmed) return

    try {
        await owl.blurRegions.delete(blurRegion.slug)
        editingBlurRegion.value = null
        reloadImages()
    } catch (error) {
        handleError(error, { context: 'Deleting blur region', showToast: true })
    }
}

const handleHotspotClick = async (hotspot) => {
    const targetIndex = images.value.findIndex(img => img.id === hotspot.to_image_id)
    if (targetIndex !== -1) {
        const hasRotation = hotspot.target_rotation_x !== null && hotspot.target_rotation_y !== null

        // Update index BEFORE loading so displayHotspots() inside loadPanorama reads the correct image's hotspots
        currentImageIndex.value = targetIndex

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

        reloadImages()
    }
}

const handleHotspotClickEdit = ({ hotspot, position }) => {
    interaction.setHoveredHotspotWithPosition(hotspot?.slug, position)
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
        await owl.hotspots.delete(hotspot.slug)

        interaction.clearHoverStates()

        reloadImages()
    } catch (error) {
        handleError(error, { context: 'Deleting hotspot', showToast: true })
    }
}

const handleSpriteDragEnd = async ({ type, data, newPosition, originalPosition }) => {
    try {
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
        } else if (type === 'blurRegion') {
            await owl.blurRegions.patch(data.slug, {
                position_x: newPosition.x,
                position_y: newPosition.y,
                position_z: newPosition.z
            })
        }

        reloadImages()
    } catch (error) {
        handleError(error, { context: 'Updating position', showToast: true })

        reloadImages()
    }
}

const toggleMode = () => {
    if (!props.canEdit) return
    mode.value = mode.value === 'view' ? 'edit' : 'view'
    isCreatingHotspot.value = false
    isCreatingSticker.value = false
    isCreatingBlurRegion.value = false
    interaction.clearAllStates()
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

// Close sticker context menu when interaction state is cleared (e.g. camera move)
watch(interaction.selectedStickerSlug, (slug) => {
    if (!slug) {
        stickerContextMenuVisible.value = false
    }
})

// Close blur region context menu when interaction state is cleared
watch(interaction.selectedBlurRegionSlug, (slug) => {
    if (!slug) {
        blurRegionContextMenuVisible.value = false
    }
})

onMounted(() => {
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
            isFullscreen || !headerVisible ? 'h-screen' : 'h-[calc(100dvh-4rem)]'
        ]">
            <EmptyState v-if="images.length === 0" title="Aucune image dans ce projet"
                class="absolute inset-0 bg-zinc-950 text-white">
                <Link :href="`/dashboard/projects/${project?.slug}`">
                    <Button>Ajouter des images</Button>
                </Link>
            </EmptyState>

            <div v-else class="relative w-full h-full">
                <EditorCanvas ref="editorCanvasRef" :images="images" :current-index="currentImageIndex" :mode="mode"
                    :is-creating-hotspot="isCreatingHotspot" :is-creating-sticker="isCreatingSticker"
                    :is-creating-blur-region="isCreatingBlurRegion"
                    @hotspot-click="handleHotspotClick" @hotspot-click-edit="handleHotspotClickEdit"
                    @hotspot-position-selected="handleHotspotPositionSelected"
                    @sticker-position-selected="handleStickerPositionSelected" @sticker-click="handleStickerClick"
                    @blur-region-click="handleBlurRegionClick"
                    @blur-region-position-selected="handleBlurRegionPositionSelected"
                    @sprite-drag-end="handleSpriteDragEnd" />

                <!-- HD loading indicator -->
                <Transition name="fade">
                    <div v-if="editorCanvasRef?.isLoadingFullRes" class="top-16 left-4 z-40 absolute flex items-center gap-1.5 bg-black/60 backdrop-blur px-2.5 py-1 rounded-full text-white">
                        <Hd class="w-4 h-4" />
                        <Loader2 class="w-3.5 h-3.5 animate-spin" />
                    </div>
                </Transition>

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
                        :project-slug="project?.slug"
                        :current-scene-name="currentImage?.sceneName"
                        :mode="mode"
                        :can-edit="canEdit"
                        @create-hotspot="startCreatingHotspot"
                        @create-sticker="startCreatingSticker"
                        @create-blur-region="startCreatingBlurRegion"
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

                <HotspotPopover :hotspot="hoveredHotspot" :position="interaction.hotspotHoverPosition.value" :mode="mode"
                    :visible="!!hoveredHotspot" @edit="handleEditHotspot" @delete="handleDeleteHotspot"
                    @mouseenter="interaction.handlePopoverMouseEnter" @mouseleave="interaction.handlePopoverMouseLeave" />

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

                <BlurRegionDialog v-model:open="blurRegionDialogOpen" :position="pendingBlurRegionPosition"
                    :blur-region="editingBlurRegion" @save="handleBlurRegionSaved" />

                <BlurRegionContextMenu :blur-region="editingBlurRegion" :position="blurRegionContextMenuPosition"
                    :visible="blurRegionContextMenuVisible" @edit="handleEditBlurRegion"
                    @delete="handleContextMenuDeleteBlurRegion" />
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
