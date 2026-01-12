<script setup>
import { ref, onMounted } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-vue-next'
import { Link } from '@inertiajs/vue3'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import SceneCard from '@/components/dashboard/SceneCard.vue'
import CreateSceneCard from '@/components/dashboard/CreateSceneCard.vue'
import SceneFormSheet from '@/components/dashboard/SceneFormSheet.vue'
import owl from '@/owl-sdk.js'

const props = defineProps({
  auth: Object,
  projectSlug: String,
})

const project = ref(null)
const scenes = ref([])
const loading = ref(true)
const sceneSheetOpen = ref(false)
const editingScene = ref(null)
const sceneForm = ref({ name: '' })

const loadProject = async () => {
  try {
    loading.value = true
    const response = await owl.projects.get(props.projectSlug)
    project.value = response.data
    await loadScenes()
  } catch (error) {
    console.error('Failed to load project:', error)
  } finally {
    loading.value = false
  }
}

const loadScenes = async () => {
  try {
    const response = await owl.scenes.list(props.projectSlug)
    scenes.value = response.data || []
    
    for (const scene of scenes.value) {
      const imagesResponse = await owl.images.list(scene.slug)
      scene.images = imagesResponse.data || []
    }
  } catch (error) {
    console.error('Failed to load scenes:', error)
  }
}

const openCreateScene = () => {
  editingScene.value = null
  sceneForm.value = { name: '' }
  sceneSheetOpen.value = true
}

const openEditScene = (scene) => {
  editingScene.value = scene
  sceneForm.value = { name: scene.name || '' }
  sceneSheetOpen.value = true
}

const saveScene = async () => {
  try {
    if (editingScene.value) {
      await owl.scenes.update(editingScene.value.slug, sceneForm.value)
    } else {
      await owl.scenes.create(props.projectSlug, sceneForm.value)
    }
    sceneSheetOpen.value = false
    sceneForm.value = { name: '' }
    editingScene.value = null
    await loadScenes()
  } catch (error) {
    console.error('Failed to save scene:', error)
  }
}

const deleteScene = async (sceneSlug) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette scène et toutes ses images?')) return
  
  try {
    await owl.scenes.delete(sceneSlug)
    await loadScenes()
  } catch (error) {
    console.error('Failed to delete scene:', error)
  }
}

onMounted(() => {
  loadProject()
})
</script>

<template>
  <DashboardLayout :auth="auth" :project="project">
    <div class="mx-auto max-w-7xl">
      <div class="flex items-center gap-4 mb-8">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft class="w-5 h-5" />
          </Button>
        </Link>
        <div class="flex-1">
          <h1 class="font-bold text-zinc-900 dark:text-zinc-100 text-3xl">{{ project?.name || 'Loading...' }}</h1>
          <p class="mt-1 text-zinc-600 dark:text-zinc-400">{{ project?.description || 'No description' }}</p>
        </div>
      </div>

      <LoadingSpinner v-if="loading" />

      <div v-else>
        <div class="mb-6">
          <h2 class="mb-4 font-semibold text-zinc-900 dark:text-zinc-100 text-xl">Scènes</h2>
          
          <div class="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <SceneCard 
              v-for="scene in scenes" 
              :key="scene.slug" 
              :scene="scene"
              @edit="openEditScene"
              @delete="deleteScene"
            />

            <CreateSceneCard @create="openCreateScene" />
          </div>
        </div>
      </div>

      <SceneFormSheet 
        v-model:open="sceneSheetOpen"
        :editing-scene="editingScene"
        :form="sceneForm"
        @update:form="sceneForm = $event"
        @submit="saveScene"
      />
    </div>
  </DashboardLayout>
</template>