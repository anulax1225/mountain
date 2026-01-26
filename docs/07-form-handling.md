# Form Handling

This document defines the standard patterns for form handling in the Owlaround platform.

## Table of Contents

- [Simple Forms](#simple-forms)
- [Validated Forms](#validated-forms)
- [File Uploads](#file-uploads)
- [Form UI Patterns](#form-ui-patterns)

---

## Simple Forms

For basic forms without complex validation, use direct `v-model` binding.

### Basic Pattern

```vue
<script setup>
import { ref } from 'vue'
import { owl } from '@/owl-sdk'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const emit = defineEmits(['saved', 'update:open'])

// Form state
const form = ref({
  name: '',
  description: '',
})

// Loading state
const saving = ref(false)

// Submit handler
const handleSubmit = async () => {
  try {
    saving.value = true

    await owl.scenes.create(props.projectSlug, {
      name: form.value.name,
      description: form.value.description,
    })

    // Reset form
    form.value = { name: '', description: '' }

    // Notify parent
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
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div class="space-y-2">
      <Label for="name">Nom</Label>
      <Input
        id="name"
        v-model="form.name"
        placeholder="Nom de la scène"
        required
      />
    </div>

    <div class="space-y-2">
      <Label for="description">Description</Label>
      <Textarea
        id="description"
        v-model="form.description"
        placeholder="Description (optionnel)"
        rows="3"
      />
    </div>

    <div class="flex justify-end gap-2">
      <Button type="button" variant="outline" @click="emit('update:open', false)">
        Annuler
      </Button>
      <Button type="submit" :disabled="saving">
        {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
      </Button>
    </div>
  </form>
</template>
```

### Pre-fill Form for Editing

```vue
<script setup>
const props = defineProps({
  item: Object,  // Existing item for editing
})

// Initialize form with existing data or defaults
const form = ref({
  name: props.item?.name || '',
  description: props.item?.description || '',
})

// Watch for prop changes
watch(() => props.item, (newItem) => {
  if (newItem) {
    form.value = {
      name: newItem.name || '',
      description: newItem.description || '',
    }
  }
}, { immediate: true })
</script>
```

---

## Validated Forms

For forms requiring validation, use the `useForm` composable.

### With useForm Composable

```vue
<script setup>
import { useForm, validators } from '@/composables'
import { owl } from '@/owl-sdk'

const emit = defineEmits(['saved', 'update:open'])

// Initialize form with validation
const form = useForm(
  // Initial values
  {
    name: '',
    email: '',
    message: '',
  },
  // Options
  {
    validate: {
      name: [
        validators.required('Le nom est obligatoire'),
        validators.minLength(2, 'Le nom doit contenir au moins 2 caractères'),
      ],
      email: [
        validators.required('L\'email est obligatoire'),
        validators.email('L\'email n\'est pas valide'),
      ],
      message: [
        validators.required('Le message est obligatoire'),
        validators.maxLength(1000, 'Le message ne peut pas dépasser 1000 caractères'),
      ],
    },
    onSuccess: () => {
      emit('saved')
      emit('update:open', false)
    },
    resetOnSuccess: true,
  }
)

// Submit with validation
const handleSubmit = () => {
  form.submit(async (data) => {
    return await owl.contactRequests.create(data)
  })
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div class="space-y-2">
      <Label for="name">Nom *</Label>
      <Input
        id="name"
        v-model="form.data.value.name"
        :class="{ 'border-destructive': form.hasError('name') }"
        @blur="form.touch('name')"
      />
      <p v-if="form.hasError('name')" class="text-sm text-destructive">
        {{ form.getError('name') }}
      </p>
    </div>

    <div class="space-y-2">
      <Label for="email">Email *</Label>
      <Input
        id="email"
        type="email"
        v-model="form.data.value.email"
        :class="{ 'border-destructive': form.hasError('email') }"
        @blur="form.touch('email')"
      />
      <p v-if="form.hasError('email')" class="text-sm text-destructive">
        {{ form.getError('email') }}
      </p>
    </div>

    <div class="space-y-2">
      <Label for="message">Message *</Label>
      <Textarea
        id="message"
        v-model="form.data.value.message"
        :class="{ 'border-destructive': form.hasError('message') }"
        rows="5"
        @blur="form.touch('message')"
      />
      <p v-if="form.hasError('message')" class="text-sm text-destructive">
        {{ form.getError('message') }}
      </p>
    </div>

    <Button type="submit" :disabled="form.isSubmitting.value" class="w-full">
      {{ form.isSubmitting.value ? 'Envoi en cours...' : 'Envoyer' }}
    </Button>
  </form>
</template>
```

### Available Validators

```javascript
import { validators } from '@/composables'

// Required field
validators.required()
validators.required('Custom error message')

// String length
validators.minLength(3)
validators.minLength(3, 'Minimum 3 characters')
validators.maxLength(255)

// Email format
validators.email()
validators.email('Invalid email')

// URL format
validators.url()

// Numeric range
validators.min(0)
validators.max(100)

// Pattern matching
validators.pattern(/^[A-Z]/, 'Must start with uppercase')

// Match another field
validators.matches('password', 'Passwords must match')
```

### Handling Server Validation Errors

```vue
<script setup>
import { useForm, useApiError } from '@/composables'

const { isValidationError, getValidationErrors } = useApiError()

const form = useForm({ name: '', email: '' })

const handleSubmit = async () => {
  try {
    form.clearErrors()
    await owl.users.create(form.data.value)
    emit('saved')
  } catch (error) {
    if (isValidationError(error)) {
      // Set server-side validation errors
      form.setErrors(getValidationErrors(error))
    } else {
      handleError(error)
    }
  }
}
</script>
```

---

## File Uploads

### Simple File Input

```vue
<script setup>
const form = ref({
  name: '',
  photo: null,
})

const photoPreview = ref(null)

const handlePhotoSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    form.value.photo = file

    // Generate preview
    const reader = new FileReader()
    reader.onload = (e) => {
      photoPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const handleSubmit = async () => {
  const formData = new FormData()
  formData.append('name', form.value.name)

  if (form.value.photo) {
    formData.append('photo', form.value.photo)
  }

  await owl.projects.create(formData)
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div class="space-y-2">
      <Label for="name">Nom</Label>
      <Input id="name" v-model="form.name" required />
    </div>

    <div class="space-y-2">
      <Label for="photo">Photo</Label>
      <Input
        id="photo"
        type="file"
        accept="image/*"
        @change="handlePhotoSelect"
      />
      <img
        v-if="photoPreview"
        :src="photoPreview"
        class="mt-2 h-32 w-32 object-cover rounded"
        alt="Preview"
      />
    </div>

    <Button type="submit">Créer</Button>
  </form>
</template>
```

### With useImageUpload Composable

```vue
<script setup>
import { useImageUpload } from '@/composables'
import { owl } from '@/owl-sdk'

const props = defineProps({
  sceneSlug: String,
})

const emit = defineEmits(['uploaded'])

const {
  uploadFiles,
  isUploading,
  uploadProgress,
  errors,
  hasErrors,
  successCount,
  reset,
} = useImageUpload({
  maxFileSize: 50 * 1024 * 1024,  // 50MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  validateEquirectangular: true,   // Validate 2:1 aspect ratio
})

const handleFileSelect = async (event) => {
  const files = Array.from(event.target.files)
  if (!files.length) return

  const result = await uploadFiles(files, async (formData) => {
    const file = formData.get('file')
    return await owl.images.upload(props.sceneSlug, file)
  })

  if (result.success) {
    emit('uploaded', result.files)
    reset()
  }
}
</script>

<template>
  <div class="space-y-4">
    <div class="border-2 border-dashed rounded-lg p-8 text-center">
      <input
        type="file"
        accept="image/*"
        multiple
        class="hidden"
        ref="fileInput"
        @change="handleFileSelect"
      />

      <Button
        type="button"
        variant="outline"
        :disabled="isUploading"
        @click="$refs.fileInput.click()"
      >
        <Upload class="mr-2 h-4 w-4" />
        Sélectionner des images
      </Button>

      <p class="mt-2 text-sm text-muted-foreground">
        JPEG, PNG ou WebP, max 50Mo, format équirectangulaire (2:1)
      </p>
    </div>

    <!-- Progress -->
    <div v-if="isUploading" class="space-y-2">
      <div class="flex justify-between text-sm">
        <span>Upload en cours...</span>
        <span>{{ uploadProgress }}%</span>
      </div>
      <Progress :value="uploadProgress" />
    </div>

    <!-- Errors -->
    <div v-if="hasErrors" class="space-y-1">
      <p v-for="error in errors" :key="error" class="text-sm text-destructive">
        {{ error }}
      </p>
    </div>

    <!-- Success count -->
    <p v-if="successCount > 0" class="text-sm text-green-600">
      {{ successCount }} image(s) téléchargée(s) avec succès
    </p>
  </div>
</template>
```

### Drag and Drop Upload

```vue
<script setup>
const isDragging = ref(false)

const handleDragOver = (event) => {
  event.preventDefault()
  isDragging.value = true
}

const handleDragLeave = () => {
  isDragging.value = false
}

const handleDrop = async (event) => {
  event.preventDefault()
  isDragging.value = false

  const files = Array.from(event.dataTransfer.files).filter(
    file => file.type.startsWith('image/')
  )

  if (files.length) {
    await handleFileSelect({ target: { files } })
  }
}
</script>

<template>
  <div
    class="border-2 border-dashed rounded-lg p-8 text-center transition-colors"
    :class="{
      'border-primary bg-primary/5': isDragging,
      'border-muted-foreground/25': !isDragging,
    }"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <Upload class="mx-auto h-12 w-12 text-muted-foreground" />
    <p class="mt-4 text-sm text-muted-foreground">
      Glissez-déposez des images ici ou
      <button type="button" class="text-primary underline" @click="$refs.fileInput.click()">
        parcourez vos fichiers
      </button>
    </p>
  </div>
</template>
```

---

## Form UI Patterns

### Label + Input Structure

```vue
<template>
  <div class="space-y-2">
    <Label for="fieldId">Label Text</Label>
    <Input id="fieldId" v-model="value" />
    <p class="text-sm text-muted-foreground">
      Helper text explaining the field
    </p>
  </div>
</template>
```

### Error Display

```vue
<template>
  <div class="space-y-2">
    <Label for="name" :class="{ 'text-destructive': hasError }">
      Nom *
    </Label>
    <Input
      id="name"
      v-model="form.name"
      :class="{ 'border-destructive focus-visible:ring-destructive': hasError }"
    />
    <p v-if="hasError" class="text-sm text-destructive">
      {{ errorMessage }}
    </p>
  </div>
</template>
```

### Required Field Indicator

```vue
<template>
  <Label for="name">
    Nom <span class="text-destructive">*</span>
  </Label>
</template>
```

### Submit Button with Loading

```vue
<template>
  <Button type="submit" :disabled="isSubmitting">
    <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
    {{ isSubmitting ? 'Enregistrement...' : 'Enregistrer' }}
  </Button>
</template>
```

### Form Actions (Cancel + Submit)

```vue
<template>
  <div class="flex justify-end gap-2 pt-4">
    <Button type="button" variant="outline" @click="cancel">
      Annuler
    </Button>
    <Button type="submit" :disabled="isSubmitting">
      {{ isSubmitting ? 'Enregistrement...' : 'Enregistrer' }}
    </Button>
  </div>
</template>
```

### Full-Width Form in Dialog

```vue
<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Créer une scène</DialogTitle>
        <DialogDescription>
          Ajoutez une nouvelle scène à votre projet
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="space-y-2">
          <Label for="name">Nom *</Label>
          <Input id="name" v-model="form.name" required />
        </div>

        <div class="space-y-2">
          <Label for="description">Description</Label>
          <Textarea id="description" v-model="form.description" rows="3" />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="emit('update:open', false)">
            Annuler
          </Button>
          <Button type="submit" :disabled="saving">
            {{ saving ? 'Création...' : 'Créer' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
```

### Select Field

```vue
<script setup>
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
</script>

<template>
  <div class="space-y-2">
    <Label for="role">Rôle</Label>
    <Select v-model="form.role">
      <SelectTrigger>
        <SelectValue placeholder="Sélectionnez un rôle" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="owner">Propriétaire</SelectItem>
        <SelectItem value="viewer">Lecteur</SelectItem>
      </SelectContent>
    </Select>
  </div>
</template>
```

### Checkbox Field

```vue
<script setup>
import { Checkbox } from '@/components/ui/checkbox'
</script>

<template>
  <div class="flex items-center space-x-2">
    <Checkbox id="public" v-model:checked="form.isPublic" />
    <Label for="public" class="text-sm font-normal">
      Rendre ce projet public
    </Label>
  </div>
</template>
```

---

## Quick Reference

### Form Pattern Selection

| Scenario | Pattern |
|----------|---------|
| Simple create/edit | Direct `v-model` |
| Complex validation | `useForm` composable |
| File upload | `useImageUpload` composable |
| Server validation | `useApiError` + `setErrors` |

### Form Checklist

- [ ] Use `@submit.prevent` on form element
- [ ] Add loading state to submit button
- [ ] Disable submit button while submitting
- [ ] Show validation errors below fields
- [ ] Mark required fields with asterisk
- [ ] Use appropriate input types (email, number, etc.)
- [ ] Add placeholder text for guidance
- [ ] Include Cancel button in dialogs
- [ ] Reset form after successful submission
- [ ] Handle both client and server validation errors
