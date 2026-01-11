<script setup>
import { ref, computed, watch } from 'vue';
import { Link } from '@inertiajs/vue3';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FolderOpen, Image, ChevronLeft, Settings, LogOut, Menu } from 'lucide-vue-next';
import AppBrand from '@/components/AppBrand.vue';
import AppLogo from '@/components/AppLogo.vue';
import { Separator } from '@/components/ui/separator';
import owl from '@/owl-sdk.js';

const props = defineProps({
  auth: Object,
  project: Object,
  scene: Object,
});

const sidebarOpen = ref(true);
const projectScenes = ref([]);
const loading = ref(false);

const baseNavigation = [
  { name: 'Projets', icon: FolderOpen, href: '/dashboard' },
];

const navigation = computed(() => {
  if (props.project) {
    return [
      { name: 'Tous les projets', icon: ChevronLeft, href: '/dashboard' },
    ];
  }
  return baseNavigation;
});

const loadScenes = async () => {
  if (!props.project?.slug) {
    projectScenes.value = [];
    return;
  }
  
  try {
    loading.value = true;
    const response = await owl.scenes.list(props.project.slug);
    projectScenes.value = response.data || [];
  } catch (error) {
    console.error('Failed to load scenes:', error);
    projectScenes.value = [];
  } finally {
    loading.value = false;
  }
};

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

const getInitials = (name) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();
};

// Watch for project changes
watch(() => props.project, (newProject) => {
  if (newProject?.slug) {
    loadScenes();
  } else {
    projectScenes.value = [];
  }
}, { immediate: true });
</script>

<template>
  <div class="bg-zinc-50 min-h-screen">
    <!-- Sidebar -->
    <aside 
      :class="[
        'fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-zinc-200 transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-20'
      ]"
    >
      <!-- Brand -->
      <div class="flex justify-between items-center px-4 border-zinc-200 h-16">
        <div v-if="sidebarOpen" class="flex items-center gap-2">
          <AppBrand></AppBrand>
        </div>
        <div v-else class="flex justify-center items-center">
          <AppLogo class="w-9 h-9"/>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 py-4 overflow-y-auto">
        <ul class="space-y-1 px-2">
          <li v-for="item in navigation" :key="item.name">
            <Link
              :href="item.href"
              :class="[
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                'hover:bg-zinc-100 hover:text-zinc-900',
                'text-zinc-700'
              ]"
            >
              <component :is="item.icon" class="flex-shrink-0 w-5 h-5" />
              <span v-if="sidebarOpen">{{ item.name }}</span>
            </Link>
          </li>
        </ul>

        <!-- Project Context -->
        <div v-if="project && sidebarOpen" class="mt-4">
          <Separator class="my-4" />
          <div class="mb-3 px-4">
            <h3 class="font-semibold text-zinc-900 text-xs uppercase tracking-wider">
              {{ project.name }}
            </h3>
          </div>
          
          <!-- Loading State -->
          <div v-if="loading" class="flex justify-center items-center py-4">
            <div class="border-2 border-zinc-300 border-t-zinc-900 rounded-full w-5 h-5 animate-spin"></div>
          </div>

          <!-- Scenes List -->
          <ul v-else class="space-y-1 px-2">
            <li v-for="sceneItem in projectScenes" :key="sceneItem.slug">
              <Link
                :href="`/dashboard/scenes/${sceneItem.slug}`"
                :class="[
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                  scene?.slug === sceneItem.slug 
                    ? 'bg-zinc-100 text-zinc-900 font-medium' 
                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                ]"
              >
                <Image class="flex-shrink-0 w-4 h-4" />
                <span class="truncate">{{ sceneItem.name || 'Sans nom' }}</span>
              </Link>
            </li>
            
            <!-- Empty State -->
            <li v-if="projectScenes.length === 0" class="px-3 py-2">
              <p class="text-zinc-500 text-xs">Aucune scène</p>
            </li>
          </ul>
        </div>

        <!-- Compact Project Indicator -->
        <div v-if="project && !sidebarOpen" class="flex justify-center items-center mt-4">
          <div class="bg-purple-100 rounded-full w-2 h-2"></div>
        </div>
      </nav>

      <!-- User section -->
      <div class="p-4 border-zinc-200 border-t">
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <button 
              :class="[
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-100 transition-colors',
                !sidebarOpen && 'justify-center'
              ]"
            >
              <Avatar class="w-8 h-8">
                <AvatarFallback class="bg-zinc-900 text-white text-sm">
                  {{ getInitials(auth?.user?.name) }}
                </AvatarFallback>
              </Avatar>
              <div v-if="sidebarOpen" class="flex-1 text-left">
                <p class="font-medium text-zinc-900 text-sm">{{ auth?.user?.name || 'Utilisateur' }}</p>
                <p class="text-zinc-500 text-xs">{{ auth?.user?.email || 'utilisateur@exemple.com' }}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-56">
            <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href="/dashboard/settings" class="flex items-center gap-2 w-full">
                <Settings class="w-4 h-4" />
                <span>Paramètres</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href="/logout" method="post" as="button" class="flex items-center gap-2 w-full text-left">
                <LogOut class="w-4 h-4" />
                <span>Se déconnecter</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>

    <!-- Main content -->
    <div :class="['transition-all duration-300', sidebarOpen ? 'ml-64' : 'ml-20']">
      <!-- Header -->
      <header class="flex justify-between items-center px-6 border-zinc-200 border-b h-14">
        <Button variant="ghost" size="icon" @click="toggleSidebar">
          <Menu class="w-5 h-5" />
        </Button>
      </header>

      <!-- Page content -->
      <main class="px-6 py-5">
        <slot />
      </main>
    </div>

    <!-- Mobile overlay -->
    <div 
      v-if="sidebarOpen" 
      @click="toggleSidebar"
      class="lg:hidden z-40 fixed inset-0 bg-black/50"
    ></div>
  </div>
</template>