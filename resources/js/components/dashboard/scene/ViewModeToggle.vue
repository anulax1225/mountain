<script setup>
import { Button } from '@/components/ui/button'
import { Grid3x3, LayoutGrid, Presentation } from 'lucide-vue-next'

defineProps({
  modelValue: String
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="flex gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
    <Button
      variant="ghost"
      size="icon-sm"
      :class="modelValue === 'grid' ? 'bg-white dark:bg-zinc-700 shadow-sm' : ''"
      @click="emit('update:modelValue', 'grid')"
    >
      <Grid3x3 class="w-4 h-4" />
    </Button>
    <Button
      variant="ghost"
      size="icon-sm"
      :class="modelValue === 'list' ? 'bg-white dark:bg-zinc-700 shadow-sm' : ''"
      @click="emit('update:modelValue', 'list')"
    >
      <LayoutGrid class="w-4 h-4" />
    </Button>
    <Button
      variant="ghost"
      size="icon-sm"
      :class="modelValue === 'slider' ? 'bg-white dark:bg-zinc-700 shadow-sm' : ''"
      @click="emit('update:modelValue', 'slider')"
    >
      <Presentation class="w-4 h-4" />
    </Button>
  </div>
</template>