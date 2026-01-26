<script setup>
import { ref, watch, computed } from 'vue'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { useApiError } from '@/composables'
import { projects } from '@/owl-sdk'

const props = defineProps({
    open: Boolean,
    project: Object
})

const emit = defineEmits(['update:open', 'saved'])

const { handleError } = useApiError()

const isPublic = ref(props.project?.is_public || false);
const startImageId = ref(props.project?.start_image?.slug || null);
const images = ref([])
const loading = ref(false)
const saving = ref(false)

const groupedImages = computed(() => {
    if (!images.value) return [];
    return images.value.reduce((acc, image) => {
        const scene = image.scene || { slug: 'unknown', name: 'Inconnu' }
        let group = acc.find(g => g.scene.slug === scene.slug)
        if (!group) {
            group = { scene: scene, images: [] }
            acc.push(group)
        }
        group.images.push(image)
        return acc
    }, []).filter(group => group.images.length > 0)
})

const selectImage = (image) => {
    startImageId.value = image.slug;
}

const loadImages = async () => {
    if (!props.project?.slug) return

    try {
        loading.value = true
        const response = await projects.getImages(props.project.slug)
        images.value = response || []
    } catch (error) {
        handleError(error, { context: 'Loading images', showToast: true })
    } finally {
        loading.value = false
    }
}

const saveSettings = async () => {
    try {
        saving.value = true
        await projects.patch(props.project.slug, {
            is_public: isPublic.value,
            start_image_id: startImageId.value
        })
        emit('saved')
        emit('update:open', false)
    } catch (error) {
        handleError(error, { context: 'Saving settings', showToast: true })
    } finally {
        saving.value = false
    }
}

watch(() => props.open, (newValue) => {
    if (newValue) {
        // isPublic.value = props.project?.is_public || false
        // startImageId.value = props.project?.start_image_id || null
        loadImages()
    }
})

watch(() => isPublic.value, (newValue) => {
    if (!newValue) {
        startImageId.value = null
    }
})
</script>

<template>
    <Dialog :open="open" @update:open="emit('update:open', $event)">
        <DialogContent class="max-w-md">
            <DialogHeader>
                <DialogTitle>Paramètres du projet</DialogTitle>
                <DialogDescription>
                    Gérez la visibilité et l'image de départ de votre projet
                </DialogDescription>
            </DialogHeader>

            <div class="space-y-6 mt-4">
                <div class="flex items-center justify-between">
                    <div class="space-y-0.5">
                        <Label>Projet public</Label>
                        <p class="text-sm text-zinc-500 dark:text-zinc-400">
                            Rendre ce projet visible dans la galerie publique
                        </p>
                    </div>
                    <Switch v-model="isPublic" />
                </div>

                <div class="space-y-2">
                    <Label>Image de départ</Label>
                    <p class="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                        Sélectionnez l'image panoramique par laquelle les visiteurs commenceront
                    </p>
                    <ScrollArea class="pr-4 max-h-[60vh]">
                        <div class="space-y-6">
                            <div v-for="group in groupedImages" :key="group.scene.slug" class="space-y-3">
                                <div class="flex items-center gap-2">
                                    <h3 class="font-semibold text-zinc-900 dark:text-zinc-100">
                                        {{ group.scene.name || 'Sans nom' }}
                                    </h3>
                                    <Badge variant="secondary">
                                        {{ group.images.length }} image(s)
                                    </Badge>
                                </div>

                                <div class="gap-4 grid grid-cols-3">
                                    <button v-for="image in group.images" :key="image.id" @click="selectImage(image)"
                                        :disabled="image.id === currentImageId" :class="[
                                            'relative aspect-video rounded-lg overflow-hidden transition-all',
                                            image.id === currentImageId
                                                ? 'opacity-50 cursor-not-allowed'
                                                : 'hover:scale-105 hover:shadow-xl cursor-pointer'
                                        ]">
                                        <img :src="`/images/${image.slug}/download`" :alt="image.name || 'Image'"
                                            class="w-full h-full object-cover" />
                                        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
                                        </div>
                                        <div class="bottom-2 left-2 right-2 absolute">
                                            <p class="font-medium text-white text-xs truncate">
                                                {{ image.name || 'Sans nom' }}
                                            </p>
                                        </div>
                                        <div v-if="image.id === currentImageId"
                                            class="absolute inset-0 flex items-center justify-center bg-black/50">
                                            <Badge variant="secondary">Image actuelle</Badge>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            <div v-if="groupedImages.length === 0" class="py-12 text-center">
                                <p class="text-zinc-500 dark:text-zinc-400">Aucune image disponible</p>
                            </div>
                        </div>
                    </ScrollArea>
                    <!-- <select v-model="startImageId"
                        class="w-full px-3 py-2 border rounded-md bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700">
                        <option :value="null">-- Sélectionnez une image --</option>
                        <option v-for="image in images" :key="image.id" :value="image.slug">
                            <img :src="`/images/${image.slug}/download`" :alt="image.name">
                            {{ image.name || `Image ${image.slug.slice(0, 5)}...` }}
                        </option>
                    </select> -->

                    <p v-if="images.length === 0 && !loading" class="text-sm text-amber-600">
                        Aucune image disponible. Ajoutez des images panoramiques à vos scènes d'abord.
                    </p>
                </div>

                <div class="flex justify-end gap-2">
                    <Button variant="outline" @click="emit('update:open', false)" :disabled="saving">
                        Annuler
                    </Button>
                    <Button @click="saveSettings" :disabled="saving || (isPublic && !startImageId)">
                        {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
                    </Button>
                </div>
            </div>
        </DialogContent>
    </Dialog>
</template>
