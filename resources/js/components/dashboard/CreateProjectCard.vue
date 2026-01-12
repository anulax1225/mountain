<script setup>
import { Card, CardContent } from '@/components/ui/card'

defineEmits(['create'])
</script>

<template>
  <Card 
    @click="$emit('create')"
    class="border-2 border-zinc-300 hover:border-purple-400 dark:border-zinc-700 dark:hover:border-purple-600 border-dashed transition-colors cursor-pointer"
  >
    <CardContent class="flex flex-col justify-center items-center py-12 h-full">
      <div class="flex justify-center items-center bg-purple-100 dark:bg-purple-900/50 mb-4 rounded-full w-12 h-12">
        <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
      </div>
      <p class="mb-1 font-medium text-zinc-900 dark:text-zinc-100 text-sm">Créer un nouveau projet</p>
      <p class="text-zinc-500 dark:text-zinc-400 text-xs text-center">Commencez à créer votre visite virtuelle</p>
    </CardContent>
  </Card>
</template>