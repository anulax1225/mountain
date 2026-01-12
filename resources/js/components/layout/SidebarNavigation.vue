<script setup>
import { computed } from 'vue'
import { Link } from '@inertiajs/vue3'
import { FolderOpen, ChevronLeft, LayoutGrid } from 'lucide-vue-next'

const props = defineProps({
  isOpen: Boolean,
  project: Object
})

const baseNavigation = [
  { name: 'Projets', icon: FolderOpen, href: '/dashboard' },
]

const navigation = computed(() => {
  if (props.project) {
    return [
      { name: 'Retour', icon: ChevronLeft, href: '/dashboard' },
      { name: 'Scenes', icon: LayoutGrid, href: '/dashboard/projects/' + props.project?.slug },
    ]
  }
  return baseNavigation
})
</script>

<template>
  <nav class="flex-1 py-4 overflow-y-auto">
    <ul class="space-y-1 px-2">
      <li v-for="item in navigation" :key="item.name">
        <Link
          :href="item.href"
          :class="[
            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            'hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100',
            'text-zinc-700 dark:text-zinc-300'
          ]"
        >
          <component :is="item.icon" class="flex-shrink-0 w-5 h-5" />
          <span v-if="isOpen">{{ item.name }}</span>
        </Link>
      </li>
    </ul>
    <slot/>
  </nav>
</template>