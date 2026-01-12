<script setup>
import { ref, onMounted } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ProjectCard from '@/components/dashboard/ProjectCard.vue'
import CreateProjectCard from '@/components/dashboard/CreateProjectCard.vue'
import owl from '@/owl-sdk.js'

defineProps({
  auth: Object,
})

const sheetOpen = ref(false)
const projects = ref([])
const loading = ref(true)
const form = ref({
  name: '',
  description: ''
})

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

const createProject = async () => {
  try {
    await owl.projects.create(form.value)
    sheetOpen.value = false
    form.value = { name: '', description: '' }
    await loadProjects()
  } catch (error) {
    console.error('Failed to create project:', error)
  }
}

const openCreateSheet = () => {
  sheetOpen.value = true
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
              <Input 
                id="description" 
                v-model="form.description" 
                placeholder="Description du projet (optionnel)"
              />
            </div>
            <Button type="submit" class="w-full">
              Créer le projet
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  </DashboardLayout>
</template>