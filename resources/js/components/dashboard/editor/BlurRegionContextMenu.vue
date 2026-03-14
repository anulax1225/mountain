<script setup>
import { Edit, Trash2 } from 'lucide-vue-next'

const props = defineProps({
    blurRegion: {
        type: Object,
        default: null
    },
    position: {
        type: Object,
        default: null
    },
    visible: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['edit', 'delete'])
</script>

<template>
    <div
        v-if="visible && position"
        :style="{
            position: 'fixed',
            left: `${position.x}px`,
            top: `${position.y}px`,
            transform: 'translate(-50%, -100%)',
            zIndex: 50
        }"
        class="pointer-events-auto"
    >
        <div class="bg-card rounded-lg shadow-lg border border-border overflow-hidden">
            <button
                @click="emit('edit', blurRegion)"
                class="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left"
            >
                <Edit class="w-4 h-4 text-muted-foreground" />
                <span class="text-sm font-medium text-foreground">Modifier</span>
            </button>
            <button
                @click="emit('delete', blurRegion)"
                class="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left border-t border-border"
            >
                <Trash2 class="w-4 h-4 text-red-600 dark:text-red-400" />
                <span class="text-sm font-medium text-red-600 dark:text-red-400">Supprimer</span>
            </button>
        </div>
    </div>
</template>
