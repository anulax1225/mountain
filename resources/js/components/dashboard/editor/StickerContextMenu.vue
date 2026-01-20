<script setup>
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { Edit, Trash2 } from 'lucide-vue-next'

const props = defineProps({
    sticker: {
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
        <div class="bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
            <button
                @click="emit('edit', sticker)"
                class="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors text-left"
            >
                <Edit class="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                <span class="text-sm font-medium text-zinc-900 dark:text-zinc-100">Modifier</span>
            </button>
            <button
                @click="emit('delete', sticker)"
                class="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left border-t border-zinc-200 dark:border-zinc-700"
            >
                <Trash2 class="w-4 h-4 text-red-600 dark:text-red-400" />
                <span class="text-sm font-medium text-red-600 dark:text-red-400">Supprimer</span>
            </button>
        </div>
    </div>
</template>
