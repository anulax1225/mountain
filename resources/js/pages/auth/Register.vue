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
      <h2 class="mb-2 font-bold text-slate-900 text-3xl">Create account</h2>
      <p class="text-slate-600">Start building your virtual tours</p>
    </div>

    <form @submit.prevent="submit" class="space-y-4">
      <div class="space-y-2">
        <Label for="name">Name</Label>
        <Input 
          id="name" 
          v-model="form.name" 
          type="text" 
          placeholder="John Doe" 
          required
          autofocus
          autocomplete="name"
        />
        <div v-if="form.errors.name" class="text-red-600 text-sm">{{ form.errors.name }}</div>
      </div>

      <div class="space-y-2">
        <Label for="email">Email</Label>
        <Input 
          id="email" 
          v-model="form.email" 
          type="email" 
          placeholder="you@example.com" 
          required
          autocomplete="username"
        />
        <div v-if="form.errors.email" class="text-red-600 text-sm">{{ form.errors.email }}</div>
      </div>

      <div class="space-y-2">
        <Label for="password">Password</Label>
        <Input 
          id="password" 
          v-model="form.password" 
          type="password" 
          placeholder="••••••••" 
          required
          autocomplete="new-password"
        />
        <div v-if="form.errors.password" class="text-red-600 text-sm">{{ form.errors.password }}</div>
      </div>

      <div class="space-y-2">
        <Label for="password_confirmation">Confirm Password</Label>
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
        Create account
      </Button>
    </form>

    <div class="mt-6 text-sm text-center">
      <span class="text-slate-600">Already have an account? </span>
      <Link href="/login" class="font-medium text-purple-600 hover:text-purple-700">
        Sign in
      </Link>
    </div>
  </AuthLayout>
</template>