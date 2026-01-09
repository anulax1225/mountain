<script setup>
import { useForm } from '@inertiajs/vue3';
import AuthLayout from '@/layouts/AuthLayout.vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from '@inertiajs/vue3';

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
      <h2 class="mb-2 font-bold text-slate-900 text-3xl">Welcome back</h2>
      <p class="text-slate-600">Sign in to your account to continue</p>
    </div>

    <div v-if="status" class="mb-4 font-medium text-green-600 text-sm">
      {{ status }}
    </div>

    <form @submit.prevent="submit" class="space-y-6">
      <div class="space-y-2">
        <Label for="email">Email</Label>
        <Input 
          id="email" 
          v-model="form.email" 
          type="email" 
          placeholder="you@example.com" 
          required 
          autofocus
          autocomplete="username"
        />
        <div v-if="form.errors.email" class="text-red-600 text-sm">{{ form.errors.email }}</div>
      </div>

      <div class="space-y-2">
        <div class="flex justify-between items-center">
          <Label for="password">Password</Label>
          <Link 
            v-if="canResetPassword"
            href="/forgot-password" 
            class="text-purple-600 hover:text-purple-700 text-sm"
          >
            Forgot password?
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
        <div v-if="form.errors.password" class="text-red-600 text-sm">{{ form.errors.password }}</div>
      </div>

      <Button type="submit" class="w-full" :disabled="form.processing">
        Sign in
      </Button>
    </form>

    <div class="mt-6 text-sm text-center">
      <span class="text-slate-600">Don't have an account? </span>
      <Link href="/register" class="font-medium text-purple-600 hover:text-purple-700">
        Sign up
      </Link>
    </div>
  </AuthLayout>
</template>