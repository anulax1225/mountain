<script setup>
import { ref, onMounted } from 'vue'
import { useForm } from '@inertiajs/vue3'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Plus, Image as ImageIcon, MoreVertical, Pencil, Trash2 } from 'lucide-vue-next'
import { Link } from '@inertiajs/vue3'
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

const sceneForm = ref({
  name: ''
})

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
    
    // Load images for each scene
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
  <DashboardLayout :auth="auth">
    <div class="mx-auto max-w-7xl">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-8">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft class="w-5 h-5" />
          </Button>
        </Link>
        <div class="flex-1">
          <h1 class="font-bold text-zinc-900 text-3xl">{{ project?.name || 'Loading...' }}</h1>
          <p class="mt-1 text-zinc-600">{{ project?.description || 'No description' }}</p>
        </div>
      </div>

      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="border-4 border-zinc-300 border-t-zinc-900 rounded-full w-8 h-8 animate-spin"></div>
      </div>

      <div v-else>
        <!-- Scenes Section -->
        <div class="mb-6">
          <h2 class="mb-4 font-semibold text-zinc-900 text-xl">Scènes</h2>
          
          <div class="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <!-- Scene Cards -->
            <Card 
              v-for="scene in scenes" 
              :key="scene.slug" 
              class="hover:shadow-lg h-full transition-shadow"
            >
              <CardHeader>
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <CardTitle class="text-lg">{{ scene.name || 'Sans nom' }}</CardTitle>
                    <CardDescription>{{ scene.images?.length || 0 }} image(s)</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                      <Button variant="ghost" size="icon-sm">
                        <MoreVertical class="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem @click="openEditScene(scene)">
                        <Pencil class="mr-2 w-4 h-4" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        @click="deleteScene(scene.slug)"
                        class="text-red-600"
                      >
                        <Trash2 class="mr-2 w-4 h-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent class="space-y-4">
                <!-- Images Grid -->
                <div v-if="scene.images?.length > 0" class="gap-2 grid grid-cols-2">
                  <div 
                    v-for="image in scene.images.slice(0, 4)" 
                    :key="image.slug"
                    class="relative bg-zinc-100 rounded-lg aspect-square overflow-hidden"
                  >
                    <img 
                      :src="`/images/${image.slug}/download`" 
                      :alt="scene.name"
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <div 
                    v-if="scene.images.length > 4"
                    class="flex justify-center items-center bg-zinc-100 rounded-lg aspect-square"
                  >
                    <span class="font-medium text-zinc-600">+{{ scene.images.length - 4 }}</span>
                  </div>
                </div>
                
                <!-- No Images State -->
                <div v-else class="flex flex-col justify-center items-center bg-zinc-50 py-8 rounded-lg">
                  <ImageIcon class="mb-2 w-8 h-8 text-zinc-400" />
                  <p class="text-zinc-500 text-sm">Aucune image</p>
                </div>

                <!-- View Button -->
                <Link :href="`/dashboard/scenes/${scene.slug}`">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    class="w-full"
                  >
                    <ImageIcon class="mr-2 w-4 h-4" />
                    Voir les images
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <!-- Create Scene Card -->
            <Card 
              @click="openCreateScene"
              class="border-2 border-zinc-300 hover:border-purple-400 border-dashed transition-colors cursor-pointer"
            >
              <CardContent class="flex flex-col justify-center items-center py-12 h-full">
                <div class="flex justify-center items-center bg-purple-100 mb-4 rounded-full w-12 h-12">
                  <Plus class="w-6 h-6 text-purple-600" />
                </div>
                <p class="mb-1 font-medium text-zinc-900 text-sm">Créer une scène</p>
                <p class="text-zinc-500 text-xs text-center">Ajouter une nouvelle scène au projet</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <!-- Scene Form Sheet -->
      <Sheet v-model:open="sceneSheetOpen">
        <SheetContent class="px-6">
          <SheetHeader>
            <SheetTitle>{{ editingScene ? 'Modifier la scène' : 'Nouvelle scène' }}</SheetTitle>
            <SheetDescription>
              {{ editingScene ? 'Modifier les informations de la scène' : 'Créer une nouvelle scène dans ce projet' }}
            </SheetDescription>
          </SheetHeader>
          <form @submit.prevent="saveScene" class="space-y-4 mt-6">
            <div class="space-y-2">
              <Label for="scene-name">Nom de la scène</Label>
              <Input 
                id="scene-name" 
                v-model="sceneForm.name" 
                placeholder="Ex: Étage 1, Salon, etc."
              />
            </div>
            <Button type="submit" class="w-full">
              {{ editingScene ? 'Enregistrer' : 'Créer la scène' }}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  </DashboardLayout>
</template>