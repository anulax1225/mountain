<script setup>
import { ref } from 'vue'
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Palette, ImageIcon, Circle } from 'lucide-vue-next'

const props = defineProps({
    open: Boolean
})

const emit = defineEmits(['update:open', 'save'])

const customizationType = ref('default') // 'default', 'color', 'image'
const selectedColor = ref('#ffffff')
const selectedImage = ref(null)

const predefinedColors = [
    '#ffffff', '#000000', '#ef4444', '#f97316', '#f59e0b', '#84cc16',
    '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e'
]

const predefinedImages = [
    'arrow.png',
    'door.png',
    'stairs.png',
    'elevator.png',
    'exit.png',
    'info.png'
]

const handleSave = () => {
    const customization = {
        color: customizationType.value === 'color' ? selectedColor.value : null,
        image: customizationType.value === 'image' ? selectedImage.value : null
    }
    emit('save', customization)
}

const handleCancel = () => {
    emit('update:open', false)
}
</script>

<template>
    <Dialog :open="open" @update:open="emit('update:open', $event)">
        <DialogContent class="sm:max-w-2xl">
            <DialogHeader>
                <DialogTitle>Personnaliser le point d'accès</DialogTitle>
                <DialogDescription>
                    Choisissez l'apparence du point d'accès dans la scène 360°
                </DialogDescription>
            </DialogHeader>

            <div class="space-y-6">
                <RadioGroup v-model="customizationType" class="space-y-4">
                    <!-- Default option -->
                    <div
                        class="flex items-center space-x-3 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors">
                        <RadioGroupItem value="default" id="default" />
                        <Label for="default" class="flex-1 cursor-pointer">
                            <div class="flex items-center gap-3">
                                <Circle class="w-5 h-5 text-zinc-500" />
                                <div>
                                    <div class="font-medium">Point blanc par défaut</div>
                                    <div class="text-sm text-zinc-500 dark:text-zinc-400">Point blanc simple avec
                                        bordure noire</div>
                                </div>
                            </div>
                        </Label>
                    </div>

                    <!-- Color option -->
                    <div
                        class="flex items-start space-x-3 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors">
                        <RadioGroupItem value="color" id="color" class="mt-1" />
                        <Label for="color" class="flex-1 cursor-pointer">
                            <div class="space-y-3">
                                <div class="flex items-center gap-3">
                                    <Palette class="w-5 h-5 text-zinc-500" />
                                    <div>
                                        <div class="font-medium">Couleur personnalisée</div>
                                        <div class="text-sm text-zinc-500 dark:text-zinc-400">Choisissez une couleur
                                            pour le point</div>
                                    </div>
                                </div>

                                <div v-if="customizationType === 'color'" class="grid grid-cols-6 gap-2 pt-2">
                                    <button v-for="color in predefinedColors" :key="color"
                                        @click="selectedColor = color" :class="[
                                            'w-10 h-10 rounded-lg border-2 transition-all',
                                            selectedColor === color
                                                ? 'border-zinc-900 dark:border-zinc-100 scale-110'
                                                : 'border-zinc-300 dark:border-zinc-600'
                                        ]" :style="{ backgroundColor: color }" />
                                </div>
                            </div>
                        </Label>
                    </div>

                    <!-- Image option -->
                    <div
                        class="flex items-start space-x-3 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors">
                        <RadioGroupItem value="image" id="image" class="mt-1" />
                        <Label for="image" class="flex-1 cursor-pointer">
                            <div class="space-y-3">
                                <div class="flex items-center gap-3">
                                    <ImageIcon class="w-5 h-5 text-zinc-500" />
                                    <div>
                                        <div class="font-medium">Icône prédéfinie</div>
                                        <div class="text-sm text-zinc-500 dark:text-zinc-400">Utilisez une icône de la
                                            bibliothèque</div>
                                    </div>
                                </div>

                                <div v-if="customizationType === 'image'" class="grid grid-cols-6 gap-3 pt-2">
                                    <button v-for="image in predefinedImages" :key="image"
                                        @click="selectedImage = image" :class="[
                                            'w-16 h-16 rounded-lg border-2 transition-all flex items-center justify-center bg-zinc-100 dark:bg-zinc-800',
                                            selectedImage === image
                                                ? 'border-zinc-900 dark:border-zinc-100 scale-105'
                                                : 'border-zinc-300 dark:border-zinc-600'
                                        ]">
                                        <img :src="`/hotspot-icons/${image}`" :alt="image"
                                            class="w-10 h-10 object-contain" />
                                    </button>
                                </div>
                            </div>
                        </Label>
                    </div>
                </RadioGroup>
            </div>

            <DialogFooter class="gap-2">
                <Button variant="outline" @click="handleCancel">
                    Annuler
                </Button>
                <Button @click="handleSave">
                    Enregistrer
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>