# Frontend Standards (Vue + Inertia)

This document defines the standard patterns for Vue.js and Inertia.js frontend development in the Owlaround platform.

## Table of Contents

- [Page Components](#page-components)
- [Component Patterns](#component-patterns)
- [State Management](#state-management)
- [Template Patterns](#template-patterns)
- [Styling Guidelines](#styling-guidelines)

---

## Page Components

### Structure

All page components follow this structure:

```vue
<script setup>
import { ref, computed, onMounted } from 'vue'
import { owl } from '@/owl-sdk'
import DashboardLayout from '@/components/layout/DashboardLayout.vue'
import { useConfirm } from '@/composables'

// Props from Inertia
const props = defineProps({
  auth: Object,
  projectSlug: String,
})

// Local state
const project = ref(null)
const loading = ref(true)

// Computed properties
const canEdit = computed(() => project.value?.permissions?.can_edit ?? false)

// Methods
const loadProject = async () => {
  try {
    loading.value = true
    const response = await owl.projects.get(props.projectSlug)
    project.value = response
  } catch (error) {
    console.error('Failed to load project:', error)
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadProject()
})
</script>

<template>
  <DashboardLayout :auth="auth" :project="project">
    <div class="mx-auto max-w-7xl">
      <!-- Page content -->
    </div>
  </DashboardLayout>
</template>
```

### Props from Inertia

Pages receive props passed from Laravel controllers:

```php
// Laravel Controller
return Inertia::render('dashboard/ProjectShow', [
    'auth' => [
        'user' => $request->user(),
    ],
    'projectSlug' => $project->slug,
]);
```

```vue
<script setup>
// Vue Page
const props = defineProps({
  auth: Object,
  projectSlug: String,
})

// Access user
const user = computed(() => props.auth?.user)
const canCreateProjects = computed(() => props.auth?.user?.can_create_projects ?? false)
</script>
```

### Layout Wrapping

Pages are wrapped in layouts that provide navigation context:

```vue
<template>
  <!-- DashboardLayout provides sidebar, header, and navigation -->
  <DashboardLayout :auth="auth" :project="project" :scene="scene">
    <div class="mx-auto max-w-7xl">
      <!-- Page-specific content -->
    </div>
  </DashboardLayout>
</template>
```

**Layout props:**

| Prop | Type | Purpose |
|------|------|---------|
| `auth` | Object | User authentication data |
| `project` | Object | Current project context (shows in sidebar) |
| `scene` | Object | Current scene context (shows breadcrumb) |

### Data Loading Pattern

Load data in `onMounted` with error handling:

```vue
<script setup>
const project = ref(null)
const scenes = ref([])
const loading = ref(true)

const loadProject = async () => {
  try {
    loading.value = true
    const response = await owl.projects.get(props.projectSlug)
    project.value = response
    await loadScenes()
  } catch (error) {
    console.error('Failed to load project:', error)
  } finally {
    loading.value = false
  }
}

const loadScenes = async () => {
  try {
    const response = await owl.scenes.list(props.projectSlug)
    scenes.value = response.data || []

    // Load nested data if needed
    for (const scene of scenes.value) {
      const imagesResponse = await owl.images.list(scene.slug)
      scene.images = imagesResponse.data || []
    }
  } catch (error) {
    console.error('Failed to load scenes:', error)
  }
}

onMounted(() => {
  loadProject()
})
</script>
```

---

## Component Patterns

### Props Definition

Define props with types and defaults:

```vue
<script setup>
const props = defineProps({
  // Required prop
  project: {
    type: Object,
    required: true,
  },

  // Optional with default
  canEdit: {
    type: Boolean,
    default: false,
  },

  // Optional without default
  scene: Object,

  // Array with default
  images: {
    type: Array,
    default: () => [],
  },
})
</script>
```

### Events Emission

Define and emit events clearly:

```vue
<script setup>
// Define all events the component emits
const emit = defineEmits([
  'edit',
  'delete',
  'select',
  'update:open',  // For v-model:open
])

// Emit with data
const handleEdit = () => {
  emit('edit', props.project)
}

const handleDelete = () => {
  emit('delete', props.project.slug)
}

// Emit for v-model
const handleClose = () => {
  emit('update:open', false)
}
</script>

<template>
  <div>
    <Button @click="handleEdit">Edit</Button>
    <Button @click="handleDelete" variant="destructive">Delete</Button>
  </div>
</template>
```

### Props-Down/Events-Up Pattern

Parent components manage state, children receive props and emit events:

**Parent (Page):**

```vue
<script setup>
const images = ref([])
const currentImageIndex = ref(0)
const mode = ref('view')

const handleImageSelect = (index) => {
  currentImageIndex.value = index
}

const handleModeChange = (newMode) => {
  mode.value = newMode
}
</script>

<template>
  <EditorCanvas
    :images="images"
    :current-index="currentImageIndex"
    :mode="mode"
    @select="handleImageSelect"
    @mode-change="handleModeChange"
  />
</template>
```

**Child (Component):**

```vue
<script setup>
const props = defineProps({
  images: Array,
  currentIndex: Number,
  mode: String,
})

const emit = defineEmits(['select', 'mode-change'])

const selectImage = (index) => {
  emit('select', index)
}
</script>
```

### Two-Way Binding with v-model

For dialogs and sheets, use `v-model:open`:

**Parent:**

```vue
<script setup>
const dialogOpen = ref(false)
</script>

<template>
  <Button @click="dialogOpen = true">Open Dialog</Button>

  <MyDialog
    v-model:open="dialogOpen"
    :data="someData"
    @save="handleSave"
  />
</template>
```

**Child (Dialog):**

```vue
<script setup>
const props = defineProps({
  open: Boolean,
  data: Object,
})

const emit = defineEmits(['update:open', 'save'])

const close = () => {
  emit('update:open', false)
}

const save = () => {
  emit('save', formData)
  close()
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent>
      <!-- Content -->
      <Button @click="save">Save</Button>
    </DialogContent>
  </Dialog>
</template>
```

### Component Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Pages | PascalCase | `ProjectShow.vue`, `SceneShow.vue` |
| Components | PascalCase | `SceneCard.vue`, `ImageSlider.vue` |
| Composables | camelCase with `use` prefix | `useConfirm.js`, `useApiError.js` |
| Utilities | camelCase | `spatialMath.js`, `editorConstants.js` |

---

## State Management

### Local State with Refs

Use `ref()` for component-local state:

```vue
<script setup>
// Simple values
const loading = ref(false)
const dialogOpen = ref(false)
const currentIndex = ref(0)

// Objects
const form = ref({
  name: '',
  description: '',
  photo: null,
})

// Arrays
const items = ref([])
</script>
```

### Computed Properties

Use `computed()` for derived state:

```vue
<script setup>
const project = ref(null)
const images = ref([])
const currentIndex = ref(0)

// Simple computed
const currentImage = computed(() => images.value[currentIndex.value])

// Permission checks
const canEdit = computed(() => project.value?.permissions?.can_edit ?? false)
const canDelete = computed(() => project.value?.permissions?.can_delete ?? false)

// Derived data
const imageCount = computed(() => images.value.length)
const hasImages = computed(() => images.value.length > 0)

// Complex computed
const currentImageSceneSlug = computed(() => {
  const image = currentImage.value
  if (!image) return null
  const scene = scenes.value.find(s => s.images?.some(img => img.id === image.id))
  return scene?.slug || null
})
</script>
```

### Dialog State Pattern

Manage dialog visibility with boolean refs:

```vue
<script setup>
// Dialog states
const editDialogOpen = ref(false)
const deleteDialogOpen = ref(false)
const uploadSheetOpen = ref(false)

// Data for dialogs
const editingItem = ref(null)

// Open dialog with data
const openEditDialog = (item) => {
  editingItem.value = item
  editDialogOpen.value = true
}

// Close and clear
const closeEditDialog = () => {
  editDialogOpen.value = false
  editingItem.value = null
}
</script>

<template>
  <Button @click="openEditDialog(project)">Edit</Button>

  <EditDialog
    v-model:open="editDialogOpen"
    :item="editingItem"
    @save="handleSave"
  />
</template>
```

### Sequential Dialog Flow

For multi-step workflows, chain dialogs with delays:

```vue
<script setup>
import { TIMING } from '@/lib/editorConstants'

const step1Open = ref(false)
const step2Open = ref(false)
const pendingData = ref(null)

const handleStep1Complete = (data) => {
  pendingData.value = data
  step1Open.value = false

  // Delay opening next dialog for animation
  setTimeout(() => {
    step2Open.value = true
  }, TIMING.DIALOG_TRANSITION_DELAY_MS)
}

const handleStep2Complete = async (finalData) => {
  // Combine data and submit
  await submitData({
    ...pendingData.value,
    ...finalData,
  })

  step2Open.value = false
  pendingData.value = null
}
</script>
```

### Shared State via Composables

For state shared across components, use composables:

```vue
<script setup>
import { useEditorInteraction } from '@/composables'

// Shared interaction state
const interaction = useEditorInteraction()

// Pass to children via props
const hoveredHotspotSlug = computed(() => interaction.hoveredHotspotSlug.value)

// Update from handlers
const handleHotspotHover = (slug) => {
  interaction.setHoveredHotspot(slug)
}

const handleCameraMove = () => {
  interaction.clearHoverStates()
}
</script>

<template>
  <EditorCanvas
    :hovered-hotspot-slug="hoveredHotspotSlug"
    @hotspot-hover="handleHotspotHover"
    @camera-move="handleCameraMove"
  />
</template>
```

---

## Template Patterns

### Conditional Rendering

Use `v-if`/`v-else` for conditional content:

```vue
<template>
  <div>
    <!-- Loading state -->
    <LoadingSpinner v-if="loading" />

    <!-- Content when loaded -->
    <div v-else>
      <!-- Empty state -->
      <EmptyState
        v-if="items.length === 0"
        title="Aucun élément"
        description="Commencez par ajouter des éléments"
      >
        <Button @click="addItem">
          <Plus class="mr-2 h-4 w-4" />
          Ajouter
        </Button>
      </EmptyState>

      <!-- Content -->
      <div v-else class="grid gap-4">
        <ItemCard
          v-for="item in items"
          :key="item.slug"
          :item="item"
        />
      </div>
    </div>
  </div>
</template>
```

### Permission-Based Rendering

Show/hide UI based on permissions:

```vue
<template>
  <div class="flex gap-2">
    <!-- Only show if user can edit -->
    <Button
      v-if="canEdit"
      variant="outline"
      size="sm"
      @click="editDialogOpen = true"
    >
      <Edit class="mr-2 h-4 w-4" />
      Modifier
    </Button>

    <!-- Only show if user can delete -->
    <Button
      v-if="canDelete"
      variant="destructive"
      size="sm"
      @click="handleDelete"
    >
      <Trash class="mr-2 h-4 w-4" />
      Supprimer
    </Button>

    <!-- Always visible actions -->
    <Button variant="ghost" size="sm" @click="viewDetails">
      <Eye class="mr-2 h-4 w-4" />
      Voir
    </Button>
  </div>
</template>
```

### List Rendering

Use `v-for` with proper keys:

```vue
<template>
  <!-- Grid layout -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <ItemCard
      v-for="item in items"
      :key="item.slug"
      :item="item"
      :can-edit="canEdit"
      @edit="handleEdit"
      @delete="handleDelete"
    />
  </div>

  <!-- List layout -->
  <div class="divide-y">
    <ItemListRow
      v-for="item in items"
      :key="item.slug"
      :item="item"
      @click="selectItem(item)"
    />
  </div>
</template>
```

### View Mode Toggle

Switch between grid/list/slider views:

```vue
<script setup>
import { useViewMode } from '@/composables'

const { viewMode, toggleViewMode } = useViewMode('imagesView', 'grid', ['grid', 'list', 'slider'])
</script>

<template>
  <div>
    <!-- View mode toggle button -->
    <Button variant="ghost" size="icon" @click="toggleViewMode">
      <LayoutGrid v-if="viewMode === 'grid'" class="h-4 w-4" />
      <List v-else-if="viewMode === 'list'" class="h-4 w-4" />
      <Columns v-else class="h-4 w-4" />
    </Button>

    <!-- Conditional view -->
    <div v-if="viewMode === 'slider' && images.length > 0">
      <ImageSlider :images="images" @select="handleSelect" />
    </div>

    <div v-else-if="viewMode === 'grid'" class="grid gap-6">
      <ImageCard v-for="image in images" :key="image.slug" :image="image" />
    </div>

    <div v-else-if="viewMode === 'list'" class="divide-y">
      <ImageListItem v-for="image in images" :key="image.slug" :image="image" />
    </div>
  </div>
</template>
```

### Loading States

Always handle loading states:

```vue
<template>
  <div>
    <!-- Full page loading -->
    <div v-if="loading" class="flex items-center justify-center h-64">
      <LoadingSpinner />
    </div>

    <!-- Content -->
    <div v-else>
      <!-- ... -->
    </div>
  </div>
</template>

<!-- Or with skeleton -->
<template>
  <div>
    <div v-if="loading" class="space-y-4">
      <Skeleton class="h-12 w-full" />
      <Skeleton class="h-12 w-full" />
      <Skeleton class="h-12 w-full" />
    </div>

    <div v-else>
      <!-- Actual content -->
    </div>
  </div>
</template>
```

### Button Loading States

Show loading on submit buttons:

```vue
<script setup>
const saving = ref(false)

const handleSave = async () => {
  try {
    saving.value = true
    await owl.projects.update(project.slug, formData)
    emit('saved')
  } catch (error) {
    handleError(error)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Button :disabled="saving" @click="handleSave">
    <Loader2 v-if="saving" class="mr-2 h-4 w-4 animate-spin" />
    {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
  </Button>
</template>
```

---

## Styling Guidelines

### Tailwind CSS Usage

Use Tailwind utility classes:

```vue
<template>
  <!-- Spacing -->
  <div class="p-4 m-2 space-y-4">

  <!-- Flexbox -->
  <div class="flex items-center justify-between gap-4">

  <!-- Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

  <!-- Typography -->
  <h1 class="text-2xl font-bold text-foreground">
  <p class="text-sm text-muted-foreground">

  <!-- Borders & Rounded -->
  <div class="border rounded-lg shadow-sm">

  <!-- Dark mode (automatic with zinc theme) -->
  <div class="bg-background text-foreground">
</template>
```

### Responsive Design

Mobile-first with breakpoint modifiers:

```vue
<template>
  <!-- Grid: 1 column on mobile, 2 on tablet, 3 on desktop -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

  <!-- Hide on mobile, show on desktop -->
  <div class="hidden md:block">

  <!-- Different padding per breakpoint -->
  <div class="p-4 md:p-6 lg:p-8">

  <!-- Stack on mobile, row on desktop -->
  <div class="flex flex-col md:flex-row gap-4">
</template>
```

### shadcn/vue Components

Use shadcn/vue for consistent UI:

```vue
<script setup>
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Titre du dialogue</DialogTitle>
        <DialogDescription>
          Description explicative
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4">
        <div class="space-y-2">
          <Label for="name">Nom</Label>
          <Input id="name" v-model="form.name" />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="close">Annuler</Button>
        <Button @click="save">Enregistrer</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
```

### Icons (Lucide)

Use lucide-vue-next for icons:

```vue
<script setup>
import {
  Edit,
  Trash,
  Plus,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-vue-next'
</script>

<template>
  <!-- In buttons -->
  <Button>
    <Plus class="mr-2 h-4 w-4" />
    Ajouter
  </Button>

  <!-- Icon-only button -->
  <Button variant="ghost" size="icon">
    <Edit class="h-4 w-4" />
  </Button>

  <!-- Loading spinner -->
  <Loader2 class="h-4 w-4 animate-spin" />
</template>
```

---

## Quick Reference

### Page Component Checklist

- [ ] Define props with `defineProps`
- [ ] Wrap content in appropriate layout
- [ ] Load data in `onMounted`
- [ ] Handle loading states
- [ ] Define computed properties for permissions
- [ ] Use composables for shared functionality

### Component Checklist

- [ ] Define props with types and defaults
- [ ] Define emits with `defineEmits`
- [ ] Use `v-model:open` for dialogs
- [ ] Emit events with descriptive names
- [ ] Don't manage parent state locally

### Template Checklist

- [ ] Use `v-if`/`v-else` for conditional content
- [ ] Use `:key` with unique values in `v-for`
- [ ] Show loading states
- [ ] Show empty states
- [ ] Check permissions before showing actions
- [ ] Use consistent button variants

### Style Checklist

- [ ] Use Tailwind utilities (no custom CSS)
- [ ] Mobile-first responsive design
- [ ] Use shadcn/vue components
- [ ] Use Lucide icons
- [ ] Follow dark mode compatibility (use semantic colors)
