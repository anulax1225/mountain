<script setup>
import { shallowRef, reactive, watch, nextTick, onBeforeUnmount } from 'vue'
import QRCodeStyling from 'qr-code-styling'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { Download, RotateCcw } from 'lucide-vue-next'

const props = defineProps({
    url: {
        type: String,
        required: true
    },
    downloadName: {
        type: String,
        default: 'qrcode'
    }
})

const containerRef = shallowRef(null)
const qrInstance = shallowRef(null)

const DOT_STYLES = [
    { value: 'square', label: 'Carré' },
    { value: 'dots', label: 'Points' },
    { value: 'rounded', label: 'Arrondi' },
    { value: 'extra-rounded', label: 'Extra arrondi' },
    { value: 'classy', label: 'Classique' },
    { value: 'classy-rounded', label: 'Classique arrondi' }
]

const CORNER_SQUARE_STYLES = [
    { value: 'square', label: 'Carré' },
    { value: 'dot', label: 'Point' },
    { value: 'extra-rounded', label: 'Extra arrondi' }
]

const CORNER_DOT_STYLES = [
    { value: 'square', label: 'Carré' },
    { value: 'dot', label: 'Point' }
]

const DEFAULTS = {
    dotStyle: 'square',
    cornerSquareStyle: 'square',
    cornerDotStyle: 'square',
    dotColor: '#18181b',
    backgroundColor: '#ffffff',
    cornerSquareColor: '#18181b',
    cornerDotColor: '#18181b',
    showLogo: true
}

const options = reactive({ ...DEFAULTS })

function buildQrOptions() {
    return {
        width: 240,
        height: 240,
        data: props.url,
        margin: 8,
        qrOptions: {
            errorCorrectionLevel: 'H'
        },
        dotsOptions: {
            type: options.dotStyle,
            color: options.dotColor
        },
        backgroundOptions: {
            color: options.backgroundColor
        },
        cornersSquareOptions: {
            type: options.cornerSquareStyle,
            color: options.cornerSquareColor
        },
        cornersDotOptions: {
            type: options.cornerDotStyle,
            color: options.cornerDotColor
        },
        imageOptions: {
            crossOrigin: 'anonymous',
            margin: 6,
            imageSize: 0.4
        },
        ...(options.showLogo ? { image: '/owl-logo.png' } : {})
    }
}

function createQrCode() {
    if (!containerRef.value) return

    containerRef.value.innerHTML = ''
    qrInstance.value = new QRCodeStyling(buildQrOptions())
    qrInstance.value.append(containerRef.value)
}

function updateQrCode() {
    if (!qrInstance.value) return
    qrInstance.value.update(buildQrOptions())
}

function resetOptions() {
    Object.assign(options, DEFAULTS)
}

function downloadQrCode() {
    if (!qrInstance.value) return
    qrInstance.value.download({
        name: props.downloadName,
        extension: 'png'
    })
}

watch(() => props.url, async () => {
    await nextTick()
    createQrCode()
}, { immediate: true })

watch(options, () => {
    updateQrCode()
})

onBeforeUnmount(() => {
    if (containerRef.value) {
        containerRef.value.innerHTML = ''
    }
    qrInstance.value = null
})
</script>

<template>
    <div class="space-y-4">
        <div class="flex flex-col items-center">
            <div class="p-4 bg-white rounded-lg shadow-sm border border-border">
                <div ref="containerRef" />
            </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
                <Label class="text-xs">Style des points</Label>
                <Select v-model="options.dotStyle">
                    <SelectTrigger class="h-8 text-xs">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem
                            v-for="style in DOT_STYLES"
                            :key="style.value"
                            :value="style.value"
                        >
                            {{ style.label }}
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div class="space-y-1.5">
                <Label class="text-xs">Style des coins</Label>
                <Select v-model="options.cornerSquareStyle">
                    <SelectTrigger class="h-8 text-xs">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem
                            v-for="style in CORNER_SQUARE_STYLES"
                            :key="style.value"
                            :value="style.value"
                        >
                            {{ style.label }}
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div class="space-y-1.5">
                <Label class="text-xs">Points des coins</Label>
                <Select v-model="options.cornerDotStyle">
                    <SelectTrigger class="h-8 text-xs">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem
                            v-for="style in CORNER_DOT_STYLES"
                            :key="style.value"
                            :value="style.value"
                        >
                            {{ style.label }}
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div class="space-y-1.5">
                <Label class="text-xs">Couleur des points</Label>
                <div class="flex items-center gap-2">
                    <input
                        v-model="options.dotColor"
                        type="color"
                        class="h-8 w-8 cursor-pointer rounded border border-border bg-transparent p-0.5"
                    >
                    <span class="text-xs text-muted-foreground font-mono">{{ options.dotColor }}</span>
                </div>
            </div>

            <div class="space-y-1.5">
                <Label class="text-xs">Couleur de fond</Label>
                <div class="flex items-center gap-2">
                    <input
                        v-model="options.backgroundColor"
                        type="color"
                        class="h-8 w-8 cursor-pointer rounded border border-border bg-transparent p-0.5"
                    >
                    <span class="text-xs text-muted-foreground font-mono">{{ options.backgroundColor }}</span>
                </div>
            </div>

            <div class="space-y-1.5">
                <Label class="text-xs">Couleur des coins</Label>
                <div class="flex items-center gap-2">
                    <input
                        v-model="options.cornerSquareColor"
                        type="color"
                        class="h-8 w-8 cursor-pointer rounded border border-border bg-transparent p-0.5"
                    >
                    <span class="text-xs text-muted-foreground font-mono">{{ options.cornerSquareColor }}</span>
                </div>
            </div>
        </div>

        <div class="flex items-center justify-between">
            <Label class="text-xs">Afficher le logo</Label>
            <Switch v-model:checked="options.showLogo" />
        </div>

        <div class="flex items-center justify-center gap-2">
            <Button
                variant="outline"
                size="sm"
                class="gap-2"
                @click="resetOptions"
            >
                <RotateCcw class="w-3.5 h-3.5" />
                Réinitialiser
            </Button>
            <Button
                variant="outline"
                size="sm"
                class="gap-2"
                @click="downloadQrCode"
            >
                <Download class="w-3.5 h-3.5" />
                Télécharger
            </Button>
        </div>
    </div>
</template>