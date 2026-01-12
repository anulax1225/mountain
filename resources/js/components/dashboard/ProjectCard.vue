<script setup>
import { Link } from '@inertiajs/vue3'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

defineProps({
  project: Object
})
</script>

<template>
  <Card class="hover:shadow-lg transition-shadow cursor-pointer">
    <CardHeader>
      <div class="flex justify-between items-start">
        <div class="w-full">
          <CardTitle class="mb-1 text-lg">{{ project.name }}</CardTitle>
          <CardDescription>{{ project.description || 'Aucune description' }}</CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div class="flex justify-center items-center bg-gradient-to-br from-zinc-100 dark:from-zinc-800 to-zinc-200 dark:to-zinc-700 mb-4 rounded-lg aspect-video">
        <svg class="w-12 h-12 text-zinc-400 dark:text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
        </svg>
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