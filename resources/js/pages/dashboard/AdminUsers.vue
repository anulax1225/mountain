<script setup>
import { ref, onMounted, computed } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { useConfirm, useDateTime } from '@/composables'
import { UserPlus, Shield, Trash2, Edit, RefreshCw, Clock, CheckCircle } from 'lucide-vue-next'
import axios from 'axios'

defineProps({
  auth: Object,
})

const { confirmDelete } = useConfirm()
const { formatSmartDate } = useDateTime('fr-FR')

const users = ref([])
const roles = ref([])
const loading = ref(true)
const createSheetOpen = ref(false)
const editSheetOpen = ref(false)
const editingUser = ref(null)
const submitting = ref(false)

const form = ref({
  email: '',
  name: '',
  role_id: '',
})

const editForm = ref({
  role_id: '',
})

const loadUsers = async () => {
  try {
    loading.value = true
    const response = await axios.get('/admin/users')
    users.value = response.data.data || []
  } catch (error) {
    console.error('Failed to load users:', error)
  } finally {
    loading.value = false
  }
}

const loadRoles = async () => {
  try {
    const response = await axios.get('/admin/roles')
    roles.value = response.data.data || []
  } catch (error) {
    console.error('Failed to load roles:', error)
  }
}

const createUser = async () => {
  if (submitting.value) return

  try {
    submitting.value = true
    await axios.post('/admin/users', {
      email: form.value.email,
      name: form.value.name || undefined,
      role_id: parseInt(form.value.role_id),
    })
    createSheetOpen.value = false
    form.value = { email: '', name: '', role_id: '' }
    await loadUsers()
  } catch (error) {
    console.error('Failed to create user:', error)
  } finally {
    submitting.value = false
  }
}

const openEditSheet = (user) => {
  editingUser.value = user
  const globalRole = user.roles.find(r => r.slug === 'admin' || r.slug === 'client')
  editForm.value.role_id = globalRole ? String(globalRole.id) : ''
  editSheetOpen.value = true
}

const updateUserRole = async () => {
  if (!editingUser.value || submitting.value) return

  try {
    submitting.value = true
    await axios.put(`/admin/users/${editingUser.value.id}/role`, {
      role_id: parseInt(editForm.value.role_id),
    })
    editSheetOpen.value = false
    editingUser.value = null
    await loadUsers()
  } catch (error) {
    console.error('Failed to update user role:', error)
  } finally {
    submitting.value = false
  }
}

const deleteUser = async (user) => {
  const confirmed = await confirmDelete(user.name || user.email)
  if (!confirmed) return

  try {
    await axios.delete(`/admin/users/${user.id}`)
    await loadUsers()
  } catch (error) {
    console.error('Failed to delete user:', error)
  }
}

const resendingInvitation = ref(null)

const resendInvitation = async (user) => {
  if (resendingInvitation.value) return

  try {
    resendingInvitation.value = user.id
    await axios.post(`/admin/users/${user.id}/resend-invitation`)
    await loadUsers()
  } catch (error) {
    console.error('Failed to resend invitation:', error)
  } finally {
    resendingInvitation.value = null
  }
}

const getRoleBadgeVariant = (role) => {
  if (role.slug === 'admin') return 'default'
  if (role.slug === 'client') return 'secondary'
  return 'outline'
}

const getUserGlobalRole = (user) => {
  return user.roles.find(r => r.slug === 'admin' || r.slug === 'client')
}

onMounted(() => {
  loadUsers()
  loadRoles()
})
</script>

<template>
  <DashboardLayout :auth="auth">
    <div class="mx-auto max-w-7xl">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="font-bold text-zinc-900 dark:text-zinc-100 text-3xl">Administration</h1>
          <p class="mt-1 text-zinc-600 dark:text-zinc-400">Gérez les utilisateurs et leurs rôles</p>
        </div>
        <Button @click="createSheetOpen = true">
          <UserPlus class="w-4 h-4 mr-2" />
          Nouvel utilisateur
        </Button>
      </div>

      <LoadingSpinner v-if="loading" />

      <div v-else class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
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
                <span v-else class="text-zinc-500">Aucun rôle</span>
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
              <TableCell colspan="6" class="text-center text-zinc-500 py-8">
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
                v-model="form.email"
                type="email"
                placeholder="utilisateur@exemple.com"
                required
              />
            </div>
            <div class="space-y-2">
              <Label for="name">Nom (optionnel)</Label>
              <Input
                id="name"
                v-model="form.name"
                placeholder="Nom de l'utilisateur"
              />
            </div>
            <div class="space-y-2">
              <Label for="role">Rôle</Label>
              <Select v-model="form.role_id">
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
            <Button type="submit" class="w-full" :disabled="submitting || !form.role_id">
              {{ submitting ? 'Création...' : 'Créer l\'utilisateur' }}
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
            <Button type="submit" class="w-full" :disabled="submitting || !editForm.role_id">
              {{ submitting ? 'Enregistrement...' : 'Enregistrer' }}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  </DashboardLayout>
</template>
