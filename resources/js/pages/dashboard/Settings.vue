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
  if (confirm('Êtes-vous sûr de vouloir supprimer votre compte? Cette action est irréversible.')) {
    // Handle account deletion
  }
};
</script>

<template>
  <DashboardLayout :auth="auth">
    <div class="mx-auto max-w-4xl">
      <div class="mb-8">
        <h1 class="font-bold text-slate-900 text-3xl">Paramètres</h1>
        <p class="mt-1 text-slate-600">Gérez les paramètres de votre compte et vos préférences</p>
      </div>

      <div class="space-y-6">
        <!-- Profile Settings -->
        <Card>
          <CardHeader>
            <CardTitle>Informations de profil</CardTitle>
            <CardDescription>Mettez à jour les informations de votre compte</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="space-y-2">
              <Label for="name">Nom</Label>
              <Input id="name" v-model="profileForm.name" />
              <div v-if="profileForm.errors.name" class="text-red-600 text-sm">{{ profileForm.errors.name }}</div>
            </div>
            <div class="space-y-2">
              <Label for="email">Email</Label>
              <Input id="email" v-model="profileForm.email" type="email" />
              <div v-if="profileForm.errors.email" class="text-red-600 text-sm">{{ profileForm.errors.email }}</div>
            </div>
            <Button @click="updateProfile" :disabled="profileForm.processing">
              Enregistrer les modifications
            </Button>
          </CardContent>
        </Card>

        <!-- Password -->
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
                v-model="passwordForm.current_password" 
                type="password"
                autocomplete="current-password"
              />
              <div v-if="passwordForm.errors.current_password" class="text-red-600 text-sm">
                {{ passwordForm.errors.current_password }}
              </div>
            </div>
            <div class="space-y-2">
              <Label for="password">Nouveau mot de passe</Label>
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
              <Label for="password_confirmation">Confirmer le nouveau mot de passe</Label>
              <Input 
                id="password_confirmation" 
                v-model="passwordForm.password_confirmation" 
                type="password"
                autocomplete="new-password"
              />
            </div>
            <Button @click="updatePassword" :disabled="passwordForm.processing">
              Mettre à jour le mot de passe
            </Button>
          </CardContent>
        </Card>

        <!-- Notifications -->
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Gérez comment vous recevez les notifications</CardDescription>
          </CardHeader>
          <CardContent class="space-y-6">
            <div class="flex justify-between items-center">
              <div class="space-y-0.5">
                <Label>Notifications par email</Label>
                <p class="text-slate-500 text-sm">Recevez des notifications par email concernant votre compte</p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div class="flex justify-between items-center">
              <div class="space-y-0.5">
                <Label>Mises à jour de projets</Label>
                <p class="text-slate-500 text-sm">Soyez notifié des modifications de vos projets</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <!-- Danger Zone -->
        <Card class="border-red-200">
          <CardHeader>
            <CardTitle class="text-red-600">Zone de danger</CardTitle>
            <CardDescription>Actions irréversibles pour votre compte</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="flex justify-between items-center">
              <div>
                <p class="font-medium text-slate-900">Supprimer le compte</p>
                <p class="text-slate-500 text-sm">Supprimer définitivement votre compte et toutes vos données</p>
              </div>
              <Button variant="destructive" @click="deleteAccount">
                Supprimer le compte
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </DashboardLayout>
</template>