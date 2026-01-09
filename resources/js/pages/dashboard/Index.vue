<script setup>
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@inertiajs/vue3';

defineProps({
  auth: Object,
  projects: Array,
});
</script>

<template>
  <DashboardLayout :auth="auth">
    <div class="mx-auto max-w-7xl">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="font-bold text-slate-900 text-3xl">Projects</h1>
          <p class="mt-1 text-slate-600">Manage your virtual tour projects</p>
        </div>
        <Button>
          <svg class="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          New Project
        </Button>
      </div>

      <div class="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <Card v-for="project in projects" :key="project.id" class="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div class="flex justify-between items-start">
              <div class="w-full">
                <CardTitle class="mb-1 text-lg">{{ project.name }}</CardTitle>
                <CardDescription>{{ project.scenes_count }} scenes</CardDescription>
              </div>
              <Button variant="ghost" size="icon" class="flex-shrink-0">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                </svg>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div class="flex justify-center items-center bg-gradient-to-br from-slate-100 to-slate-200 mb-4 rounded-lg aspect-video">
              <svg class="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
              </svg>
            </div>
            <div class="flex justify-between items-center text-sm">
              <span class="text-slate-500">Updated {{ project.updated_at }}</span>
              <Link :href="`/dashboard/projects/${project.slug}`">
                <Button variant="ghost" size="sm">Open</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card class="border-2 border-slate-300 hover:border-purple-400 border-dashed transition-colors cursor-pointer">
          <CardContent class="flex flex-col justify-center items-center py-12 h-full">
            <div class="flex justify-center items-center bg-purple-100 mb-4 rounded-full w-12 h-12">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
            </div>
            <p class="mb-1 font-medium text-slate-900 text-sm">Create New Project</p>
            <p class="text-slate-500 text-xs text-center">Start building your virtual tour</p>
          </CardContent>
        </Card>
      </div>
    </div>
  </DashboardLayout>
</template>
