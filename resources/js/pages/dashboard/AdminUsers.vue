<script setup>
import { ref } from 'vue'
import { useForm, router } from '@inertiajs/vue3'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useConfirm, useDateTime } from '@/composables'
import { UserPlus, Shield, Trash2, Edit, RefreshCw, Clock, CheckCircle } from 'lucide-vue-next'

const props = defineProps({
  auth: Object,
  users: Array,
  roles: Array,
})

const { confirmDelete } = useConfirm()
const { formatSmartDate } = useDateTime('fr-FR')

const createSheetOpen = ref(false)
const editSheetOpen = ref(false)
const editingUser = ref(null)

const createForm = useForm({
  email: '',
  name: '',
  role_id: '',
})

const editForm = useForm({
  role_id: '',
})

const createUser = () => {
  createForm.post('/dashboard/admin/users', {
    onSuccess: () => {
      createSheetOpen.value = false
      createForm.reset()
    },
  })
}

const openEditSheet = (user) => {
  editingUser.value = user
  const globalRole = user.roles.find(r => r.slug === 'admin' || r.slug === 'client')
  editForm.role_id = globalRole ? String(globalRole.id) : ''
  editSheetOpen.value = true
}

const updateUserRole = () => {
  if (!editingUser.value) return

  editForm.put(`/dashboard/admin/users/${editingUser.value.id}/role`, {
    onSuccess: () => {
      editSheetOpen.value = false
      editingUser.value = null
    },
  })
}

const deleteUser = async (user) => {
  const confirmed = await confirmDelete(user.name || user.email)
  if (!confirmed) return

  router.delete(`/dashboard/admin/users/${user.id}`)
}

const resendingInvitation = ref(null)

const resendInvitation = (user) => {
  if (resendingInvitation.value) return

  resendingInvitation.value = user.id
  router.post(`/dashboard/admin/users/${user.id}/resend-invitation`, {}, {
    preserveScroll: true,
    onFinish: () => {
      resendingInvitation.value = null
    },
  })
}

const getRoleBadgeVariant = (role) => {
  if (role.slug === 'admin') return 'default'
  if (role.slug === 'client') return 'secondary'
  return 'outline'
}

const getUserGlobalRole = (user) => {
  return user.roles.find(r => r.slug === 'admin' || r.slug === 'client')
}
</script>

<template>
  <DashboardLayout :auth="auth">
    <div class="mx-auto max-w-7xl">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="font-bold text-foreground text-3xl">Administration</h1>
          <p class="mt-1 text-muted-foreground">Gérez les utilisateurs et leurs rôles</p>
        </div>
        <Button @click="createSheetOpen = true">
          <UserPlus class="w-4 h-4 mr-2" />
          Nouvel utilisateur
        </Button>
      </div>

      <div class="bg-card border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Créé le</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="user in users" :key="user.id">
              <TableCell class="font-medium">{{ user.name }}</TableCell>
              <TableCell>{{ user.email }}</TableCell>
              <TableCell>
                <Badge
                  v-if="getUserGlobalRole(user)"
                  :variant="getRoleBadgeVariant(getUserGlobalRole(user))"
                >
                  <Shield class="w-3 h-3 mr-1" />
                  {{ getUserGlobalRole(user).name }}
                </Badge>
                <span v-else class="text-muted-foreground">Aucun rôle</span>
              </TableCell>
              <TableCell>
                <Badge v-if="user.invitation_pending" variant="outline" class="text-amber-600 border-amber-300">
                  <Clock class="w-3 h-3 mr-1" />
                  En attente
                </Badge>
                <Badge v-else variant="outline" class="text-green-600 border-green-300">
                  <CheckCircle class="w-3 h-3 mr-1" />
                  Actif
                </Badge>
              </TableCell>
              <TableCell>{{ formatSmartDate(user.created_at) }}</TableCell>
              <TableCell class="text-right">
                <div class="flex justify-end gap-2">
                  <Button
                    v-if="user.invitation_pending"
                    variant="ghost"
                    size="sm"
                    @click="resendInvitation(user)"
                    :disabled="resendingInvitation === user.id"
                    title="Renvoyer l'invitation"
                  >
                    <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': resendingInvitation === user.id }" />
                  </Button>
                  <Button variant="ghost" size="sm" @click="openEditSheet(user)">
                    <Edit class="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" @click="deleteUser(user)">
                    <Trash2 class="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
            <TableRow v-if="users.length === 0">
              <TableCell colspan="6" class="text-center text-muted-foreground py-8">
                Aucun utilisateur trouvé
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <!-- Create User Sheet -->
      <Sheet v-model:open="createSheetOpen">
        <SheetContent class="px-6">
          <SheetHeader>
            <SheetTitle>Nouvel utilisateur</SheetTitle>
            <SheetDescription>
              Créez un nouvel utilisateur. Un email d'invitation sera envoyé.
            </SheetDescription>
          </SheetHeader>
          <form @submit.prevent="createUser" class="space-y-4 mt-6">
            <div class="space-y-2">
              <Label for="email">Email</Label>
              <Input
                id="email"
                v-model="createForm.email"
                type="email"
                placeholder="utilisateur@exemple.com"
                required
              />
              <p v-if="createForm.errors.email" class="text-sm text-red-500">{{ createForm.errors.email }}</p>
            </div>
            <div class="space-y-2">
              <Label for="name">Nom (optionnel)</Label>
              <Input
                id="name"
                v-model="createForm.name"
                placeholder="Nom de l'utilisateur"
              />
            </div>
            <div class="space-y-2">
              <Label for="role">Rôle</Label>
              <Select v-model="createForm.role_id">
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="role in roles" :key="role.id" :value="String(role.id)">
                    {{ role.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <p v-if="createForm.errors.role_id" class="text-sm text-red-500">{{ createForm.errors.role_id }}</p>
            </div>
            <Button type="submit" class="w-full" :disabled="createForm.processing || !createForm.role_id">
              {{ createForm.processing ? 'Création...' : 'Créer l\'utilisateur' }}
            </Button>
          </form>
        </SheetContent>
      </Sheet>

      <!-- Edit User Role Sheet -->
      <Sheet v-model:open="editSheetOpen">
        <SheetContent class="px-6">
          <SheetHeader>
            <SheetTitle>Modifier le rôle</SheetTitle>
            <SheetDescription v-if="editingUser">
              Modifier le rôle de {{ editingUser.name || editingUser.email }}
            </SheetDescription>
          </SheetHeader>
          <form @submit.prevent="updateUserRole" class="space-y-4 mt-6">
            <div class="space-y-2">
              <Label for="edit-role">Rôle</Label>
              <Select v-model="editForm.role_id">
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="role in roles" :key="role.id" :value="String(role.id)">
                    {{ role.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" class="w-full" :disabled="editForm.processing || !editForm.role_id">
              {{ editForm.processing ? 'Enregistrement...' : 'Enregistrer' }}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  </DashboardLayout>
</template>
