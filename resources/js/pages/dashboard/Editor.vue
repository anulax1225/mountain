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
    import owl from '@/owl-sdk.js'
    
    const props = defineProps({
        auth: Object,
        sceneSlug: String,
    })
    
    const scene = ref(null)
    const project = ref(null)
    const images = ref([])
    const allScenes = ref([])
    const currentImageIndex = ref(0)
    const loading = ref(true)
    const mode = ref('view')
    const isCreatingHotspot = ref(false)
    const targetDialogOpen = ref(false)
    const orientationDialogOpen = ref(false)
    const pendingHotspotPosition = ref(null)
    const pendingTargetImage = ref(null)
    const pendingRotation = ref(null)
    const hoveredHotspot = ref(null)
    const hotspotHoverPosition = ref(null)
    const editingHotspot = ref(null)
    const isFullscreen = ref(false)
    const editorContainer = ref(null)
    const isPopoverHovered = ref(false)
    const editorCanvasRef = ref(null)
    
    const currentImage = computed(() => images.value[currentImageIndex.value])
    
    const loadScene = async () => {
        try {
            loading.value = true
            const response = await owl.scenes.get(props.sceneSlug)
            scene.value = response.data
            if (scene.value?.project) {
                project.value = scene.value.project
            }
            await Promise.all([
                loadImages(),
                loadAllScenes()
            ])
        } catch (error) {
            console.error('Failed to load scene:', error)
        } finally {
            loading.value = false
        }
    }
    
    const loadImages = async () => {
        try {
            const response = await owl.images.list(props.sceneSlug)
            images.value = [...(response.data || [])]
            console.log('Loaded images with hotspots:', images.value)
    
            await nextTick()
            if (editorCanvasRef.value) {
                editorCanvasRef.value.displayHotspots()
            }
        } catch (error) {
            console.error('Failed to load images:', error)
        }
    }
    
    const loadAllScenes = async () => {
        try {
            if (!project.value?.slug) return
    
            const response = await owl.scenes.list(project.value.slug)
            const scenes = response.data || []
    
            for (const scene of scenes) {
                const imagesResponse = await owl.images.list(scene.slug)
                scene.images = imagesResponse.data || []
            }
    
            allScenes.value = scenes
        } catch (error) {
            console.error('Failed to load all scenes:', error)
        }
    }
    
    const startCreatingHotspot = () => {
        isCreatingHotspot.value = true
    }
    
    const handleHotspotPositionSelected = (position) => {
        pendingHotspotPosition.value = position
        isCreatingHotspot.value = false
        editingHotspot.value = null
        targetDialogOpen.value = true
    }
    
    const handleTargetImageSelected = (targetImage) => {
        pendingTargetImage.value = targetImage
        targetDialogOpen.value = false
        
        setTimeout(() => {
            orientationDialogOpen.value = true
        }, 100)
    }
    
    const handleOrientationSaved = async (data) => {
        if (!pendingHotspotPosition.value || !currentImage.value || !pendingTargetImage.value) return
    
        const { rotation, createBidirectional, returnPosition } = data
    
        try {
            const hotspotData = {
                from_image_id: currentImage.value.id,
                to_image_id: pendingTargetImage.value.id,
                position_x: pendingHotspotPosition.value.x,
                position_y: pendingHotspotPosition.value.y,
                position_z: pendingHotspotPosition.value.z,
                target_rotation_x: rotation.x,
                target_rotation_y: rotation.y,
                target_rotation_z: rotation.z,
            }
    
            if (editingHotspot.value) {
                console.log('Updating hotspot:', editingHotspot.value.slug)
                await owl.hotspots.update(editingHotspot.value.slug, hotspotData)
                editingHotspot.value = null
            } else {
                console.log('Creating new hotspot')
                await owl.hotspots.create(props.sceneSlug, hotspotData)
    
                if (createBidirectional) {
                    console.log('Creating return hotspot')
                    
                    const returnRotation = calculateReturnRotation(
                        returnPosition,
                        pendingHotspotPosition.value
                    )
    
                    const returnHotspotData = {
                        from_image_id: pendingTargetImage.value.id,
                        to_image_id: currentImage.value.id,
                        position_x: returnPosition.x,
                        position_y: returnPosition.y,
                        position_z: returnPosition.z,
                        target_rotation_x: returnRotation.x,
                        target_rotation_y: returnRotation.y,
                        target_rotation_z: returnRotation.z,
                    }
    
                    await owl.hotspots.create(props.sceneSlug, returnHotspotData)
                }
            }
    
            orientationDialogOpen.value = false
            pendingHotspotPosition.value = null
            pendingTargetImage.value = null
            pendingRotation.value = null
    
            await loadImages()
            console.log('Images reloaded after hotspot creation/update')
        } catch (error) {
            console.error('Failed to save hotspot:', error)
        }
    }
    
    const calculateReturnRotation = (fromPosition, toPosition) => {
        // We want the camera to look AWAY from the return hotspot position when arriving back at image A
        // Since the return hotspot is placed opposite to where we're looking, we need to invert the direction

        // Azimuthal angle (horizontal rotation around Y axis)
        const azimuthal = Math.atan2(toPosition.x, toPosition.z)
        
        // Calculate radius
        const radius = Math.sqrt(
            toPosition.x * toPosition.x + 
            toPosition.y * toPosition.y + 
            toPosition.z * toPosition.z
        )
        
        // Polar angle (vertical rotation from Y axis)
        const polar = Math.acos(toPosition.y / radius)
        
        return {
            x: azimuthal + Math.PI,
            y: polar,
            z: 0
        }
    }
    
    const handleHotspotClick = async (hotspot) => {
        if (mode.value === 'edit') return
    
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
            await loadImages()
        }
    }
    
    const handleHotspotHover = ({ hotspot, position }) => {
        hoveredHotspot.value = hotspot
        hotspotHoverPosition.value = position
    }
    
    const handleHotspotHoverEnd = () => {
        if (!isPopoverHovered.value) {
            hoveredHotspot.value = null
            hotspotHoverPosition.value = null
        }
    }
    
    const handlePopoverMouseEnter = () => {
        isPopoverHovered.value = true
    }
    
    const handlePopoverMouseLeave = () => {
        isPopoverHovered.value = false
        hoveredHotspot.value = null
        hotspotHoverPosition.value = null
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
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce point d\'accès ?')) return
    
        try {
            console.log('Deleting hotspot:', hotspot.slug)
            await owl.hotspots.delete(hotspot.slug)
    
            hoveredHotspot.value = null
            hotspotHoverPosition.value = null
    
            await loadImages()
            console.log('Images reloaded after hotspot delete')
        } catch (error) {
            console.error('Failed to delete hotspot:', error)
        }
    }
    
    const toggleMode = () => {
        mode.value = mode.value === 'view' ? 'edit' : 'view'
        isCreatingHotspot.value = false
        hoveredHotspot.value = null
        hotspotHoverPosition.value = null
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
    
    onMounted(() => {
        loadScene()
        document.addEventListener('fullscreenchange', handleFullscreenChange)
    })
    
    onUnmounted(() => {
        document.removeEventListener('fullscreenchange', handleFullscreenChange)
    })
    </script>
    
    <template>
        <DashboardLayout :auth="auth" :project="project" :scene="scene">
            <div ref="editorContainer" :class="[
                'relative -m-6 w-[calc(100%+3rem)]',
                isFullscreen ? 'h-screen' : 'h-[calc(100vh-4rem)]'
            ]">
                <LoadingSpinner v-if="loading" class="absolute inset-0 bg-zinc-900" />
    
                <EmptyState v-else-if="images.length === 0" title="Aucune image dans cette scène"
                    class="absolute inset-0 bg-zinc-900 text-white">
                    <Link :href="`/dashboard/scenes/${sceneSlug}`">
                        <Button>Ajouter des images</Button>
                    </Link>
                </EmptyState>
    
                <div v-else class="relative w-full h-full">
                    <EditorCanvas ref="editorCanvasRef" :images="images" :current-index="currentImageIndex" :mode="mode"
                        :is-creating-hotspot="isCreatingHotspot" @hotspot-click="handleHotspotClick"
                        @hotspot-position-selected="handleHotspotPositionSelected" @hotspot-hover="handleHotspotHover"
                        @hotspot-hover-end="handleHotspotHoverEnd" />
    
                    <EditorTopBar :scene-name="scene?.name" :scene-slug="sceneSlug" :mode="mode"
                        :is-fullscreen="isFullscreen" @create-hotspot="startCreatingHotspot" @toggle-mode="toggleMode"
                        @toggle-fullscreen="toggleFullscreen" />
    
                    <ImageThumbnailsPanel :images="images" :current-index="currentImageIndex" @select="handleImageSelect" />
    
                    <HotspotsListPanel v-if="mode === 'edit'" :current-image="currentImage" @edit="handleEditHotspot"
                        @delete="handleDeleteHotspot" />
    
                    <HotspotPopover :hotspot="hoveredHotspot" :position="hotspotHoverPosition" :mode="mode"
                        :visible="!!hoveredHotspot" @edit="handleEditHotspot" @delete="handleDeleteHotspot"
                        @mouseenter="handlePopoverMouseEnter" @mouseleave="handlePopoverMouseLeave" />
    
                    <HotspotTargetDialog v-model:open="targetDialogOpen" :all-scenes="allScenes"
                        :current-image-id="currentImage?.id" @select="handleTargetImageSelected" />
    
                    <HotspotOrientationDialog 
                        v-model:open="orientationDialogOpen" 
                        :target-image="pendingTargetImage"
                        :initial-rotation="editingHotspot && editingHotspot.target_rotation_x !== null ?
                            { x: editingHotspot.target_rotation_x, y: editingHotspot.target_rotation_y, z: editingHotspot.target_rotation_z }
                            : null
                        "
                        @save="handleOrientationSaved"
                    />
                </div>
            </div>
        </DashboardLayout>
    </template>