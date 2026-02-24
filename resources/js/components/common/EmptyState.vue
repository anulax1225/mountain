<script setup>
defineProps({
  icon: {
    type: Object,
    required: true
  },
  title: String,
  description: String,
  actionLabel: String
})

const emit = defineEmits(['action'])
</script>

<template>
  <div class="flex flex-col justify-center items-center bg-muted py-16 rounded-lg">
    <component :is="icon" class="mb-4 w-16 h-16 text-muted-foreground/50" />
    <h3 class="mb-2 font-semibold text-foreground">{{ title }}</h3>
    <p class="mb-4 text-muted-foreground">{{ description }}</p>
    <slot name="action">
      <Button v-if="actionLabel" @click="emit('action')">
        {{ actionLabel }}
      </Button>
    </slot>
  </div>
</template>

<script>
import { Button } from '@/components/ui/button'
export default {
  components: { Button }
}
</script>