<script setup>
import { ref, watch } from 'vue'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Trash2, UserPlus } from 'lucide-vue-next'
import axios from 'axios'

const props = defineProps({
  open: Boolean,
  project: Object
})

const emit = defineEmits(['update:open'])

const assignedUsers = ref([])
const availableUsers = ref([])
const availableRoles = ref([])
const loading = ref(false)
const selectedUserId = ref(null)
const selectedRoleId = ref(null)
const adding = ref(false)

const loadAssignedUsers = async () => {
  if (!props.project?.slug) return

  try {
    loading.value = true
    const response = await axios.get(`/projects/${props.project.slug}/users`)
    assignedUsers.value = response.data || []
  } catch (error) {
    console.error('Failed to load assigned users:', error)
  } finally {
    loading.value = false
  }
}

const loadAvailableData = async () => {
  try {
    const [usersRes, rolesRes] = await Promise.all([
      axios.get('/available-users'),
      axios.get('/available-roles')
    ])
    availableUsers.value = usersRes.data || []
    availableRoles.value = rolesRes.data || []
  } catch (error) {
    console.error('Failed to load available data:', error)
  }
}

const getRoleName = (roleId) => {
  const role = availableRoles.value.find(r => r.id === roleId)
  return role?.name || 'Unknown'
}

const getRoleVariant = (roleId) => {
  const roleName = getRoleName(roleId)
  if (roleName === 'Owner') return 'default'
  if (roleName === 'Viewer') return 'secondary'
  return 'outline'
}

const assignUser = async () => {
  if (!selectedUserId.value || !selectedRoleId.value) return

  try {
    adding.value = true
    await axios.post(`/projects/${props.project.slug}/users`, {
      user_id: selectedUserId.value,
      role_id: selectedRoleId.value
    })
    selectedUserId.value = null
    selectedRoleId.value = null
    await loadAssignedUsers()
  } catch (error) {
    console.error('Failed to assign user:', error)
    alert('Erreur lors de l\'assignation de l\'utilisateur')
  } finally {
    adding.value = false
  }
}

const removeUser = async (userId) => {
  if (!confirm('Êtes-vous sûr de vouloir retirer cet utilisateur du projet?')) return

  try {
    await axios.delete(`/projects/${props.project.slug}/users/${userId}`)
    await loadAssignedUsers()
  } catch (error) {
    console.error('Failed to remove user:', error)
    alert('Erreur lors de la suppression de l\'utilisateur')
  }
}

watch(() => props.open, (newValue) => {
  if (newValue) {
    loadAssignedUsers()
    loadAvailableData()
  }
})
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Gestion des utilisateurs</DialogTitle>
        <DialogDescription>
          Assignez des utilisateurs à ce projet avec des rôles spécifiques
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-6 mt-4">
        <!-- Add User Form -->
        <div class="border rounded-lg p-4 space-y-3 bg-zinc-50 dark:bg-zinc-900/50">
          <h3 class="font-medium flex items-center gap-2">
            <UserPlus class="w-4 h-4" />
            Ajouter un utilisateur
          </h3>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-2">
              <Label>Utilisateur</Label>
              <select
                v-model="selectedUserId"
                class="w-full px-3 py-2 border rounded-md bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
              >
                <option :value="null">-- Sélectionner --</option>
                <option v-for="user in availableUsers" :key="user.id" :value="user.id">
                  {{ user.name }} ({{ user.email }})
                </option>
              </select>
            </div>

            <div class="space-y-2">
              <Label>Rôle</Label>
              <select
                v-model="selectedRoleId"
                class="w-full px-3 py-2 border rounded-md bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
              >
                <option :value="null">-- Sélectionner --</option>
                <option v-for="role in availableRoles" :key="role.id" :value="role.id">
                  {{ role.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
            <p><strong>Owner:</strong> Peut modifier le projet et gérer les collaborateurs</p>
            <p><strong>Viewer:</strong> Lecture seule</p>
          </div>

          <Button
            @click="assignUser"
            :disabled="!selectedUserId || !selectedRoleId || adding"
            class="w-full"
          >
            {{ adding ? 'Ajout...' : 'Ajouter' }}
          </Button>
        </div>

        <!-- Assigned Users List -->
        <div class="space-y-3">
          <h3 class="font-medium">Utilisateurs assignés ({{ assignedUsers.length }})</h3>

          <div v-if="loading" class="text-center py-4 text-zinc-500">
            Chargement...
          </div>

          <div v-else-if="assignedUsers.length === 0" class="text-center py-8 text-zinc-500">
            Aucun utilisateur assigné à ce projet
          </div>

          <div v-else class="space-y-2">
            <div
              v-for="user in assignedUsers"
              :key="user.id"
              class="flex items-center justify-between p-3 border rounded-lg"
            >
              <div class="flex-1">
                <div class="font-medium">{{ user.name }}</div>
                <div class="text-sm text-zinc-500">{{ user.email }}</div>
              </div>

              <div class="flex items-center gap-2">
                <Badge :variant="getRoleVariant(user.role_id)">
                  {{ getRoleName(user.role_id) }}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  @click="removeUser(user.id)"
                >
                  <Trash2 class="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end">
          <Button variant="outline" @click="emit('update:open', false)">
            Fermer
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
