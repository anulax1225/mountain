<script setup>
import { ref, computed, watch } from 'vue'
import { useForm, router } from '@inertiajs/vue3'
import draggable from 'vuedraggable'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Settings, Users, Edit, Share2, Globe, BarChart3 } from 'lucide-vue-next'
import { Link } from '@inertiajs/vue3'
import SceneCard from '@/components/dashboard/SceneCard.vue'
import CreateSceneCard from '@/components/dashboard/CreateSceneCard.vue'
import SceneFormSheet from '@/components/dashboard/SceneFormSheet.vue'
import ProjectSettingsDialog from '@/components/dashboard/ProjectSettingsDialog.vue'
import ProjectUsersDialog from '@/components/dashboard/ProjectUsersDialog.vue'
import ProjectEditDialog from '@/components/dashboard/ProjectEditDialog.vue'
import ProjectShareDialog from '@/components/dashboard/ProjectShareDialog.vue'
import { useConfirm } from '@/composables'
import owl from '@/owl-sdk.js'

const props = defineProps({
  auth: Object,
  project: Object,
  scenes: Object,
  projectImages: Array,
  assignedUsers: Array,
  availableUsers: Array,
  availableRoles: Array,
})

const { confirmDelete } = useConfirm()

const localScenes = ref([...(props.scenes || [])])

watch(() => props.scenes, (newScenes) => {
  if (newScenes) {
    localScenes.value = [...newScenes]
  }
})

const sceneSheetOpen = ref(false)
const settingsDialogOpen = ref(false)
const usersDialogOpen = ref(false)
const editDialogOpen = ref(false)
const shareDialogOpen = ref(false)
const editingScene = ref(null)

const sceneForm = useForm({ name: '' })

// Permission helpers
const canEdit = computed(() => props.project?.permissions?.can_edit ?? false)
const canDelete = computed(() => props.project?.permissions?.can_delete ?? false)
const canManageUsers = computed(() => props.project?.permissions?.can_manage_users ?? false)
const canManageSettings = computed(() => props.project?.permissions?.can_manage_settings ?? false)
const isOwner = computed(() => props.project?.permissions?.is_owner ?? false)

const openCreateScene = () => {
  editingScene.value = null
  sceneForm.name = ''
  sceneSheetOpen.value = true
}

const openEditScene = (scene) => {
  editingScene.value = scene
  sceneForm.name = scene.name || ''
  sceneSheetOpen.value = true
}

const saveScene = () => {
  if (editingScene.value) {
    sceneForm.post(`/dashboard/scenes/${editingScene.value.slug}/edit`, {
      onSuccess: () => {
        sceneSheetOpen.value = false
        editingScene.value = null
        sceneForm.reset()
      },
    })
  } else {
    sceneForm.post(`/dashboard/projects/${props.project.slug}/scenes`, {
      onSuccess: () => {
        sceneSheetOpen.value = false
        sceneForm.reset()
      },
    })
  }
}

const deleteScene = async (sceneSlug) => {
  const confirmed = await confirmDelete('cette scène et toutes ses images')
  if (!confirmed) return

  router.delete(`/dashboard/scenes/${sceneSlug}`)
}

const onDragEnd = async () => {
  const slugs = localScenes.value.map(s => s.slug)
  try {
    await owl.scenes.reorder(props.project.slug, slugs)
  } catch (error) {
    console.error('Failed to reorder scenes:', error)
    router.reload()
  }
}
</script>

<template>
  <DashboardLayout :auth="auth" :project="project">
    <div class="mx-auto max-w-7xl">
      <div class="mb-6 md:mb-8 space-y-4">
        <div class="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft class="w-5 h-5" />
            </Button>
          </Link>
          <div class="flex-1 min-w-0">
            <h1 class="text-foreground text-2xl md:text-3xl truncate" style="font-family: var(--font-family-display); font-weight: 600;">{{ project?.name }}</h1>
            <p class="mt-1 text-muted-foreground truncate">{{ project?.description || 'No description' }}</p>
          </div>
        </div>
        <div class="flex flex-wrap gap-2">
          <Button
            v-if="canEdit"
            variant="outline"
            size="sm"
            @click="editDialogOpen = true"
            class="gap-2"
          >
            <Edit class="w-4 h-4" />
            <span class="hidden sm:inline">Modifier</span>
          </Button>
          <Button
            v-if="canManageUsers"
            variant="outline"
            size="sm"
            @click="usersDialogOpen = true"
            class="gap-2"
          >
            <Users class="w-4 h-4" />
            <span class="hidden sm:inline">Utilisateurs</span>
          </Button>
          <Button
            v-if="canManageSettings"
            variant="outline"
            size="sm"
            @click="settingsDialogOpen = true"
            class="gap-2"
          >
            <Settings class="w-4 h-4" />
            <span class="hidden sm:inline">Paramètres</span>
          </Button>
          <Button
            v-if="project?.is_public"
            variant="outline"
            size="sm"
            @click="shareDialogOpen = true"
            class="gap-2"
          >
            <Share2 class="w-4 h-4" />
            <span class="hidden sm:inline">Partager</span>
          </Button>
        </div>
      </div>

      <div>
        <div class="mb-6">
          <h2 class="mb-4 font-semibold text-foreground text-xl">Scènes</h2>

          <div class="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <draggable
              v-model="localScenes"
              item-key="slug"
              :disabled="!canEdit"
              class="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 col-span-full"
              ghost-class="opacity-30"
              @end="onDragEnd"
            >
              <template #item="{ element: scene }">
                <SceneCard
                  :scene="scene"
                  :can-edit="canEdit"
                  @edit="openEditScene"
                  @delete="deleteScene"
                />
              </template>
            </draggable>

            <CreateSceneCard v-if="canEdit" @create="openCreateScene" />
          </div>
        </div>
      </div>

      <SceneFormSheet
        v-model:open="sceneSheetOpen"
        :editing-scene="editingScene"
        :form="sceneForm"
        @update:form="Object.assign(sceneForm, $event)"
        @submit="saveScene"
      />

      <ProjectSettingsDialog
        v-model:open="settingsDialogOpen"
        :project="project"
        :images="projectImages"
      />

      <ProjectUsersDialog
        v-model:open="usersDialogOpen"
        :project="project"
        :assigned-users="assignedUsers"
        :available-users="availableUsers"
        :available-roles="availableRoles"
      />

      <ProjectEditDialog
        v-model:open="editDialogOpen"
        :project="project"
      />

      <ProjectShareDialog
        v-model:open="shareDialogOpen"
        :project="project"
      />
    </div>
  </DashboardLayout>
</template>
