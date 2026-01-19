<script setup>
import { Link } from '@inertiajs/vue3'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Globe } from 'lucide-vue-next'

defineProps({
  project: Object
})
</script>

<template>
  <Card class="hover:shadow-lg transition-shadow cursor-pointer">
    <CardHeader>
      <div class="flex justify-between items-start">
        <div class="w-full">
          <div class="flex justify-between items-center mb-1">
            <CardTitle class="text-lg">{{ project.name }}</CardTitle>
            <Badge v-if="project.is_public" variant="secondary" class="ml-2">Public</Badge>
          </div>
          <CardDescription>{{ project.description || 'Aucune description' }}</CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div class="flex justify-center items-center bg-gradient-to-br from-zinc-100 dark:from-zinc-800 to-zinc-200 dark:to-zinc-700 mb-4 rounded-lg aspect-video overflow-hidden">
        <img
          v-if="project.picture_path"
          :src="`/projects/${project.slug}/picture`"
          :alt="project.name"
          class="w-full h-full object-cover"
        />
        <Globe v-else class="w-16 h-16 text-zinc-400 dark:text-zinc-500"/>
      </div>
      <div class="flex justify-between items-center text-sm">
        <span class="text-zinc-500 dark:text-zinc-400">Créé {{ new Date(project.created_at).toLocaleDateString() }}</span>
        <Link :href="`/dashboard/projects/${project.slug}`">
          <Button variant="ghost" size="sm">Ouvrir</Button>
        </Link>
      </div>
    </CardContent>
  </Card>
</template>
