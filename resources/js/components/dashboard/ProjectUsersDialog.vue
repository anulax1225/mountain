<script setup>
import { ref } from 'vue'
import { useForm, router } from '@inertiajs/vue3'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Trash2, UserPlus } from 'lucide-vue-next'
import { useConfirm } from '@/composables'

const props = defineProps({
  open: Boolean,
  project: Object,
  assignedUsers: Array,
  availableUsers: Array,
  availableRoles: Array,
})

const emit = defineEmits(['update:open'])

const { confirmDelete } = useConfirm()

const form = useForm({
  user_id: null,
  role_id: null,
})

const getRoleName = (roleId) => {
  const role = props.availableRoles?.find(r => r.id === roleId)
  return role?.name || 'Unknown'
}

const getRoleVariant = (roleId) => {
  const roleName = getRoleName(roleId)
  if (roleName === 'Owner') return 'default'
  if (roleName === 'Viewer') return 'secondary'
  return 'outline'
}

const assignUser = () => {
  if (!form.user_id || !form.role_id) return

  form.post(`/dashboard/projects/${props.project.slug}/users`, {
    preserveScroll: true,
    onSuccess: () => {
      form.reset()
    },
  })
}

const removeUser = async (userId) => {
  const user = props.assignedUsers?.find(u => u.id === userId)
  const confirmed = await confirmDelete(user?.name || user?.email || 'cet utilisateur')
  if (!confirmed) return

  router.delete(`/dashboard/projects/${props.project.slug}/users/${userId}`, {
    preserveScroll: true,
  })
}
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
        <div class="border rounded-lg p-4 space-y-3 bg-muted/50">
          <h3 class="font-medium flex items-center gap-2">
            <UserPlus class="w-4 h-4" />
            Ajouter un utilisateur
          </h3>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-2">
              <Label>Utilisateur</Label>
              <select
                v-model="form.user_id"
                class="w-full px-3 py-2 border rounded-md bg-card border-border"
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
                v-model="form.role_id"
                class="w-full px-3 py-2 border rounded-md bg-card border-border"
              >
                <option :value="null">-- Sélectionner --</option>
                <option v-for="role in availableRoles" :key="role.id" :value="role.id">
                  {{ role.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="text-xs text-muted-foreground space-y-1">
            <p><strong>Owner:</strong> Peut modifier le projet et gérer les collaborateurs</p>
            <p><strong>Viewer:</strong> Lecture seule</p>
          </div>

          <Button
            @click="assignUser"
            :disabled="!form.user_id || !form.role_id || form.processing"
            class="w-full"
          >
            {{ form.processing ? 'Ajout...' : 'Ajouter' }}
          </Button>
        </div>

        <!-- Assigned Users List -->
        <div class="space-y-3">
          <h3 class="font-medium">Utilisateurs assignés ({{ assignedUsers?.length || 0 }})</h3>

          <div v-if="!assignedUsers || assignedUsers.length === 0" class="text-center py-8 text-muted-foreground">
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
                <div class="text-sm text-muted-foreground">{{ user.email }}</div>
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
