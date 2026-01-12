<script setup>
import { useTheme } from '@/composables/useTheme';
import { Moon, Sun, Monitor } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const { theme, setTheme } = useTheme();
</script>

<template>
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
</template>