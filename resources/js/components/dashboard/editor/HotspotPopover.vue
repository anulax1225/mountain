<script setup>
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-vue-next'

const props = defineProps({
    hotspot: Object,
    position: Object,
    mode: String,
    visible: Boolean
})

const emit = defineEmits(['edit', 'delete', 'mouseenter', 'mouseleave'])

const style = computed(() => {
    if (!props.position) return {}
    return {
        left: `${props.position.x}px`,
        top: `${props.position.y}px`,
        transform: 'translate(-50%, -120%)'
    }
})
</script>

<template>
    <Transition name="fade">
        <div v-if="visible && hotspot"
            class="absolute z-50 bg-white dark:bg-zinc-800 shadow-xl border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden"
            :style="style" @mouseenter="emit('mouseenter')" @mouseleave="emit('mouseleave')">
            <div class="flex flex-col gap-2 p-2 w-64">
                <div v-if="hotspot.to_image" class="relative rounded overflow-hidden aspect-video">
                    <img :src="`/images/${hotspot.to_image.slug}/download`" :alt="hotspot.to_image.name"
                        class="w-full h-full object-cover" />
                </div>
                <div v-else class="flex justify-center items-center bg-zinc-100 dark:bg-zinc-900 rounded aspect-video">
                    <p class="text-zinc-400 text-sm">Aucune image</p>
                </div>

                <div v-if="hotspot.to_image" class="px-1">
                    <p class="font-medium text-sm text-zinc-900 dark:text-zinc-100 truncate">
                        {{ hotspot.to_image.name || 'Sans nom' }}
                    </p>
                </div>

                <div v-if="mode === 'edit'" class="flex gap-2">
                    <Button variant="outline" size="sm" class="flex-1" @click="emit('edit', hotspot)">
                        <Pencil class="mr-1 w-3 h-3" />
                        Modifier
                    </Button>
                    <Button variant="outline" size="sm" class="flex-1" @click="emit('delete', hotspot)">
                        <Trash2 class="mr-1 w-3 h-3" />
                        Supprimer
                    </Button>
                </div>
            </div>
        </div>
    </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>