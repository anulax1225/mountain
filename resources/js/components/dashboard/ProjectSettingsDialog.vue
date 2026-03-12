<script setup>
import { ref, watch, computed } from 'vue'
import { useForm } from '@inertiajs/vue3'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { useImagePath } from '@/composables/useImagePath'

const { getImagePreview } = useImagePath()

const props = defineProps({
    open: Boolean,
    project: Object,
    images: Array,
})

const emit = defineEmits(['update:open'])

const isPublic = ref(props.project?.is_public || false)
const startImageId = ref(props.project?.start_image?.slug || null)

const form = useForm({
    is_public: false,
    start_image_id: null,
})

const currentImageId = computed(() => props.project?.start_image?.id || null)

const groupedImages = computed(() => {
    if (!props.images) return []
    return props.images.reduce((acc, image) => {
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
    startImageId.value = image.slug
}

const saveSettings = () => {
    form.is_public = isPublic.value
    form.start_image_id = startImageId.value

    form.post(`/dashboard/projects/${props.project.slug}/make-public`, {
        onSuccess: () => {
            emit('update:open', false)
        },
    })
}

watch(() => props.open, (newValue) => {
    if (newValue) {
        isPublic.value = props.project?.is_public || false
        startImageId.value = props.project?.start_image?.slug || null
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
        <DialogContent class="max-w-xl">
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
                        <p class="text-sm text-muted-foreground">
                            Rendre ce projet visible dans la galerie publique
                        </p>
                    </div>
                    <Switch v-model="isPublic" />
                </div>

                <div class="space-y-2">
                    <Label>Image de départ</Label>
                    <p class="text-xs text-muted-foreground mb-2">
                        Sélectionnez l'image panoramique par laquelle les visiteurs commenceront
                    </p>
                    <ScrollArea class="max-h-[60vh]">
                        <div class="space-y-6 p-2">
                            <div v-for="group in groupedImages" :key="group.scene.slug" class="space-y-3">
                                <div class="flex items-center gap-2">
                                    <h3 class="font-semibold text-foreground">
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
                                                : image.slug === startImageId
                                                    ? 'ring-2 ring-primary ring-offset-2 scale-105 shadow-xl cursor-pointer'
                                                    : 'hover:scale-105 hover:shadow-xl cursor-pointer'
                                        ]">
                                        <img :src="getImagePreview(image)" :alt="image.name || 'Image'"
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
                                <p class="text-muted-foreground">Aucune image disponible</p>
                            </div>
                        </div>
                    </ScrollArea>

                    <p v-if="(!images || images.length === 0)" class="text-sm text-amber-600">
                        Aucune image disponible. Ajoutez des images panoramiques à vos scènes d'abord.
                    </p>
                </div>

                <div class="flex justify-end gap-2">
                    <Button variant="outline" @click="emit('update:open', false)" :disabled="form.processing">
                        Annuler
                    </Button>
                    <Button @click="saveSettings" :disabled="form.processing || (isPublic && !startImageId)">
                        {{ form.processing ? 'Enregistrement...' : 'Enregistrer' }}
                    </Button>
                </div>
            </div>
        </DialogContent>
    </Dialog>
</template>
