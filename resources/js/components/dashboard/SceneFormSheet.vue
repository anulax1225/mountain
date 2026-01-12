<script setup>
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

const props = defineProps({
  open: Boolean,
  editingScene: Object,
  form: Object
})

const emit = defineEmits(['update:open', 'submit', 'update:form'])

const updateForm = (key, value) => {
  emit('update:form', { ...props.form, [key]: value })
}
</script>

<template>
  <Sheet :open="open" @update:open="emit('update:open', $event)">
    <SheetContent class="px-6">
      <SheetHeader>
        <SheetTitle>{{ editingScene ? 'Modifier la scène' : 'Nouvelle scène' }}</SheetTitle>
        <SheetDescription>
          {{ editingScene ? 'Modifier les informations de la scène' : 'Créer une nouvelle scène dans ce projet' }}
        </SheetDescription>
      </SheetHeader>
      <form @submit.prevent="emit('submit')" class="space-y-4 mt-6">
        <div class="space-y-2">
          <Label for="scene-name">Nom de la scène</Label>
          <Input 
            id="scene-name" 
            :model-value="form.name" 
            @update:model-value="updateForm('name', $event)"
            placeholder="Ex: Étage 1, Salon, etc."
          />
        </div>
        <Button type="submit" class="w-full">
          {{ editingScene ? 'Enregistrer' : 'Créer la scène' }}
        </Button>
      </form>
    </SheetContent>
  </Sheet>
</template>