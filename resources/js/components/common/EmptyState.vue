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
  <div class="flex flex-col justify-center items-center bg-zinc-50 dark:bg-zinc-800/50 py-16 rounded-lg">
    <component :is="icon" class="mb-4 w-16 h-16 text-zinc-300 dark:text-zinc-700" />
    <h3 class="mb-2 font-semibold text-zinc-900 dark:text-zinc-100">{{ title }}</h3>
    <p class="mb-4 text-zinc-500 dark:text-zinc-400">{{ description }}</p>
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