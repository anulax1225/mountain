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
            <!-- Edit mode - Show only buttons prominently -->
            <div v-if="mode === 'edit'" class="flex flex-col">
                <button @click="emit('edit', hotspot)"
                    class="flex items-center gap-3 px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors text-left">
                    <Pencil class="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                    <span class="text-sm font-medium text-zinc-900 dark:text-zinc-100">Modifier le point d'accès</span>
                </button>
                <button @click="emit('delete', hotspot)"
                    class="flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left border-t border-zinc-200 dark:border-zinc-700">
                    <Trash2 class="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span class="text-sm font-medium text-red-600 dark:text-red-400">Supprimer</span>
                </button>
            </div>

            <!-- View mode - Show thumbnail with subtle edit button -->
            <div v-else class="flex flex-col gap-2 p-2 w-64">
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