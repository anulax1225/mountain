<script setup>
import { useForm } from '@inertiajs/vue3'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const form = useForm({
  current_password: '',
  password: '',
  password_confirmation: ''
})

const updatePassword = () => {
  form.put(route('user-password.update'), {
    onSuccess: () => form.reset()
  })
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Changer le mot de passe</CardTitle>
      <CardDescription>Mettez à jour votre mot de passe pour sécuriser votre compte</CardDescription>
    </CardHeader>
    <CardContent class="space-y-4">
      <div class="space-y-2">
        <Label for="current_password">Mot de passe actuel</Label>
        <Input 
          id="current_password" 
          v-model="form.current_password" 
          type="password"
          autocomplete="current-password"
        />
        <div v-if="form.errors.current_password" class="text-red-600 dark:text-red-400 text-sm">
          {{ form.errors.current_password }}
        </div>
      </div>
      <div class="space-y-2">
        <Label for="password">Nouveau mot de passe</Label>
        <Input 
          id="password" 
          v-model="form.password" 
          type="password"
          autocomplete="new-password"
        />
        <div v-if="form.errors.password" class="text-red-600 dark:text-red-400 text-sm">
          {{ form.errors.password }}
        </div>
      </div>
      <div class="space-y-2">
        <Label for="password_confirmation">Confirmer le nouveau mot de passe</Label>
        <Input 
          id="password_confirmation" 
          v-model="form.password_confirmation" 
          type="password"
          autocomplete="new-password"
        />
      </div>
      <Button @click="updatePassword" :disabled="form.processing">
        Mettre à jour le mot de passe
      </Button>
    </CardContent>
  </Card>
</template>