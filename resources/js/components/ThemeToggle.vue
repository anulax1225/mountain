<script setup>
import { ref, computed, nextTick, onBeforeUnmount } from 'vue'
import { usePage } from '@inertiajs/vue3'
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

const page = usePage()
const isAdmin = computed(() => !!page.props.auth?.user?.is_admin)

const SM_BREAKPOINT = 640
const isMobile = ref(window.innerWidth < SM_BREAKPOINT)

const onResize = () => {
  isMobile.value = window.innerWidth < SM_BREAKPOINT
}
window.addEventListener('resize', onResize)
onBeforeUnmount(() => window.removeEventListener('resize', onResize))

const pickerOpen = ref(false)
const triggerRef = ref(null)
const panelStyle = ref({})

const updatePanelPosition = () => {
  if (isMobile.value || !triggerRef.value?.$el) return
  const rect = triggerRef.value.$el.getBoundingClientRect()
  panelStyle.value = {
    top: `${rect.bottom + 8}px`,
    right: `${window.innerWidth - rect.right}px`,
  }
}

const togglePicker = async () => {
  pickerOpen.value = !pickerOpen.value
  if (pickerOpen.value) {
    await nextTick()
    updatePanelPosition()
  }
}

const closePicker = () => {
  pickerOpen.value = false
}
</script>

<template>
  <div class="flex items-center gap-1">
    <!-- Theme Picker Toggle (admin only) -->
    <div v-if="isAdmin" class="relative">
      <Button ref="triggerRef" variant="ghost" size="icon" @click="togglePicker" title="Personnaliser le thème">
        <Palette class="w-5 h-5" />
      </Button>

      <Teleport to="body">
        <!-- Backdrop -->
        <Transition name="fade">
          <div
            v-if="pickerOpen"
            class="fixed inset-0 z-90"
            :class="isMobile ? 'bg-black/30' : 'bg-transparent'"
            @click="closePicker"
          />
        </Transition>

        <!-- Panel: bottom sheet on mobile, anchored dropdown on desktop -->
        <Transition :name="isMobile ? 'sheet' : 'picker'">
          <div
            v-if="pickerOpen"
            class="fixed z-100 bg-popover border border-border shadow-lg"
            :class="isMobile
              ? 'inset-x-2 bottom-2 rounded-xl'
              : 'rounded-lg w-80'"
            :style="!isMobile ? panelStyle : undefined"
          >
            <ThemePicker :mobile="isMobile" />
          </div>
        </Transition>
      </Teleport>
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
/* Dropdown (desktop) */
.picker-enter-active,
.picker-leave-active {
  transition: all 0.2s ease;
}
.picker-enter-from,
.picker-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Bottom sheet (mobile) */
.sheet-enter-active,
.sheet-leave-active {
  transition: all 0.25s ease;
}
.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

/* Backdrop fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
