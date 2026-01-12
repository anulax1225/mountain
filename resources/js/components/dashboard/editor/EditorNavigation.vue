<script setup>
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

defineProps({
  currentIndex: Number,
  totalImages: Number
})

const emit = defineEmits(['prev', 'next'])
</script>

<template>
  <div>
    <div v-if="currentIndex > 0" class="top-1/2 left-4 absolute -translate-y-1/2">
      <Button variant="secondary" size="icon" @click="emit('prev')">
        <ChevronLeft class="w-5 h-5" />
      </Button>
    </div>
    <div v-if="currentIndex < totalImages - 1" class="top-1/2 right-4 absolute -translate-y-1/2">
      <Button variant="secondary" size="icon" @click="emit('next')">
        <ChevronRight class="w-5 h-5" />
      </Button>
    </div>
  </div>
</template>