<script setup>
import { ref, onMounted } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ProjectCard from '@/components/dashboard/ProjectCard.vue'
import CreateProjectCard from '@/components/dashboard/CreateProjectCard.vue'
import { useConfirm } from '@/composables'
import owl from '@/owl-sdk.js'

defineProps({
  auth: Object,
})

const { confirmDelete } = useConfirm()

const sheetOpen = ref(false)
const editSheetOpen = ref(false)
const projects = ref([])
const loading = ref(true)
const editingProject = ref(null)
const submitting = ref(false)

const form = ref({
  name: '',
  description: '',
  photo: null
})

const editForm = ref({
  name: '',
  description: '',
  photo: null
})

const photoInput = ref(null)
const photoPreview = ref(null)
const editPhotoPreview = ref(null)

const loadProjects = async () => {
  try {
    loading.value = true
    const response = await owl.projects.list()
    projects.value = response.data || []
  } catch (error) {
    console.error('Failed to load projects:', error)
  } finally {
    loading.value = false
  }
}

const handlePhotoSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    form.value.photo = file
    const reader = new FileReader()
    reader.onload = (e) => {
      photoPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const createProject = async () => {
  try {
    const formData = new FormData()
    formData.append('name', form.value.name)
    if (form.value.description) {
      formData.append('description', form.value.description)
    }
    if (form.value.photo) {
      formData.append('photo', form.value.photo)
    }

    await owl.projects.create(formData)
    sheetOpen.value = false
    form.value = { name: '', description: '', photo: null }
    photoPreview.value = null
    await loadProjects()
  } catch (error) {
    console.error('Failed to create project:', error)
  }
}

const openCreateSheet = () => {
  sheetOpen.value = true
}

const openEditSheet = (project) => {
  editingProject.value = project
  editForm.value = {
    name: project.name,
    description: project.description || '',
    photo: null
  }
  editPhotoPreview.value = project.picture_path ? `/projects/${project.slug}/picture` : null
  editSheetOpen.value = true
}

const handleEditPhotoSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    editForm.value.photo = file
    const reader = new FileReader()
    reader.onload = (e) => {
      editPhotoPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const updateProject = async () => {
  if (!editingProject.value || submitting.value) return

  try {
    submitting.value = true
    const formData = new FormData()
    formData.append('name', editForm.value.name)
    formData.append('description', editForm.value.description || '')
    if (editForm.value.photo) {
      formData.append('photo', editForm.value.photo)
    }
    formData.append('_method', 'PUT')

    await owl.projects.update(editingProject.value.slug, formData)
    editSheetOpen.value = false
    editingProject.value = null
    editForm.value = { name: '', description: '', photo: null }
    editPhotoPreview.value = null
    await loadProjects()
  } catch (error) {
    console.error('Failed to update project:', error)
  } finally {
    submitting.value = false
  }
}

const handleDeleteProject = async (project) => {
  const confirmed = await confirmDelete(project.name)
  if (!confirmed) return

  try {
    await owl.projects.delete(project.slug)
    await loadProjects()
  } catch (error) {
    console.error('Failed to delete project:', error)
  }
}

onMounted(() => {
  loadProjects()
})
</script>

<template>
  <DashboardLayout :auth="auth">
    <div class="mx-auto max-w-7xl">
      <div class="mb-8">
        <h1 class="font-bold text-zinc-900 dark:text-zinc-100 text-3xl">Projets</h1>
        <p class="mt-1 text-zinc-600 dark:text-zinc-400">Gérez vos projets de visite virtuelle</p>
      </div>

      <LoadingSpinner v-if="loading" />

      <div v-else class="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <ProjectCard
          v-for="project in projects"
          :key="project.slug"
          :project="project"
          @edit="openEditSheet"
          @delete="handleDeleteProject"
        />

        <CreateProjectCard @create="openCreateSheet" />
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
                v-model="form.name"
                placeholder="Mon projet"
                required
              />
            </div>
            <div class="space-y-2">
              <Label for="description">Description</Label>
              <Textarea
                id="description"
                v-model="form.description"
                placeholder="Description du projet (optionnel)"
                rows="3"
              />
            </div>
            <div class="space-y-2">
              <Label for="photo">Photo de couverture</Label>
              <Input
                id="photo"
                ref="photoInput"
                type="file"
                accept="image/*"
                @change="handlePhotoSelect"
              />
              <div v-if="photoPreview" class="mt-2">
                <img :src="photoPreview" alt="Preview" class="w-full h-32 object-cover rounded-md" />
              </div>
            </div>
            <Button type="submit" class="w-full">
              Créer le projet
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
              <Label for="edit-photo">Photo de couverture</Label>
              <Input
                id="edit-photo"
                type="file"
                accept="image/*"
                @change="handleEditPhotoSelect"
              />
              <div v-if="editPhotoPreview" class="mt-2">
                <img :src="editPhotoPreview" alt="Preview" class="w-full h-32 object-cover rounded-md" />
              </div>
            </div>
            <Button type="submit" class="w-full" :disabled="submitting">
              {{ submitting ? 'Enregistrement...' : 'Enregistrer les modifications' }}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  </DashboardLayout>
</template>
