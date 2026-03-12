<script setup>
import { ref, computed } from 'vue'
import { useForm, router } from '@inertiajs/vue3'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import ProjectCard from '@/components/dashboard/ProjectCard.vue'
import CreateProjectCard from '@/components/dashboard/CreateProjectCard.vue'
import DropzoneUpload from '@/components/dashboard/scene/DropzoneUpload.vue'
import { useConfirm } from '@/composables'

const props = defineProps({
  auth: Object,
  projects: Object,
})

const canCreateProjects = computed(() => props.auth?.user?.can_create_projects ?? false)

const { confirmDelete } = useConfirm()

const sheetOpen = ref(false)
const editSheetOpen = ref(false)
const editingProject = ref(null)

const createForm = useForm({
  name: '',
  description: '',
  photo: null,
})

const editForm = useForm({
  name: '',
  description: '',
  photo: null,
  _method: 'PUT',
})

const createProject = () => {
  createForm.post('/dashboard/projects', {
    onSuccess: () => {
      sheetOpen.value = false
      createForm.reset()
    },
    forceFormData: true,
  })
}

const openCreateSheet = () => {
  createForm.reset()
  sheetOpen.value = true
}

const openEditSheet = (project) => {
  editingProject.value = project
  editForm.name = project.name
  editForm.description = project.description || ''
  editForm.photo = null
  editSheetOpen.value = true
}

const updateProject = () => {
  if (!editingProject.value) return

  editForm.post(`/dashboard/projects/${editingProject.value.slug}`, {
    onSuccess: () => {
      editSheetOpen.value = false
      editingProject.value = null
      editForm.reset()
    },
    forceFormData: true,
  })
}

const handleDeleteProject = async (project) => {
  const confirmed = await confirmDelete(project.name)
  if (!confirmed) return

  router.delete(`/dashboard/projects/${project.slug}`)
}
</script>

<template>
  <DashboardLayout :auth="auth">
    <div class="mx-auto max-w-7xl">
      <div class="mb-6 md:mb-8">
        <h1 class="font-bold text-foreground text-2xl md:text-3xl">Projets</h1>
        <p class="mt-1 text-muted-foreground">Gérez vos projets de visite virtuelle</p>
      </div>

      <div class="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <ProjectCard
          v-for="project in projects.data"
          :key="project.slug"
          :project="project"
          @edit="openEditSheet"
          @delete="handleDeleteProject"
        />

        <CreateProjectCard v-if="canCreateProjects" @create="openCreateSheet" />
      </div>

      <Sheet v-model:open="sheetOpen">
        <SheetContent class="px-6">
          <SheetHeader>
            <SheetTitle>Nouveau projet</SheetTitle>
            <SheetDescription>
              Créez un nouveau projet de visite virtuelle
            </SheetDescription>
          </SheetHeader>
          <form @submit.prevent="createProject" class="space-y-4 mt-6">
            <div class="space-y-2">
              <Label for="name">Nom du projet</Label>
              <Input
                id="name"
                v-model="createForm.name"
                placeholder="Mon projet"
                required
              />
              <p v-if="createForm.errors.name" class="text-red-500 text-sm">{{ createForm.errors.name }}</p>
            </div>
            <div class="space-y-2">
              <Label for="description">Description</Label>
              <Textarea
                id="description"
                v-model="createForm.description"
                placeholder="Description du projet (optionnel)"
                rows="3"
              />
            </div>
            <div class="space-y-2">
              <Label>Photo de couverture</Label>
              <DropzoneUpload
                :multiple="false"
                mode="select"
                allowed-formats="JPG, PNG, WebP"
                @file-selected="(file) => createForm.photo = file"
              />
            </div>
            <Button type="submit" class="w-full" :disabled="createForm.processing">
              {{ createForm.processing ? 'Création...' : 'Créer le projet' }}
            </Button>
          </form>
        </SheetContent>
      </Sheet>

      <Sheet v-model:open="editSheetOpen">
        <SheetContent class="px-6">
          <SheetHeader>
            <SheetTitle>Modifier le projet</SheetTitle>
            <SheetDescription>
              Modifiez les informations du projet
            </SheetDescription>
          </SheetHeader>
          <form @submit.prevent="updateProject" class="space-y-4 mt-6">
            <div class="space-y-2">
              <Label for="edit-name">Nom du projet</Label>
              <Input
                id="edit-name"
                v-model="editForm.name"
                placeholder="Mon projet"
                required
              />
              <p v-if="editForm.errors.name" class="text-red-500 text-sm">{{ editForm.errors.name }}</p>
            </div>
            <div class="space-y-2">
              <Label for="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                v-model="editForm.description"
                placeholder="Description du projet (optionnel)"
                rows="3"
              />
            </div>
            <div class="space-y-2">
              <Label>Photo de couverture</Label>
              <DropzoneUpload
                :multiple="false"
                mode="select"
                allowed-formats="JPG, PNG, WebP"
                @file-selected="(file) => editForm.photo = file"
              />
            </div>
            <Button type="submit" class="w-full" :disabled="editForm.processing">
              {{ editForm.processing ? 'Enregistrement...' : 'Enregistrer les modifications' }}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  </DashboardLayout>
</template>
