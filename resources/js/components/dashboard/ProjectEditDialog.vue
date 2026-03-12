<script setup>
import { watch } from 'vue'
import { useForm } from '@inertiajs/vue3'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import DropzoneUpload from '@/components/dashboard/scene/DropzoneUpload.vue'

const props = defineProps({
  open: Boolean,
  project: Object
})

const emit = defineEmits(['update:open'])

const form = useForm({
  name: '',
  description: '',
  photo: null,
})

const handleFileSelected = (file) => {
  form.photo = file
}

const saveProject = () => {
  form.post(`/dashboard/projects/${props.project.slug}/edit`, {
    forceFormData: true,
    onSuccess: () => {
      emit('update:open', false)
    },
  })
}

watch(() => props.open, (newValue) => {
  if (newValue && props.project) {
    form.name = props.project.name
    form.description = props.project.description || ''
    form.photo = null
    form.clearErrors()
  }
})
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>Modifier le projet</DialogTitle>
        <DialogDescription>
          Modifiez les informations de votre projet
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="saveProject" class="space-y-4 mt-4">
        <div class="space-y-2">
          <Label for="edit-name">Nom du projet</Label>
          <Input
            id="edit-name"
            v-model="form.name"
            placeholder="Mon projet"
            required
          />
          <p v-if="form.errors.name" class="text-sm text-red-500">{{ form.errors.name }}</p>
        </div>

        <div class="space-y-2">
          <Label for="edit-description">Description</Label>
          <Textarea
            id="edit-description"
            v-model="form.description"
            placeholder="Description du projet (optionnel)"
            rows="3"
          />
          <p v-if="form.errors.description" class="text-sm text-red-500">{{ form.errors.description }}</p>
        </div>

        <div class="space-y-2">
          <Label>Photo de couverture</Label>
          <DropzoneUpload
            :multiple="false"
            mode="select"
            allowed-formats="JPG, PNG, WebP"
            @file-selected="handleFileSelected"
          />
        </div>

        <div class="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            @click="emit('update:open', false)"
            :disabled="form.processing"
          >
            Annuler
          </Button>
          <Button type="submit" :disabled="form.processing || !form.name">
            {{ form.processing ? 'Enregistrement...' : 'Enregistrer' }}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>
