<script setup>
import { ref, watch } from 'vue'
import { Link } from '@inertiajs/vue3'
import { Image } from 'lucide-vue-next'
import { Separator } from '@/components/ui/separator'
import owl from '@/owl-sdk.js'

const props = defineProps({
  isOpen: Boolean,
  project: Object,
  scene: Object
})

const projectScenes = ref([])
const loading = ref(false)

const loadScenes = async () => {
  if (!props.project?.slug) {
    projectScenes.value = []
    return
  }
  
  try {
    loading.value = true
    const response = await owl.scenes.list(props.project.slug)
    projectScenes.value = response.data || []
  } catch (error) {
    console.error('Failed to load scenes:', error)
    projectScenes.value = []
  } finally {
    loading.value = false
  }
}

watch(() => props.project, (newProject) => {
  if (newProject?.slug) {
    loadScenes()
  } else {
    projectScenes.value = []
  }
}, { immediate: true })
</script>

<template>
  <div v-if="isOpen" class="mt-4">
    <Separator class="my-4" />
    <div class="mb-3 px-4">
      <h3 class="font-semibold text-zinc-900 dark:text-zinc-100 text-xs uppercase tracking-wider">
        {{ project.name }}
      </h3>
    </div>
    
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-4">
      <div class="border-2 border-zinc-300 dark:border-zinc-700 border-t-zinc-900 dark:border-t-zinc-100 rounded-full w-5 h-5 animate-spin"></div>
    </div>

    <!-- Scenes List -->
    <ul v-else class="space-y-1 px-2">
      <li v-for="sceneItem in projectScenes" :key="sceneItem.slug">
        <Link
          :href="`/dashboard/scenes/${sceneItem.slug}`"
          :class="[
            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
            scene?.slug === sceneItem.slug 
              ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium' 
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100'
          ]"
        >
          <Image class="flex-shrink-0 w-4 h-4" />
          <span class="truncate">{{ sceneItem.name || 'Sans nom' }}</span>
        </Link>
      </li>
      
      <!-- Empty State -->
      <li v-if="projectScenes.length === 0" class="px-3 py-2">
        <p class="text-zinc-500 dark:text-zinc-600 text-xs">Aucune scène</p>
      </li>
    </ul>
  </div>

  <!-- Compact Project Indicator -->
  <div v-else-if="project" class="flex justify-center items-center mt-4">
    <div class="bg-purple-100 dark:bg-purple-900/50 rounded-full w-2 h-2"></div>
  </div>
</template>