<script setup>
import { useForm } from '@inertiajs/vue3';
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

const props = defineProps({
  auth: Object,
});

const profileForm = useForm({
  name: props.auth.user.name,
  email: props.auth.user.email,
});

const passwordForm = useForm({
  current_password: '',
  password: '',
  password_confirmation: '',
});

const updateProfile = () => {
  profileForm.patch(route('user-profile-information.update'));
};

const updatePassword = () => {
  passwordForm.put(route('user-password.update'), {
    onSuccess: () => passwordForm.reset(),
  });
};

const deleteAccount = () => {
  if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
    // Handle account deletion
  }
};
</script>

<template>
  <DashboardLayout :auth="auth">
    <div class="mx-auto max-w-4xl">
      <div class="mb-8">
        <h1 class="font-bold text-slate-900 text-3xl">Settings</h1>
        <p class="mt-1 text-slate-600">Manage your account settings and preferences</p>
      </div>

      <div class="space-y-6">
        <!-- Profile Settings -->
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your account profile information</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="space-y-2">
              <Label for="name">Name</Label>
              <Input id="name" v-model="profileForm.name" />
              <div v-if="profileForm.errors.name" class="text-red-600 text-sm">{{ profileForm.errors.name }}</div>
            </div>
            <div class="space-y-2">
              <Label for="email">Email</Label>
              <Input id="email" v-model="profileForm.email" type="email" />
              <div v-if="profileForm.errors.email" class="text-red-600 text-sm">{{ profileForm.errors.email }}</div>
            </div>
            <Button @click="updateProfile" :disabled="profileForm.processing">
              Save Changes
            </Button>
          </CardContent>
        </Card>

        <!-- Password -->
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your password to keep your account secure</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="space-y-2">
              <Label for="current_password">Current Password</Label>
              <Input 
                id="current_password" 
                v-model="passwordForm.current_password" 
                type="password"
                autocomplete="current-password"
              />
              <div v-if="passwordForm.errors.current_password" class="text-red-600 text-sm">
                {{ passwordForm.errors.current_password }}
              </div>
            </div>
            <div class="space-y-2">
              <Label for="password">New Password</Label>
              <Input 
                id="password" 
                v-model="passwordForm.password" 
                type="password"
                autocomplete="new-password"
              />
              <div v-if="passwordForm.errors.password" class="text-red-600 text-sm">
                {{ passwordForm.errors.password }}
              </div>
            </div>
            <div class="space-y-2">
              <Label for="password_confirmation">Confirm New Password</Label>
              <Input 
                id="password_confirmation" 
                v-model="passwordForm.password_confirmation" 
                type="password"
                autocomplete="new-password"
              />
            </div>
            <Button @click="updatePassword" :disabled="passwordForm.processing">
              Update Password
            </Button>
          </CardContent>
        </Card>

        <!-- Notifications -->
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Manage how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent class="space-y-6">
            <div class="flex justify-between items-center">
              <div class="space-y-0.5">
                <Label>Email Notifications</Label>
                <p class="text-slate-500 text-sm">Receive email notifications about your account</p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div class="flex justify-between items-center">
              <div class="space-y-0.5">
                <Label>Project Updates</Label>
                <p class="text-slate-500 text-sm">Get notified about changes to your projects</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <!-- Danger Zone -->
        <Card class="border-red-200">
          <CardHeader>
            <CardTitle class="text-red-600">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions for your account</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="flex justify-between items-center">
              <div>
                <p class="font-medium text-slate-900">Delete Account</p>
                <p class="text-slate-500 text-sm">Permanently delete your account and all data</p>
              </div>
              <Button variant="destructive" @click="deleteAccount">
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </DashboardLayout>
</template>
