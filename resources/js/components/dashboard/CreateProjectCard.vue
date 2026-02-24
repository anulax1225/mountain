<script setup>
import { Card, CardContent } from '@/components/ui/card'

defineEmits(['create'])
</script>

<template>
  <Card
    @click="$emit('create')"
    class="border-2 border-border hover:border-primary border-dashed transition-colors cursor-pointer"
  >
    <CardContent class="flex flex-col justify-center items-center py-12 h-full">
      <div class="flex justify-center items-center bg-primary/10 mb-4 rounded-full w-12 h-12">
        <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
      </div>
      <p class="mb-1 font-medium text-foreground text-sm">Créer un nouveau projet</p>
      <p class="text-muted-foreground text-xs text-center">Commencez à créer votre visite virtuelle</p>
    </CardContent>
  </Card>
</template>