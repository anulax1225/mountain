<script setup>
import { ref, watch } from 'vue'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import owl from '@/owl-sdk.js'

const props = defineProps({
  open: Boolean,
  project: Object
})

const emit = defineEmits(['update:open', 'saved'])

const form = ref({
  name: '',
  description: '',
  photo: null
})

const photoInput = ref(null)
const photoPreview = ref(null)
const saving = ref(false)

const handlePhotoSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    form.value.photo = file
    const reader = new FileReader()
    reader.onload = (e) => {
      photoPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const removePhoto = () => {
  form.value.photo = null
  photoPreview.value = null
  if (photoInput.value) {
    photoInput.value.value = ''
  }
}

const saveProject = async () => {
  try {
    saving.value = true

    const formData = new FormData()
    formData.append('name', form.value.name)
    if (form.value.description) {
      formData.append('description', form.value.description)
    }
    if (form.value.photo) {
      formData.append('photo', form.value.photo)
    }

    await owl.projects.patch(props.project.slug, formData)

    emit('saved')
    emit('update:open', false)
  } catch (error) {
    console.error('Failed to update project:', error)
    alert('Erreur lors de la mise à jour du projet')
  } finally {
    saving.value = false
  }
}

watch(() => props.open, (newValue) => {
  if (newValue && props.project) {
    form.value.name = props.project.name
    form.value.description = props.project.description || ''
    form.value.photo = null
    photoPreview.value = props.project.picture_path ? `/projects/${props.project.slug}/picture` : null
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
        </div>

        <div class="space-y-2">
          <Label for="edit-description">Description</Label>
          <Textarea
            id="edit-description"
            v-model="form.description"
            placeholder="Description du projet (optionnel)"
            rows="3"
          />
        </div>

        <div class="space-y-2">
          <Label for="edit-photo">Photo de couverture</Label>
          <Input
            id="edit-photo"
            ref="photoInput"
            type="file"
            accept="image/*"
            @change="handlePhotoSelect"
          />

          <div v-if="photoPreview" class="mt-2 relative">
            <img
              :src="photoPreview"
              alt="Preview"
              class="w-full h-32 object-cover rounded-md"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              class="absolute top-2 right-2"
              @click="removePhoto"
            >
              Supprimer
            </Button>
          </div>
        </div>

        <div class="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            @click="emit('update:open', false)"
            :disabled="saving"
          >
            Annuler
          </Button>
          <Button type="submit" :disabled="saving || !form.name">
            {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>
