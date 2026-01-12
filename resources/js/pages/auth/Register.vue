<script setup>
import { useForm, Link } from '@inertiajs/vue3';
import AuthLayout from '@/layouts/AuthLayout.vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const form = useForm({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
});

const submit = () => {
  form.post('/register', {
    onFinish: () => form.reset('password', 'password_confirmation'),
  });
};
</script>

<template>
  <AuthLayout>
    <div class="mb-8">
      <h2 class="mb-2 font-bold text-zinc-900 dark:text-zinc-100 text-3xl">Créer un compte</h2>
      <p class="text-zinc-600 dark:text-zinc-400">Commencez à créer vos visites virtuelles</p>
    </div>

    <form @submit.prevent="submit" class="space-y-4">
      <div class="space-y-2">
        <Label for="name">Nom</Label>
        <Input 
          id="name" 
          v-model="form.name" 
          type="text" 
          placeholder="Jean Dupont" 
          required
          autofocus
          autocomplete="name"
        />
        <div v-if="form.errors.name" class="text-red-600 dark:text-red-400 text-sm">{{ form.errors.name }}</div>
      </div>

      <div class="space-y-2">
        <Label for="email">Email</Label>
        <Input 
          id="email" 
          v-model="form.email" 
          type="email" 
          placeholder="vous@exemple.com" 
          required
          autocomplete="username"
        />
        <div v-if="form.errors.email" class="text-red-600 dark:text-red-400 text-sm">{{ form.errors.email }}</div>
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
        Créer un compte
      </Button>
    </form>

    <div class="mt-6 text-sm text-center">
      <span class="text-zinc-600 dark:text-zinc-400">Vous avez déjà un compte? </span>
      <Link href="/login" class="font-medium text-purple-600 hover:text-purple-700 dark:hover:text-purple-300 dark:text-purple-400">
        Se connecter
      </Link>
    </div>
  </AuthLayout>
</template>