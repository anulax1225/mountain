<script setup>
import { Card, CardContent } from '@/components/ui/card'
import { Plus } from 'lucide-vue-next'

defineEmits(['create'])
</script>

<template>
  <Card
    @click="$emit('create')"
    class="border-2 border-border hover:border-primary border-dashed transition-colors cursor-pointer"
  >
    <CardContent class="flex flex-col justify-center items-center py-12 h-full">
      <div class="flex justify-center items-center bg-primary/10 mb-4 rounded-full w-12 h-12">
        <Plus class="w-6 h-6 text-primary" />
      </div>
      <p class="mb-1 font-medium text-foreground text-sm">Créer une scène</p>
      <p class="text-muted-foreground text-xs text-center">Ajouter une nouvelle scène au projet</p>
    </CardContent>
  </Card>
</template>