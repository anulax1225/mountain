<script setup>
import { Link } from '@inertiajs/vue3'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreVertical, Pencil, Trash2, Image as ImageIcon } from 'lucide-vue-next'

defineProps({
  scene: Object
})

const emit = defineEmits(['edit', 'delete'])
</script>

<template>
  <Card class="hover:shadow-lg h-full transition-shadow">
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
            <DropdownMenuItem @click="emit('edit', scene)">
              <Pencil class="mr-2 w-4 h-4" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem 
              @click="emit('delete', scene.slug)"
              class="text-red-600 dark:text-red-400"
            >
              <Trash2 class="mr-2 w-4 h-4" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </CardHeader>
    <CardContent class="space-y-4">
      <div v-if="scene.images?.length > 0" class="gap-2 grid grid-cols-2">
        <div 
          v-for="image in scene.images.slice(0, 4)" 
          :key="image.slug"
          class="relative bg-zinc-100 dark:bg-zinc-800 rounded-lg aspect-square overflow-hidden"
        >
          <img 
            :src="`/images/${image.slug}/download`" 
            :alt="scene.name"
            class="w-full h-full object-cover"
          />
        </div>
        <div 
          v-if="scene.images.length > 4"
          class="flex justify-center items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg aspect-square"
        >
          <span class="font-medium text-zinc-600 dark:text-zinc-400">+{{ scene.images.length - 4 }}</span>
        </div>
      </div>
      
      <div v-else class="flex flex-col justify-center items-center bg-zinc-50 dark:bg-zinc-800/50 py-8 rounded-lg">
        <ImageIcon class="mb-2 w-8 h-8 text-zinc-400 dark:text-zinc-600" />
        <p class="text-zinc-500 dark:text-zinc-400 text-sm">Aucune image</p>
      </div>

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
</template>