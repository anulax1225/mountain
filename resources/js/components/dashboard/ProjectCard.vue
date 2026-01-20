<script setup>
import { Link } from '@inertiajs/vue3'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Globe, MoreVertical, Pencil, Trash2, ExternalLink } from 'lucide-vue-next'

defineProps({
  project: Object
})

const emit = defineEmits(['edit', 'delete'])
</script>

<template>
  <Card class="group hover:shadow-lg transition-shadow">
    <CardHeader class="pb-3">
      <div class="flex justify-between items-start gap-2">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <CardTitle class="text-lg truncate">{{ project.name }}</CardTitle>
            <Badge v-if="project.is_public" variant="secondary" class="shrink-0">Public</Badge>
          </div>
          <CardDescription class="line-clamp-2">{{ project.description || 'Aucune description' }}</CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button
              variant="ghost"
              size="icon"
              class="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              @click.stop
            >
              <MoreVertical class="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem @click="emit('edit', project)" class="cursor-pointer">
              <Pencil class="h-4 w-4 mr-2" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem @click="emit('delete', project)" class="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400">
              <Trash2 class="h-4 w-4 mr-2" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </CardHeader>
    <CardContent>
      <Link :href="`/dashboard/projects/${project.slug}`" class="block">
        <div class="flex justify-center items-center bg-gradient-to-br from-zinc-100 dark:from-zinc-800 to-zinc-200 dark:to-zinc-700 mb-4 rounded-lg aspect-video overflow-hidden group-hover:ring-2 ring-zinc-300 dark:ring-zinc-600 transition-all">
          <img
            v-if="project.picture_path"
            :src="`/projects/${project.slug}/picture`"
            :alt="project.name"
            class="w-full h-full object-cover"
          />
          <Globe v-else class="w-16 h-16 text-zinc-400 dark:text-zinc-500"/>
        </div>
      </Link>
      <div class="flex justify-between items-center text-sm">
        <span class="text-zinc-500 dark:text-zinc-400">Créé {{ new Date(project.created_at).toLocaleDateString('fr-FR') }}</span>
      </div>
    </CardContent>
  </Card>
</template>
