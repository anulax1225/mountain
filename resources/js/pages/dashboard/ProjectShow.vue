<script setup>
import { ref, onMounted, computed } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Settings, Users, Edit, Share2, Globe, BarChart3 } from 'lucide-vue-next'
import { Link } from '@inertiajs/vue3'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import SceneCard from '@/components/dashboard/SceneCard.vue'
import CreateSceneCard from '@/components/dashboard/CreateSceneCard.vue'
import SceneFormSheet from '@/components/dashboard/SceneFormSheet.vue'
import ProjectSettingsDialog from '@/components/dashboard/ProjectSettingsDialog.vue'
import ProjectUsersDialog from '@/components/dashboard/ProjectUsersDialog.vue'
import ProjectEditDialog from '@/components/dashboard/ProjectEditDialog.vue'
import ProjectShareDialog from '@/components/dashboard/ProjectShareDialog.vue'
import owl from '@/owl-sdk.js'

const props = defineProps({
  auth: Object,
  projectSlug: String,
})

const project = ref(null)
const scenes = ref([])
const loading = ref(true)
const sceneSheetOpen = ref(false)
const settingsDialogOpen = ref(false)
const usersDialogOpen = ref(false)
const editDialogOpen = ref(false)
const shareDialogOpen = ref(false)
const editingScene = ref(null)
const sceneForm = ref({ name: '' })

// Permission helpers
const canEdit = computed(() => project.value?.permissions?.can_edit ?? false)
const canDelete = computed(() => project.value?.permissions?.can_delete ?? false)
const canManageUsers = computed(() => project.value?.permissions?.can_manage_users ?? false)
const canManageSettings = computed(() => project.value?.permissions?.can_manage_settings ?? false)
const isOwner = computed(() => project.value?.permissions?.is_owner ?? false)

const loadProject = async () => {
  try {
    loading.value = true
    const response = await owl.projects.get(props.projectSlug)
    project.value = response
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

const handleSettingsSaved = () => {
  loadProject()
}

const handleEditSaved = () => {
  loadProject()
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
        <div class="flex gap-2">
          <Button
            v-if="canEdit"
            variant="outline"
            size="sm"
            @click="editDialogOpen = true"
            class="gap-2"
          >
            <Edit class="w-4 h-4" />
            Modifier
          </Button>
          <Button
            v-if="canManageUsers"
            variant="outline"
            size="sm"
            @click="usersDialogOpen = true"
            class="gap-2"
          >
            <Users class="w-4 h-4" />
            Utilisateurs
          </Button>
          <Button
            v-if="canManageSettings"
            variant="outline"
            size="sm"
            @click="settingsDialogOpen = true"
            class="gap-2"
          >
            <Settings class="w-4 h-4" />
            Paramètres
          </Button>
          <Button
            v-if="project?.is_public"
            variant="outline"
            size="sm"
            @click="shareDialogOpen = true"
            class="gap-2"
          >
            <Share2 class="w-4 h-4" />
            Partager
          </Button>
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
              :can-edit="canEdit"
              @edit="openEditScene"
              @delete="deleteScene"
            />

            <CreateSceneCard v-if="canEdit" @create="openCreateScene" />
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

      <ProjectSettingsDialog
        v-model:open="settingsDialogOpen"
        :project="project"
        @saved="handleSettingsSaved"
      />

      <ProjectUsersDialog
        v-model:open="usersDialogOpen"
        :project="project"
      />

      <ProjectEditDialog
        v-model:open="editDialogOpen"
        :project="project"
        @saved="handleEditSaved"
      />

      <ProjectShareDialog
        v-model:open="shareDialogOpen"
        :project="project"
      />
    </div>
  </DashboardLayout>
</template>
