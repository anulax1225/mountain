<script setup lang="ts">
import { ref } from 'vue';
import { useForm } from '@inertiajs/vue3';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserPlus, X } from 'lucide-vue-next';

interface Role {
  id: number;
  name: string;
  slug: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  pivot?: {
    role_id: number;
  };
  roles: Role[];
}

interface Props {
  projectSlug: string;
  assignedUsers: User[];
  availableUsers: User[];
  roles: Role[];
}

const props = defineProps<Props>();

const showAddForm = ref(false);

const addForm = useForm({
  user_id: '',
  role_id: '',
});

const removeForm = useForm({
  user_id: null as number | null,
});

function addUser() {
  addForm.post(`/projects/${props.projectSlug}/users`, {
    onSuccess: () => {
      addForm.reset();
      showAddForm.value = false;
    },
  });
}

function removeUser(userId: number) {
  removeForm.user_id = userId;
  removeForm.delete(`/projects/${props.projectSlug}/users`);
}

function getRoleName(roleId: number): string {
  const role = props.roles.find(r => r.id === roleId);
  return role?.name || 'Inconnu';
}

function getRoleBadgeVariant(roleId: number): 'default' | 'secondary' | 'outline' {
  const role = props.roles.find(r => r.id === roleId);
  if (!role) return 'outline';
  
  switch (role.slug) {
    case 'admin':
      return 'default';
    case 'client':
      return 'secondary';
    default:
      return 'outline';
  }
}
</script>

<template>
  <Card>
    <CardHeader>
      <div class="flex items-center justify-between">
        <div>
          <CardTitle>Utilisateurs assignés</CardTitle>
          <CardDescription>
            Gérez l'accès des utilisateurs à ce projet
          </CardDescription>
        </div>
        <Button
          v-if="!showAddForm"
          type="button"
          size="sm"
          @click="showAddForm = true"
        >
          <UserPlus class="h-4 w-4 mr-2" />
          Ajouter
        </Button>
      </div>
    </CardHeader>

    <CardContent class="space-y-6">
      <form v-if="showAddForm" @submit.prevent="addUser" class="space-y-4 p-4 bg-muted rounded-lg">
        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-2">
            <Label for="user">Utilisateur</Label>
            <Select v-model="addForm.user_id" required>
              <SelectTrigger id="user">
                <SelectValue placeholder="Sélectionnez un utilisateur" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="user in availableUsers"
                  :key="user.id"
                  :value="String(user.id)"
                >
                  {{ user.name }} ({{ user.email }})
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label for="role">Rôle</Label>
            <Select v-model="addForm.role_id" required>
              <SelectTrigger id="role">
                <SelectValue placeholder="Sélectionnez un rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="role in roles"
                  :key="role.id"
                  :value="String(role.id)"
                >
                  {{ role.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div class="flex gap-2">
          <Button type="submit" size="sm" :disabled="addForm.processing">
            Ajouter
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            @click="showAddForm = false"
          >
            Annuler
          </Button>
        </div>
      </form>

      <div v-if="assignedUsers.length === 0" class="text-center py-8 text-muted-foreground">
        Aucun utilisateur assigné
      </div>

      <Table v-else>
        <TableHeader>
          <TableRow>
            <TableHead>Utilisateur</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rôle</TableHead>
            <TableHead class="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="user in assignedUsers" :key="user.id">
            <TableCell class="font-medium">{{ user.name }}</TableCell>
            <TableCell>{{ user.email }}</TableCell>
            <TableCell>
              <Badge
                v-if="user.pivot"
                :variant="getRoleBadgeVariant(user.pivot.role_id)"
              >
                {{ getRoleName(user.pivot.role_id) }}
              </Badge>
            </TableCell>
            <TableCell>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                @click="removeUser(user.id)"
                :disabled="removeForm.processing"
              >
                <X class="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>
</template>
