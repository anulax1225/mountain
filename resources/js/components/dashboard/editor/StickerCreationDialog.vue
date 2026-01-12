<script setup>
    import { ref, computed } from 'vue'
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
    import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
    import { Smile, ImageIcon, Type } from 'lucide-vue-next'
    
    const props = defineProps({
        open: Boolean,
        position: Object // { x, y, z }
    })
    
    const emit = defineEmits(['update:open', 'save'])
    
    const stickerType = ref('emoji') // 'emoji', 'text'
    const emojiContent = ref('😊')
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
    
    const isValid = computed(() => {
        if (stickerType.value === 'emoji') {
            return emojiContent.value.length > 0
        }
        if (stickerType.value === 'text') {
            return textContent.value.trim().length > 0
        }
        return false
    })
    
    const handleSave = () => {
        if (!isValid.value || !props.position) return
    
        const stickerData = {
            type: stickerType.value,
            content: stickerType.value === 'emoji' ? emojiContent.value : textContent.value,
            position_x: props.position.x,
            position_y: props.position.y,
            position_z: props.position.z,
            scale: scale.value,
        }
    
        if (stickerType.value === 'text') {
            stickerData.font_family = fontFamily.value
            stickerData.font_size = fontSize.value
            stickerData.color = textColor.value
            stickerData.background_color = backgroundColor.value !== 'transparent' ? backgroundColor.value : null
        }
    
        emit('save', stickerData)
        resetForm()
    }
    
    const handleCancel = () => {
        emit('update:open', false)
        resetForm()
    }
    
    const resetForm = () => {
        stickerType.value = 'emoji'
        emojiContent.value = '😊'
        textContent.value = ''
        fontSize.value = 48
        fontFamily.value = 'Arial'
        textColor.value = '#ffffff'
        backgroundColor.value = 'transparent'
        scale.value = 1.0
    }
    </script>
    
    <template>
        <Dialog :open="open" @update:open="emit('update:open', $event)">
            <DialogContent class="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Ajouter un sticker</DialogTitle>
                    <DialogDescription>
                        Ajoutez un emoji ou du texte à votre scène 360°
                    </DialogDescription>
                </DialogHeader>
    
                <div class="space-y-6">
                    <RadioGroup v-model="stickerType" class="space-y-3">
                        <div class="flex items-center space-x-3 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors">
                            <RadioGroupItem value="emoji" id="emoji" />
                            <Label for="emoji" class="flex-1 cursor-pointer flex items-center gap-3">
                                <Smile class="w-5 h-5 text-zinc-500" />
                                <div>
                                    <div class="font-medium">Emoji</div>
                                    <div class="text-sm text-zinc-500 dark:text-zinc-400">Ajouter un emoji</div>
                                </div>
                            </Label>
                        </div>
    
                        <div class="flex items-center space-x-3 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors">
                            <RadioGroupItem value="text" id="text" />
                            <Label for="text" class="flex-1 cursor-pointer flex items-center gap-3">
                                <Type class="w-5 h-5 text-zinc-500" />
                                <div>
                                    <div class="font-medium">Texte</div>
                                    <div class="text-sm text-zinc-500 dark:text-zinc-400">Ajouter du texte personnalisé</div>
                                </div>
                            </Label>
                        </div>
                    </RadioGroup>
    
                    <!-- Emoji selector -->
                    <div v-if="stickerType === 'emoji'" class="space-y-4">
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
    
                    <!-- Text input -->
                    <div v-if="stickerType === 'text'" class="space-y-4">
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
                </div>
    
                <DialogFooter class="gap-2">
                    <Button variant="outline" @click="handleCancel">
                        Annuler
                    </Button>
                    <Button @click="handleSave" :disabled="!isValid">
                        Ajouter
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </template>