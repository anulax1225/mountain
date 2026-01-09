<script setup>
import { ref, onMounted } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link } from '@inertiajs/vue3'
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

onMounted(() => {
  loadProjects()
})
</script>

<template>
  <DashboardLayout :auth="auth">
    <div class="mx-auto max-w-7xl">
      <div class="mb-8">
        <h1 class="font-bold text-slate-900 text-3xl">Projets</h1>
        <p class="mt-1 text-slate-600">Gérez vos projets de visite virtuelle</p>
      </div>

      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="border-4 border-slate-300 border-t-slate-900 rounded-full w-8 h-8 animate-spin"></div>
      </div>

      <div v-else class="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <Card v-for="project in projects" :key="project.slug" class="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div class="flex justify-between items-start">
              <div class="w-full">
                <CardTitle class="mb-1 text-lg">{{ project.name }}</CardTitle>
                <CardDescription>{{ project.description || 'Aucune description' }}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div class="flex justify-center items-center bg-gradient-to-br from-slate-100 to-slate-200 mb-4 rounded-lg aspect-video">
              <svg class="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
              </svg>
            </div>
            <div class="flex justify-between items-center text-sm">
              <span class="text-slate-500">Créé {{ new Date(project.created_at).toLocaleDateString() }}</span>
              <Link :href="`/dashboard/projects/${project.slug}`">
                <Button variant="ghost" size="sm">Ouvrir</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Sheet v-model:open="sheetOpen">
          <SheetTrigger as-child>
            <Card class="border-2 border-slate-300 hover:border-purple-400 border-dashed transition-colors cursor-pointer">
              <CardContent class="flex flex-col justify-center items-center py-12 h-full">
                <div class="flex justify-center items-center bg-purple-100 mb-4 rounded-full w-12 h-12">
                  <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                  </svg>
                </div>
                <p class="mb-1 font-medium text-slate-900 text-sm">Créer un nouveau projet</p>
                <p class="text-slate-500 text-xs text-center">Commencez à créer votre visite virtuelle</p>
              </CardContent>
            </Card>
          </SheetTrigger>
          <SheetContent>
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
    </div>
  </DashboardLayout>
</template>