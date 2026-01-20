<script setup>
import { ref, computed, watch } from 'vue'
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
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Smile, Type } from 'lucide-vue-next'

const props = defineProps({
    open: Boolean,
    sticker: Object // Existing sticker object
})

const emit = defineEmits(['update:open', 'save'])

// Form fields
const emojiContent = ref('')
const textContent = ref('')
const fontSize = ref(48)
const fontFamily = ref('Arial')
const textColor = ref('#ffffff')
const backgroundColor = ref('transparent')
const scale = ref(1.0)

const popularEmojis = [
    '😊', '😍', '🎉', '👍', '❤️', '⭐', '🔥', '💡',
    '✅', '❌', '⚠️', '📍', '🏠', '🚪', '🎨', '📷',
    '🌟', '💯', '🎯', '🔔', '📢', '🎁', '🌈', '☀️'
]

const fontFamilies = [
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Courier New',
    'Verdana',
    'Georgia',
    'Comic Sans MS',
    'Impact'
]

// Pre-populate form when sticker changes
watch(() => props.sticker, (sticker) => {
    if (sticker) {
        if (sticker.type === 'emoji') {
            emojiContent.value = sticker.content
        } else if (sticker.type === 'text') {
            textContent.value = sticker.content
            fontSize.value = sticker.font_size || 48
            fontFamily.value = sticker.font_family || 'Arial'
            textColor.value = sticker.color || '#ffffff'
            backgroundColor.value = sticker.background_color || 'transparent'
        }
        scale.value = sticker.scale || 1.0
    }
}, { immediate: true })

const isValid = computed(() => {
    if (!props.sticker) return false

    if (props.sticker.type === 'emoji') {
        return emojiContent.value.length > 0
    }
    if (props.sticker.type === 'text') {
        return textContent.value.trim().length > 0
    }
    return false
})

const handleSave = () => {
    if (!isValid.value || !props.sticker) return

    const updatedData = {
        type: props.sticker.type,
        content: props.sticker.type === 'emoji' ? emojiContent.value : textContent.value,
        scale: scale.value,
    }

    if (props.sticker.type === 'text') {
        updatedData.font_family = fontFamily.value
        updatedData.font_size = fontSize.value
        updatedData.color = textColor.value
        updatedData.background_color = backgroundColor.value !== 'transparent' ? backgroundColor.value : null
    }

    emit('save', updatedData)
    emit('update:open', false)
}

const handleCancel = () => {
    emit('update:open', false)
}
</script>

<template>
    <Dialog :open="open" @update:open="emit('update:open', $event)">
        <DialogContent class="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>Modifier le sticker</DialogTitle>
                <DialogDescription>
                    Modifiez les propriétés de votre sticker
                </DialogDescription>
            </DialogHeader>

            <div v-if="sticker" class="space-y-6">
                <!-- Sticker type display (read-only) -->
                <div>
                    <Label>Type de sticker</Label>
                    <div class="mt-2 flex items-center gap-3 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
                        <Smile v-if="sticker.type === 'emoji'" class="w-5 h-5 text-zinc-500" />
                        <Type v-if="sticker.type === 'text'" class="w-5 h-5 text-zinc-500" />
                        <div>
                            <div class="font-medium">{{ sticker.type === 'emoji' ? 'Emoji' : 'Texte' }}</div>
                            <div class="text-sm text-zinc-500 dark:text-zinc-400">
                                Le type ne peut pas être modifié
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Emoji editor -->
                <div v-if="sticker.type === 'emoji'" class="space-y-4">
                    <div>
                        <Label>Emoji sélectionné</Label>
                        <div class="mt-2 flex items-center justify-center w-full h-24 bg-zinc-100 dark:bg-zinc-900 rounded-lg text-6xl">
                            {{ emojiContent }}
                        </div>
                    </div>

                    <div>
                        <Label>Choisir un emoji</Label>
                        <div class="mt-2 grid grid-cols-8 gap-2">
                            <button
                                v-for="emoji in popularEmojis"
                                :key="emoji"
                                @click="emojiContent = emoji"
                                :class="[
                                    'w-12 h-12 rounded-lg border-2 text-2xl transition-all flex items-center justify-center',
                                    emojiContent === emoji
                                        ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-100 dark:bg-zinc-800 scale-110'
                                        : 'border-zinc-300 dark:border-zinc-600 hover:border-zinc-400'
                                ]"
                            >
                                {{ emoji }}
                            </button>
                        </div>
                    </div>

                    <div>
                        <Label for="custom-emoji">Ou entrez un emoji personnalisé</Label>
                        <Input
                            id="custom-emoji"
                            v-model="emojiContent"
                            placeholder="😊"
                            class="mt-2 text-2xl text-center"
                            maxlength="4"
                        />
                    </div>
                </div>

                <!-- Text editor -->
                <div v-if="sticker.type === 'text'" class="space-y-4">
                    <div>
                        <Label for="text-content">Texte</Label>
                        <Textarea
                            id="text-content"
                            v-model="textContent"
                            placeholder="Entrez votre texte..."
                            class="mt-2"
                            rows="3"
                            maxlength="200"
                        />
                        <div class="mt-1 text-xs text-zinc-500">{{ textContent.length }}/200 caractères</div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <Label for="font-family">Police</Label>
                            <Select v-model="fontFamily" id="font-family">
                                <SelectTrigger class="mt-2">
                                    <SelectValue placeholder="Choisir une police" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem v-for="font in fontFamilies" :key="font" :value="font">
                                        {{ font }}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label for="font-size">Taille</Label>
                            <Input
                                id="font-size"
                                v-model.number="fontSize"
                                type="number"
                                min="8"
                                max="200"
                                class="mt-2"
                            />
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <Label for="text-color">Couleur du texte</Label>
                            <div class="mt-2 flex gap-2">
                                <Input
                                    id="text-color"
                                    v-model="textColor"
                                    type="color"
                                    class="w-16 h-10 p-1"
                                />
                                <Input
                                    v-model="textColor"
                                    type="text"
                                    placeholder="#ffffff"
                                    class="flex-1"
                                />
                            </div>
                        </div>

                        <div>
                            <Label for="bg-color">Couleur de fond</Label>
                            <div class="mt-2 flex gap-2">
                                <Input
                                    id="bg-color"
                                    v-model="backgroundColor"
                                    type="color"
                                    class="w-16 h-10 p-1"
                                    :disabled="backgroundColor === 'transparent'"
                                />
                                <Select v-model="backgroundColor">
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="transparent">Transparent</SelectItem>
                                        <SelectItem value="#000000">Noir</SelectItem>
                                        <SelectItem value="#ffffff">Blanc</SelectItem>
                                        <SelectItem value="#ef4444">Rouge</SelectItem>
                                        <SelectItem value="#3b82f6">Bleu</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Common settings -->
                <div>
                    <Label for="scale">Taille ({{ scale }}x)</Label>
                    <Input
                        id="scale"
                        v-model.number="scale"
                        type="range"
                        min="0.5"
                        max="3"
                        step="0.1"
                        class="mt-2"
                    />
                </div>

                <!-- Position display (read-only) -->
                <div>
                    <Label>Position</Label>
                    <div class="mt-2 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
                        <div class="text-sm text-zinc-500 dark:text-zinc-400">
                            X: {{ sticker.position_x?.toFixed(3) }},
                            Y: {{ sticker.position_y?.toFixed(3) }},
                            Z: {{ sticker.position_z?.toFixed(3) }}
                        </div>
                        <div class="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                            Glissez-déposez le sticker pour changer sa position
                        </div>
                    </div>
                </div>
            </div>

            <DialogFooter class="gap-2">
                <Button variant="outline" @click="handleCancel">
                    Annuler
                </Button>
                <Button @click="handleSave" :disabled="!isValid">
                    Enregistrer
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>
