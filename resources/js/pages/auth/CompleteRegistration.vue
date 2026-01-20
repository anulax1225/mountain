<script setup>
import { useForm } from '@inertiajs/vue3';
import AuthLayout from '@/layouts/AuthLayout.vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const props = defineProps({
  token: String,
  email: String,
  name: String,
});

const form = useForm({
  name: props.name || '',
  password: '',
  password_confirmation: '',
});

const submit = () => {
  form.post(`/register/invitation/${props.token}`, {
    onFinish: () => form.reset('password', 'password_confirmation'),
  });
};
</script>

<template>
  <AuthLayout>
    <div class="mb-8">
      <h2 class="mb-2 font-bold text-zinc-900 dark:text-zinc-100 text-3xl">Finaliser votre inscription</h2>
      <p class="text-zinc-600 dark:text-zinc-400">
        Configurez votre mot de passe pour accéder à votre compte
      </p>
    </div>

    <div class="mb-6 bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg">
      <p class="text-zinc-600 dark:text-zinc-400 text-sm">
        Adresse email : <span class="font-medium text-zinc-900 dark:text-zinc-100">{{ email }}</span>
      </p>
    </div>

    <div v-if="form.errors.token" class="mb-4 text-red-600 dark:text-red-400 text-sm">
      {{ form.errors.token }}
    </div>

    <form @submit.prevent="submit" class="space-y-6">
      <div class="space-y-2">
        <Label for="name">Nom complet</Label>
        <Input
          id="name"
          v-model="form.name"
          type="text"
          placeholder="Votre nom"
          required
          autofocus
        />
        <div v-if="form.errors.name" class="text-red-600 dark:text-red-400 text-sm">{{ form.errors.name }}</div>
      </div>

      <div class="space-y-2">
        <Label for="password">Mot de passe</Label>
        <Input
          id="password"
          v-model="form.password"
          type="password"
          placeholder="••••••••"
          required
          autocomplete="new-password"
        />
        <div v-if="form.errors.password" class="text-red-600 dark:text-red-400 text-sm">{{ form.errors.password }}</div>
      </div>

      <div class="space-y-2">
        <Label for="password_confirmation">Confirmer le mot de passe</Label>
        <Input
          id="password_confirmation"
          v-model="form.password_confirmation"
          type="password"
          placeholder="••••••••"
          required
          autocomplete="new-password"
        />
      </div>

      <Button type="submit" class="w-full" :disabled="form.processing">
        {{ form.processing ? 'Création en cours...' : 'Créer mon compte' }}
      </Button>
    </form>
  </AuthLayout>
</template>
