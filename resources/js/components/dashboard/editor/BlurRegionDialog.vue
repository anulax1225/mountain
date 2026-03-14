<script setup>
import { ref, watch } from 'vue'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { BLUR } from '@/lib/editorConstants.js'

const props = defineProps({
    open: Boolean,
    position: Object,
    blurRegion: {
        type: Object,
        default: null,
    },
})

const emit = defineEmits(['update:open', 'save'])

const blurType = ref('gaussian')
const radius = ref(BLUR.DEFAULT_RADIUS)
const intensity = ref(BLUR.DEFAULT_INTENSITY)

watch(() => props.open, (isOpen) => {
    if (isOpen && props.blurRegion) {
        blurType.value = props.blurRegion.type || 'gaussian'
        radius.value = props.blurRegion.radius || BLUR.DEFAULT_RADIUS
        intensity.value = props.blurRegion.intensity || BLUR.DEFAULT_INTENSITY
    } else if (isOpen) {
        resetForm()
    }
})

const handleSave = () => {
    const position = props.blurRegion || props.position
    if (!position) return

    const data = {
        position_x: position.position_x ?? position.x,
        position_y: position.position_y ?? position.y,
        position_z: position.position_z ?? position.z,
        radius: radius.value,
        intensity: intensity.value,
        type: blurType.value,
    }

    emit('save', data)
    resetForm()
}

const handleCancel = () => {
    emit('update:open', false)
    resetForm()
}

const resetForm = () => {
    blurType.value = 'gaussian'
    radius.value = BLUR.DEFAULT_RADIUS
    intensity.value = BLUR.DEFAULT_INTENSITY
}
</script>

<template>
    <Dialog :open="open" @update:open="emit('update:open', $event)">
        <DialogContent class="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>{{ blurRegion ? 'Modifier' : 'Ajouter' }} une zone de flou</DialogTitle>
                <DialogDescription>
                    Configurez la zone de flou pour masquer des éléments
                </DialogDescription>
            </DialogHeader>

            <div class="space-y-6">
                <RadioGroup v-model="blurType" class="space-y-3">
                    <div class="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted cursor-pointer transition-colors">
                        <RadioGroupItem value="gaussian" id="gaussian" />
                        <Label for="gaussian" class="flex-1 cursor-pointer">
                            <div class="font-medium">Flou gaussien</div>
                            <div class="text-sm text-muted-foreground">Flou progressif et naturel</div>
                        </Label>
                    </div>

                    <div class="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted cursor-pointer transition-colors">
                        <RadioGroupItem value="pixelate" id="pixelate" />
                        <Label for="pixelate" class="flex-1 cursor-pointer">
                            <div class="font-medium">Pixelisation</div>
                            <div class="text-sm text-muted-foreground">Effet mosaïque / censure</div>
                        </Label>
                    </div>
                </RadioGroup>

                <div>
                    <Label for="radius">Taille de la zone ({{ Math.round(radius * 1000) / 10 }}°)</Label>
                    <Input
                        id="radius"
                        v-model.number="radius"
                        type="range"
                        :min="BLUR.MIN_RADIUS"
                        :max="BLUR.MAX_RADIUS"
                        step="0.005"
                        class="mt-2"
                    />
                </div>

                <div>
                    <Label for="intensity">Intensité ({{ intensity }}px)</Label>
                    <Input
                        id="intensity"
                        v-model.number="intensity"
                        type="range"
                        :min="BLUR.MIN_INTENSITY"
                        :max="BLUR.MAX_INTENSITY"
                        step="1"
                        class="mt-2"
                    />
                </div>
            </div>

            <DialogFooter class="gap-2">
                <Button variant="outline" @click="handleCancel">
                    Annuler
                </Button>
                <Button @click="handleSave">
                    {{ blurRegion ? 'Enregistrer' : 'Ajouter' }}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>
