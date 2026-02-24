<script setup>
import { ref } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { Moon, Sun, Monitor, Palette } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import ThemePicker from './ThemePicker.vue'

const { theme, setTheme } = useTheme()

const pickerOpen = ref(false)

const togglePicker = () => {
  pickerOpen.value = !pickerOpen.value
}

const closePicker = () => {
  pickerOpen.value = false
}
</script>

<template>
  <div class="flex items-center gap-1">
    <!-- Theme Picker Toggle -->
    <div class="relative">
      <Button variant="ghost" size="icon" @click="togglePicker" title="Personnaliser le thème">
        <Palette class="w-5 h-5" />
      </Button>

      <!-- Theme Picker Panel -->
      <Transition name="picker">
        <div
          v-if="pickerOpen"
          class="absolute right-0 top-full mt-2 z-50 bg-popover border border-border rounded-lg shadow-lg"
        >
          <ThemePicker />
        </div>
      </Transition>

      <!-- Click outside to close -->
      <div
        v-if="pickerOpen"
        class="fixed inset-0 z-40"
        @click="closePicker"
      ></div>
    </div>

    <!-- Light/Dark Mode Toggle -->
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="ghost" size="icon">
          <Sun class="dark:hidden w-5 h-5" />
          <Moon class="hidden dark:block w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem @click="setTheme('light')">
          <Sun class="mr-2 w-4 h-4" />
          <span>Clair</span>
        </DropdownMenuItem>
        <DropdownMenuItem @click="setTheme('dark')">
          <Moon class="mr-2 w-4 h-4" />
          <span>Sombre</span>
        </DropdownMenuItem>
        <DropdownMenuItem @click="setTheme('system')">
          <Monitor class="mr-2 w-4 h-4" />
          <span>Système</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>

<style scoped>
.picker-enter-active,
.picker-leave-active {
  transition: all 0.2s ease;
}

.picker-enter-from,
.picker-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
