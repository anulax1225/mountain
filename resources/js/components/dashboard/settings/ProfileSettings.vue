<script setup>
import { useForm } from '@inertiajs/vue3'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const props = defineProps({
  user: Object
})

const form = useForm({
  name: props.user?.name || '',
  email: props.user?.email || ''
})

const updateProfile = () => {
  form.patch(route('user-profile-information.update'))
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Informations de profil</CardTitle>
      <CardDescription>Mettez à jour les informations de votre compte</CardDescription>
    </CardHeader>
    <CardContent class="space-y-4">
      <div class="space-y-2">
        <Label for="name">Nom</Label>
        <Input id="name" v-model="form.name" />
        <div v-if="form.errors.name" class="text-red-600 dark:text-red-400 text-sm">{{ form.errors.name }}</div>
      </div>
      <div class="space-y-2">
        <Label for="email">Email</Label>
        <Input id="email" v-model="form.email" type="email" />
        <div v-if="form.errors.email" class="text-red-600 dark:text-red-400 text-sm">{{ form.errors.email }}</div>
      </div>
      <Button @click="updateProfile" :disabled="form.processing">
        Enregistrer les modifications
      </Button>
    </CardContent>
  </Card>
</template>