# Components Guide

This document defines the standard patterns for Vue components in the Owlaround platform.

## Table of Contents

- [Component Organization](#component-organization)
- [Creating Components](#creating-components)
- [UI Component Usage](#ui-component-usage)
- [Common Patterns](#common-patterns)

---

## Component Organization

### Directory Structure

```
resources/js/components/
├── ui/                    # shadcn/vue base components
│   ├── button/
│   │   └── Button.vue
│   ├── dialog/
│   │   ├── Dialog.vue
│   │   ├── DialogContent.vue
│   │   └── index.js
│   ├── input/
│   ├── sheet/
│   └── ...
├── common/                # Reusable app components
│   ├── LoadingSpinner.vue
│   └── EmptyState.vue
├── layout/                # Layout components
│   ├── Sidebar.vue
│   ├── SidebarProjectContext.vue
│   ├── UserMenu.vue
│   └── DashboardLayout.vue
└── dashboard/             # Feature-specific components
    ├── project/
    │   ├── ProjectCard.vue
    │   ├── CreateProjectCard.vue
    │   └── ProjectEditDialog.vue
    ├── scene/
    │   ├── SceneCard.vue
    │   └── SceneFormSheet.vue
    ├── image/
    │   ├── ImageCard.vue
    │   ├── ImageListItem.vue
    │   └── ImageUploadSheet.vue
    └── editor/            # 3D editor components
        ├── EditorCanvas.vue
        ├── EditorViewer.vue
        ├── HotspotPopover.vue
        └── ...
```

### Component Categories

| Category | Location | Purpose |
|----------|----------|---------|
| **UI** | `components/ui/` | shadcn/vue primitives (Button, Input, Dialog) |
| **Common** | `components/common/` | Reusable across features (LoadingSpinner, EmptyState) |
| **Layout** | `components/layout/` | Page structure (Sidebar, Header, Layout wrappers) |
| **Feature** | `components/dashboard/[feature]/` | Feature-specific (ProjectCard, SceneForm) |
| **Editor** | `components/dashboard/editor/` | 3D editor specific |

---

## Creating Components

### File Naming

- Use **PascalCase** for component files: `ProjectCard.vue`, `SceneFormSheet.vue`
- Name should describe what the component is: `[Feature][Type].vue`
- Types: `Card`, `Dialog`, `Sheet`, `Form`, `List`, `Item`, `Panel`

### Basic Component Structure

```vue
<script setup>
import { ref, computed } from 'vue'

// Props
const props = defineProps({
  project: {
    type: Object,
    required: true,
  },
  canEdit: {
    type: Boolean,
    default: false,
  },
})

// Emits
const emit = defineEmits(['edit', 'delete', 'select'])

// Local state
const isHovered = ref(false)

// Computed
const displayName = computed(() => props.project.name || 'Sans nom')

// Methods
const handleEdit = () => {
  emit('edit', props.project)
}

const handleDelete = () => {
  emit('delete', props.project.slug)
}
</script>

<template>
  <div
    class="rounded-lg border bg-card p-4"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <h3 class="font-medium">{{ displayName }}</h3>

    <div v-if="canEdit" class="mt-2 flex gap-2">
      <Button size="sm" variant="outline" @click="handleEdit">
        Modifier
      </Button>
      <Button size="sm" variant="destructive" @click="handleDelete">
        Supprimer
      </Button>
    </div>
  </div>
</template>
```

### Props Definition

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

  // Optional without default (undefined)
  scene: Object,

  // Array with default factory
  items: {
    type: Array,
    default: () => [],
  },

  // String with validator
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'compact', 'expanded'].includes(value),
  },
})
</script>
```

### Events Definition

```vue
<script setup>
// Simple events
const emit = defineEmits(['save', 'cancel', 'delete'])

// Events with payload types (documentation)
const emit = defineEmits([
  'save',           // No payload
  'edit',           // Payload: project object
  'delete',         // Payload: slug string
  'update:open',    // For v-model:open
])

// Usage
emit('save')
emit('edit', props.project)
emit('delete', props.project.slug)
emit('update:open', false)
</script>
```

### When to Extract a Component

Extract a component when:

1. **Reusability**: Code is duplicated in multiple places
2. **Complexity**: Logic is complex enough to deserve isolation
3. **Size**: Template exceeds ~100 lines
4. **Testing**: Component needs independent testing
5. **Readability**: Parent component becomes hard to follow

Don't extract when:

1. Only used once and simple
2. Would create excessive prop drilling
3. Would make the code harder to follow

---

## UI Component Usage

### Button

```vue
<script setup>
import { Button } from '@/components/ui/button'
import { Edit, Trash, Plus, Loader2 } from 'lucide-vue-next'
</script>

<template>
  <!-- Variants -->
  <Button variant="default">Primary</Button>
  <Button variant="secondary">Secondary</Button>
  <Button variant="outline">Outline</Button>
  <Button variant="ghost">Ghost</Button>
  <Button variant="destructive">Delete</Button>
  <Button variant="link">Link</Button>

  <!-- Sizes -->
  <Button size="default">Default</Button>
  <Button size="sm">Small</Button>
  <Button size="lg">Large</Button>
  <Button size="icon">
    <Edit class="h-4 w-4" />
  </Button>

  <!-- With icon -->
  <Button>
    <Plus class="mr-2 h-4 w-4" />
    Ajouter
  </Button>

  <!-- Loading state -->
  <Button :disabled="loading">
    <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
    {{ loading ? 'Chargement...' : 'Enregistrer' }}
  </Button>
</template>
```

### Dialog

```vue
<script setup>
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Titre du dialogue</DialogTitle>
        <DialogDescription>
          Description explicative du dialogue.
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4 py-4">
        <!-- Content -->
      </div>

      <DialogFooter>
        <Button variant="outline" @click="emit('update:open', false)">
          Annuler
        </Button>
        <Button @click="handleSave">
          Enregistrer
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
```

### Sheet (Side Panel)

```vue
<script setup>
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
</script>

<template>
  <Sheet :open="open" @update:open="emit('update:open', $event)">
    <SheetContent side="right" class="w-[400px] sm:w-[540px]">
      <SheetHeader>
        <SheetTitle>Détails de l'image</SheetTitle>
        <SheetDescription>
          Informations et paramètres de l'image.
        </SheetDescription>
      </SheetHeader>

      <div class="mt-6 space-y-4">
        <!-- Content -->
      </div>
    </SheetContent>
  </Sheet>
</template>
```

### Form Inputs

```vue
<script setup>
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
</script>

<template>
  <!-- Text input -->
  <div class="space-y-2">
    <Label for="name">Nom</Label>
    <Input id="name" v-model="form.name" placeholder="Entrez le nom" />
  </div>

  <!-- Textarea -->
  <div class="space-y-2">
    <Label for="description">Description</Label>
    <Textarea
      id="description"
      v-model="form.description"
      placeholder="Description..."
      rows="3"
    />
  </div>

  <!-- Select -->
  <div class="space-y-2">
    <Label for="role">Rôle</Label>
    <Select v-model="form.role">
      <SelectTrigger>
        <SelectValue placeholder="Sélectionnez" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="owner">Propriétaire</SelectItem>
        <SelectItem value="viewer">Lecteur</SelectItem>
      </SelectContent>
    </Select>
  </div>

  <!-- Checkbox -->
  <div class="flex items-center space-x-2">
    <Checkbox id="public" v-model:checked="form.isPublic" />
    <Label for="public" class="text-sm font-normal">
      Rendre public
    </Label>
  </div>
</template>
```

### Card

```vue
<script setup>
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Titre</CardTitle>
      <CardDescription>Description</CardDescription>
    </CardHeader>
    <CardContent>
      <!-- Main content -->
    </CardContent>
    <CardFooter>
      <Button>Action</Button>
    </CardFooter>
  </Card>
</template>
```

### Icons (Lucide)

```vue
<script setup>
import {
  // Navigation
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,

  // Actions
  Plus,
  Edit,
  Trash,
  Save,
  Download,
  Upload,

  // Status
  Check,
  X,
  AlertCircle,
  Info,

  // UI
  Menu,
  Search,
  Settings,
  User,
  LogOut,

  // Loading
  Loader2,  // Use with animate-spin
} from 'lucide-vue-next'
</script>

<template>
  <!-- Standard size in buttons -->
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

  <!-- Larger icon -->
  <AlertCircle class="h-8 w-8 text-destructive" />
</template>
```

---

## Common Patterns

### Loading Spinner Component

```vue
<!-- components/common/LoadingSpinner.vue -->
<script setup>
import { Loader2 } from 'lucide-vue-next'

defineProps({
  size: {
    type: String,
    default: 'default',
    validator: (v) => ['sm', 'default', 'lg'].includes(v),
  },
})

const sizeClasses = {
  sm: 'h-4 w-4',
  default: 'h-8 w-8',
  lg: 'h-12 w-12',
}
</script>

<template>
  <div class="flex items-center justify-center p-4">
    <Loader2 :class="['animate-spin text-muted-foreground', sizeClasses[size]]" />
  </div>
</template>
```

Usage:

```vue
<LoadingSpinner v-if="loading" />
<LoadingSpinner size="sm" />
```

### Empty State Component

```vue
<!-- components/common/EmptyState.vue -->
<script setup>
import { FolderOpen } from 'lucide-vue-next'

defineProps({
  icon: {
    type: Object,
    default: () => FolderOpen,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 text-center">
    <component :is="icon" class="h-12 w-12 text-muted-foreground/50" />
    <h3 class="mt-4 text-lg font-medium">{{ title }}</h3>
    <p v-if="description" class="mt-1 text-sm text-muted-foreground">
      {{ description }}
    </p>
    <div v-if="$slots.default" class="mt-4">
      <slot />
    </div>
  </div>
</template>
```

Usage:

```vue
<EmptyState
  title="Aucun projet"
  description="Créez votre premier projet pour commencer"
>
  <Button @click="createProject">
    <Plus class="mr-2 h-4 w-4" />
    Créer un projet
  </Button>
</EmptyState>
```

### Card with Actions

```vue
<!-- components/dashboard/project/ProjectCard.vue -->
<script setup>
import { computed } from 'vue'
import { Edit, Trash, Eye } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { useImagePath, useDateTime } from '@/composables'

const props = defineProps({
  project: { type: Object, required: true },
  canEdit: { type: Boolean, default: false },
})

const emit = defineEmits(['view', 'edit', 'delete'])

const { getImageUrl } = useImagePath()
const { formatSmartDate } = useDateTime()

const imageUrl = computed(() =>
  props.project.picture_path
    ? getImageUrl(props.project.picture_path)
    : '/placeholder.jpg'
)
</script>

<template>
  <div class="group relative rounded-lg border bg-card overflow-hidden">
    <!-- Image -->
    <div class="aspect-video bg-muted">
      <img
        :src="imageUrl"
        :alt="project.name"
        class="h-full w-full object-cover"
      />
    </div>

    <!-- Content -->
    <div class="p-4">
      <h3 class="font-medium truncate">{{ project.name }}</h3>
      <p class="text-sm text-muted-foreground">
        {{ formatSmartDate(project.updated_at) }}
      </p>
    </div>

    <!-- Hover actions -->
    <div
      class="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
    >
      <Button size="sm" variant="secondary" @click="emit('view', project)">
        <Eye class="mr-2 h-4 w-4" />
        Voir
      </Button>
      <Button
        v-if="canEdit"
        size="sm"
        variant="secondary"
        @click="emit('edit', project)"
      >
        <Edit class="h-4 w-4" />
      </Button>
      <Button
        v-if="canEdit"
        size="sm"
        variant="destructive"
        @click="emit('delete', project)"
      >
        <Trash class="h-4 w-4" />
      </Button>
    </div>
  </div>
</template>
```

### Dialog Component Wrapper

```vue
<!-- components/dashboard/project/ProjectEditDialog.vue -->
<script setup>
import { ref, watch } from 'vue'
import { owl } from '@/owl-sdk'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const props = defineProps({
  open: Boolean,
  project: Object,
})

const emit = defineEmits(['update:open', 'saved'])

const form = ref({ name: '', description: '' })
const saving = ref(false)

// Initialize form when dialog opens
watch(() => props.open, (isOpen) => {
  if (isOpen && props.project) {
    form.value = {
      name: props.project.name || '',
      description: props.project.description || '',
    }
  }
})

const handleSave = async () => {
  try {
    saving.value = true
    await owl.projects.update(props.project.slug, form.value)
    emit('saved')
    emit('update:open', false)
  } catch (error) {
    console.error('Failed to save:', error)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Modifier le projet</DialogTitle>
      </DialogHeader>

      <form @submit.prevent="handleSave" class="space-y-4">
        <div class="space-y-2">
          <Label for="name">Nom</Label>
          <Input id="name" v-model="form.name" required />
        </div>

        <div class="space-y-2">
          <Label for="description">Description</Label>
          <Textarea id="description" v-model="form.description" rows="3" />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            @click="emit('update:open', false)"
          >
            Annuler
          </Button>
          <Button type="submit" :disabled="saving">
            {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
```

---

## Quick Reference

### Component Checklist

- [ ] Use `<script setup>` syntax
- [ ] Define props with types and defaults
- [ ] Define emits explicitly
- [ ] Use descriptive prop/emit names
- [ ] Keep templates under 100 lines
- [ ] Extract complex logic to composables
- [ ] Use consistent naming conventions

### Naming Conventions

| Type | Format | Example |
|------|--------|---------|
| Component file | PascalCase | `ProjectCard.vue` |
| Props | camelCase | `canEdit`, `isLoading` |
| Events | kebab-case | `@update:open`, `@item-select` |
| Slots | kebab-case | `<slot name="header">` |
| CSS classes | kebab-case | `class="project-card"` |

### Import Order

```vue
<script setup>
// 1. Vue core
import { ref, computed, watch, onMounted } from 'vue'

// 2. Vue Router / Inertia
import { useRouter } from 'vue-router'

// 3. External libraries
import { owl } from '@/owl-sdk'

// 4. Composables
import { useConfirm, useApiError } from '@/composables'

// 5. UI components
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'

// 6. App components
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ProjectCard from '@/components/dashboard/project/ProjectCard.vue'

// 7. Icons
import { Edit, Trash, Plus } from 'lucide-vue-next'
</script>
```
