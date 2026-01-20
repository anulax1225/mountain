<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Copy, Download, Link, Code } from 'lucide-vue-next'
import { useToast } from '@/components/ui/toast'
import QRCode from 'qrcode'

const props = defineProps({
    open: Boolean,
    project: Object
})

const emit = defineEmits(['update:open'])

const { toast } = useToast()
const qrCanvas = ref(null)

const galleryUrl = computed(() => {
    if (!props.project?.slug) return ''
    return `${window.location.origin}/gallery/${props.project.slug}`
})

const iframeCode = computed(() => {
    if (!galleryUrl.value) return ''
    return `<iframe src="${galleryUrl.value}" width="100%" height="600" frameborder="0" style="border-radius: 8px;" allowfullscreen></iframe>`
})

const generateQRCode = async () => {
    if (qrCanvas.value && galleryUrl.value) {
        try {
            await QRCode.toCanvas(qrCanvas.value, galleryUrl.value, {
                width: 200,
                margin: 2,
                color: {
                    dark: '#18181b',
                    light: '#ffffff'
                }
            })
        } catch (error) {
            console.error('Failed to generate QR code:', error)
        }
    }
}

const copyToClipboard = async (text, label) => {
    try {
        await navigator.clipboard.writeText(text)
        toast({
            title: 'Copié !',
            description: `${label} copié dans le presse-papiers`
        })
    } catch (error) {
        toast({
            title: 'Erreur',
            description: 'Impossible de copier dans le presse-papiers',
            variant: 'destructive'
        })
    }
}

const downloadQRCode = () => {
    if (qrCanvas.value) {
        const link = document.createElement('a')
        link.download = `${props.project?.name || 'qrcode'}-qr.png`
        link.href = qrCanvas.value.toDataURL('image/png')
        link.click()
    }
}

watch(() => props.open, async (newValue) => {
    if (newValue) {
        await nextTick()
        generateQRCode()
    }
})
</script>

<template>
    <Dialog :open="open" @update:open="emit('update:open', $event)">
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Partager le projet</DialogTitle>
                <DialogDescription>
                    Partagez votre visite virtuelle avec un lien, un code d'intégration ou un QR code
                </DialogDescription>
            </DialogHeader>

            <div class="space-y-6 mt-4 w-fit max-w-md">
                <div class="space-y-2">
                    <Label class="flex items-center gap-2">
                        <Link class="w-4 h-4" />
                        Lien direct
                    </Label>
                    <div class="flex gap-2">
                        <div class="flex-1 px-3 py-2 text-sm bg-zinc-100 dark:bg-zinc-800 rounded-md border border-zinc-200 dark:border-zinc-700 truncate">
                            {{ galleryUrl }}
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            @click="copyToClipboard(galleryUrl, 'Le lien')"
                            title="Copier le lien"
                        >
                            <Copy class="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <div class="space-y-2">
                    <Label class="flex items-center gap-2">
                        <Code class="w-4 h-4" />
                        Code d'intégration (iframe)
                    </Label>
                    <div class="flex gap-2">
                        <div class="flex-1 px-3 py-2 text-sm bg-zinc-100 dark:bg-zinc-800 rounded-md border border-zinc-200 dark:border-zinc-700 font-mono text-xs overflow-x-auto whitespace-nowrap">
                            {{ iframeCode }}
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            @click="copyToClipboard(iframeCode, 'Le code iframe')"
                            title="Copier le code iframe"
                        >
                            <Copy class="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <div class="space-y-3">
                    <Label>QR Code</Label>
                    <div class="flex flex-col items-center gap-4">
                        <div class="p-4 bg-white rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700">
                            <canvas ref="qrCanvas"></canvas>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            @click="downloadQRCode"
                            class="gap-2"
                        >
                            <Download class="w-4 h-4" />
                            Télécharger
                        </Button>
                    </div>
                </div>

                <div class="flex justify-end pt-2">
                    <Button variant="outline" @click="emit('update:open', false)">
                        Fermer
                    </Button>
                </div>
            </div>
        </DialogContent>
    </Dialog>
</template>
