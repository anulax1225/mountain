<script setup>
import { useForm, Link } from '@inertiajs/vue3';
import AuthLayout from '@/layouts/AuthLayout.vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

defineProps({
  status: String,
  canResetPassword: Boolean,
});

const form = useForm({
  email: '',
  password: '',
  remember: false,
});

const submit = () => {
  form.post('/login', {
    onFinish: () => form.reset('password'),
  });
};
</script>

<template>
  <AuthLayout>
    <div class="mb-8">
      <h2 class="mb-2 font-bold text-zinc-900 dark:text-zinc-100 text-3xl">Bon retour</h2>
      <p class="text-zinc-600 dark:text-zinc-400">Connectez-vous à votre compte pour continuer</p>
    </div>

    <div v-if="status" class="mb-4 font-medium text-green-600 dark:text-green-400 text-sm">
      {{ status }}
    </div>

    <form @submit.prevent="submit" class="space-y-6">
      <div class="space-y-2">
        <Label for="email">Email</Label>
        <Input 
          id="email" 
          v-model="form.email" 
          type="email" 
          placeholder="vous@exemple.com" 
          required 
          autofocus
          autocomplete="username"
        />
        <div v-if="form.errors.email" class="text-red-600 dark:text-red-400 text-sm">{{ form.errors.email }}</div>
      </div>

      <div class="space-y-2">
        <div class="flex justify-between items-center">
          <Label for="password">Mot de passe</Label>
          <Link 
            v-if="canResetPassword"
            href="/forgot-password" 
            class="text-purple-600 hover:text-purple-700 dark:hover:text-purple-300 dark:text-purple-400 text-sm"
          >
            Mot de passe oublié?
          </Link>
        </div>
        <Input 
          id="password" 
          v-model="form.password" 
          type="password" 
          placeholder="••••••••" 
          required
          autocomplete="current-password"
        />
        <div v-if="form.errors.password" class="text-red-600 dark:text-red-400 text-sm">{{ form.errors.password }}</div>
      </div>

      <Button type="submit" class="w-full" :disabled="form.processing">
        Se connecter
      </Button>
    </form>

    <div class="mt-6 text-sm text-center">
      <span class="text-zinc-600 dark:text-zinc-400">Vous n'avez pas de compte? Contactez un administrateur pour obtenir un accès.</span>
    </div>
  </AuthLayout>
</template>