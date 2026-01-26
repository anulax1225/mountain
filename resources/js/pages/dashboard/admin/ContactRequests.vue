<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Search, Mail, Phone, Building2, Calendar, Trash2, Eye } from 'lucide-vue-next'
import { useToast } from '@/components/ui/toast/use-toast'
import { useDateTime } from '@/composables'
import owl from '@/owl-sdk.js'

defineProps({
    auth: Object,
})

const { toast } = useToast()
const { formatSmartDate } = useDateTime('fr-FR')

const contactRequests = ref([])
const isLoading = ref(true)
const searchQuery = ref('')
const statusFilter = ref('all')
const selectedRequest = ref(null)
const viewDialogOpen = ref(false)
const updateDialogOpen = ref(false)
const isUpdating = ref(false)

const updateForm = ref({
    status: '',
    admin_notes: '',
})

// Status configuration with custom badge classes
const statusConfig = {
    received: {
        label: 'Reçu',
        badgeClass: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
    },
    in_process: {
        label: 'En cours',
        badgeClass: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800'
    },
    refused: {
        label: 'Refusé',
        badgeClass: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
    },
    validated: {
        label: 'Validé',
        badgeClass: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
    },
}

// Filtered requests
const filteredRequests = computed(() => {
    let filtered = contactRequests.value

    // Filter by status
    if (statusFilter.value !== 'all') {
        filtered = filtered.filter(req => req.status === statusFilter.value)
    }

    // Filter by search query
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(req =>
            req.name.toLowerCase().includes(query) ||
            req.email.toLowerCase().includes(query) ||
            (req.company && req.company.toLowerCase().includes(query))
        )
    }

    return filtered
})

// Stats
const stats = computed(() => {
    return {
        total: contactRequests.value.length,
        received: contactRequests.value.filter(r => r.status === 'received').length,
        in_process: contactRequests.value.filter(r => r.status === 'in_process').length,
        refused: contactRequests.value.filter(r => r.status === 'refused').length,
        validated: contactRequests.value.filter(r => r.status === 'validated').length,
    }
})

const loadContactRequests = async () => {
    try {
        isLoading.value = true
        const response = await owl.contactRequests.list()
        contactRequests.value = response.data
    } catch (error) {
        console.error('Failed to load contact requests:', error)
        toast({
            title: 'Erreur',
            description: 'Impossible de charger les demandes de contact.',
            variant: 'destructive',
        })
    } finally {
        isLoading.value = false
    }
}

// Watch for dialog close to cleanup state after animation
watch(viewDialogOpen, (isOpen) => {
    if (!isOpen) {
        // Delay cleanup until after dialog close animation
        setTimeout(() => {
            if (!viewDialogOpen.value) {
                selectedRequest.value = null
            }
        }, 150)
    }
})

watch(updateDialogOpen, (isOpen) => {
    if (!isOpen) {
        // Delay cleanup until after dialog close animation
        setTimeout(() => {
            if (!updateDialogOpen.value) {
                selectedRequest.value = null
                updateForm.value = { status: '', admin_notes: '' }
                isUpdating.value = false
            }
        }, 150)
    }
})

const viewRequest = (request) => {
    selectedRequest.value = request
    viewDialogOpen.value = true
}

const openUpdateDialog = (request) => {
    selectedRequest.value = request
    updateForm.value = {
        status: request.status,
        admin_notes: request.admin_notes || '',
    }
    updateDialogOpen.value = true
}

const updateRequest = async () => {
    if (!selectedRequest.value || isUpdating.value) return

    const requestSlug = selectedRequest.value.slug
    isUpdating.value = true

    try {
        const response = await owl.contactRequests.update(
            requestSlug,
            updateForm.value
        )

        // Update the request in the list
        const index = contactRequests.value.findIndex(r => r.slug === requestSlug)
        if (index !== -1) {
            contactRequests.value[index] = response.data
        }

        // Close dialog first, then show toast
        updateDialogOpen.value = false

        await nextTick()

        toast({
            title: 'Mis à jour',
            description: 'Le statut de la demande a été mis à jour avec succès.',
        })
    } catch (error) {
        console.error('Failed to update request:', error)
        toast({
            title: 'Erreur',
            description: 'Impossible de mettre à jour la demande.',
            variant: 'destructive',
        })
        isUpdating.value = false
    }
}

const deleteRequest = async (request) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la demande de ${request.name} ?`)) {
        return
    }

    try {
        await owl.contactRequests.delete(request.slug)
        contactRequests.value = contactRequests.value.filter(r => r.slug !== request.slug)

        toast({
            title: 'Supprimé',
            description: 'La demande a été supprimée avec succès.',
        })
    } catch (error) {
        console.error('Failed to delete request:', error)
        toast({
            title: 'Erreur',
            description: 'Impossible de supprimer la demande.',
            variant: 'destructive',
        })
    }
}

onMounted(() => {
    loadContactRequests()
})
</script>

<template>
    <DashboardLayout :auth="auth">
        <div class="space-y-6">
            <!-- Header -->
            <div>
                <h1 class="font-bold text-3xl text-zinc-900 dark:text-white">
                    Demandes de contact
                </h1>
                <p class="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    Gérez les demandes de contact reçues via le formulaire du site.
                </p>
            </div>

            <!-- Stats -->
            <div class="gap-4 grid grid-cols-1 md:grid-cols-5">
                <div class="bg-white dark:bg-zinc-900 shadow-sm p-6 rounded-lg border border-zinc-200 dark:border-zinc-800">
                    <p class="text-sm text-zinc-600 dark:text-zinc-400">Total</p>
                    <p class="mt-2 font-bold text-3xl text-zinc-900 dark:text-white">
                        {{ stats.total }}
                    </p>
                </div>
                <div class="bg-white dark:bg-zinc-900 shadow-sm p-6 rounded-lg border border-zinc-200 dark:border-zinc-800">
                    <p class="text-sm text-zinc-600 dark:text-zinc-400">Reçu</p>
                    <p class="mt-2 font-bold text-3xl text-blue-600 dark:text-blue-400">
                        {{ stats.received }}
                    </p>
                </div>
                <div class="bg-white dark:bg-zinc-900 shadow-sm p-6 rounded-lg border border-zinc-200 dark:border-zinc-800">
                    <p class="text-sm text-zinc-600 dark:text-zinc-400">En cours</p>
                    <p class="mt-2 font-bold text-3xl text-yellow-600 dark:text-yellow-400">
                        {{ stats.in_process }}
                    </p>
                </div>
                <div class="bg-white dark:bg-zinc-900 shadow-sm p-6 rounded-lg border border-zinc-200 dark:border-zinc-800">
                    <p class="text-sm text-zinc-600 dark:text-zinc-400">Refusé</p>
                    <p class="mt-2 font-bold text-3xl text-red-600 dark:text-red-400">
                        {{ stats.refused }}
                    </p>
                </div>
                <div class="bg-white dark:bg-zinc-900 shadow-sm p-6 rounded-lg border border-zinc-200 dark:border-zinc-800">
                    <p class="text-sm text-zinc-600 dark:text-zinc-400">Validé</p>
                    <p class="mt-2 font-bold text-3xl text-green-600 dark:text-green-400">
                        {{ stats.validated }}
                    </p>
                </div>
            </div>

            <!-- Filters -->
            <div class="flex flex-col gap-4 md:flex-row">
                <div class="relative flex-1">
                    <Search class="top-3 left-3 absolute w-4 h-4 text-zinc-400" />
                    <Input
                        v-model="searchQuery"
                        placeholder="Rechercher par nom, email ou entreprise..."
                        class="pl-9"
                    />
                </div>
                <Select v-model="statusFilter">
                    <SelectTrigger class="w-full md:w-48">
                        <SelectValue placeholder="Tous les statuts" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous les statuts</SelectItem>
                        <SelectItem value="received">Reçu</SelectItem>
                        <SelectItem value="in_process">En cours</SelectItem>
                        <SelectItem value="refused">Refusé</SelectItem>
                        <SelectItem value="validated">Validé</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <!-- Contact Requests List -->
            <div class="bg-white dark:bg-zinc-900 shadow-sm rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div v-if="isLoading" class="p-12 text-center">
                    <p class="text-zinc-600 dark:text-zinc-400">Chargement...</p>
                </div>

                <div v-else-if="filteredRequests.length === 0" class="p-12 text-center">
                    <p class="text-zinc-600 dark:text-zinc-400">Aucune demande de contact trouvée.</p>
                </div>

                <div v-else class="divide-y divide-zinc-200 dark:divide-zinc-800">
                    <div
                        v-for="request in filteredRequests"
                        :key="request.slug"
                        class="hover:bg-zinc-50 dark:hover:bg-zinc-800 p-6 transition-colors"
                    >
                        <div class="flex items-start justify-between gap-4">
                            <div class="flex-1 space-y-3">
                                <div class="flex items-center gap-3">
                                    <h3 class="font-semibold text-lg text-zinc-900 dark:text-white">
                                        {{ request.name }}
                                    </h3>
                                    <Badge :class="statusConfig[request.status].badgeClass">
                                        {{ statusConfig[request.status].label }}
                                    </Badge>
                                </div>

                                <div class="gap-x-6 gap-y-2 grid grid-cols-1 md:grid-cols-2">
                                    <div class="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                                        <Mail class="w-4 h-4" />
                                        <a :href="`mailto:${request.email}`" class="hover:text-zinc-900 dark:hover:text-white">
                                            {{ request.email }}
                                        </a>
                                    </div>

                                    <div v-if="request.phone" class="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                                        <Phone class="w-4 h-4" />
                                        <a :href="`tel:${request.phone}`" class="hover:text-zinc-900 dark:hover:text-white">
                                            {{ request.phone }}
                                        </a>
                                    </div>

                                    <div v-if="request.company" class="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                                        <Building2 class="w-4 h-4" />
                                        {{ request.company }}
                                    </div>

                                    <div class="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                                        <Calendar class="w-4 h-4" />
                                        {{ formatSmartDate(request.created_at) }}
                                    </div>
                                </div>

                                <p class="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                                    {{ request.message }}
                                </p>
                            </div>

                            <div class="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    @click="viewRequest(request)"
                                >
                                    <Eye class="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="default"
                                    size="sm"
                                    @click="openUpdateDialog(request)"
                                >
                                    Gérer
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    @click="deleteRequest(request)"
                                >
                                    <Trash2 class="w-4 h-4 text-red-600" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- View Dialog -->
        <Dialog v-model:open="viewDialogOpen">
            <DialogContent class="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Détails de la demande</DialogTitle>
                </DialogHeader>

                <div v-if="selectedRequest" class="space-y-4">
                    <div class="gap-4 grid grid-cols-2">
                        <div>
                            <Label>Nom</Label>
                            <p class="mt-1 text-sm">{{ selectedRequest.name }}</p>
                        </div>
                        <div>
                            <Label>Statut</Label>
                            <div class="mt-1">
                                <Badge :class="statusConfig[selectedRequest.status].badgeClass">
                                    {{ statusConfig[selectedRequest.status].label }}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div>
                        <Label>Email</Label>
                        <p class="mt-1 text-sm">
                            <a :href="`mailto:${selectedRequest.email}`" class="text-blue-600 hover:underline dark:text-blue-400">
                                {{ selectedRequest.email }}
                            </a>
                        </p>
                    </div>

                    <div v-if="selectedRequest.phone">
                        <Label>Téléphone</Label>
                        <p class="mt-1 text-sm">
                            <a :href="`tel:${selectedRequest.phone}`" class="text-blue-600 hover:underline dark:text-blue-400">
                                {{ selectedRequest.phone }}
                            </a>
                        </p>
                    </div>

                    <div v-if="selectedRequest.company">
                        <Label>Entreprise</Label>
                        <p class="mt-1 text-sm">{{ selectedRequest.company }}</p>
                    </div>

                    <div>
                        <Label>Message</Label>
                        <p class="bg-zinc-50 dark:bg-zinc-800 mt-1 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm whitespace-pre-wrap">
                            {{ selectedRequest.message }}
                        </p>
                    </div>

                    <div v-if="selectedRequest.admin_notes">
                        <Label>Notes administrateur</Label>
                        <p class="bg-zinc-50 dark:bg-zinc-800 mt-1 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm whitespace-pre-wrap">
                            {{ selectedRequest.admin_notes }}
                        </p>
                    </div>

                    <div>
                        <Label>Date de réception</Label>
                        <p class="mt-1 text-sm">{{ formatSmartDate(selectedRequest.created_at) }}</p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" @click="viewDialogOpen = false">
                        Fermer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <!-- Update Dialog -->
        <Dialog v-model:open="updateDialogOpen">
            <DialogContent class="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Gérer la demande</DialogTitle>
                    <DialogDescription>
                        Mettez à jour le statut et ajoutez des notes pour cette demande.
                    </DialogDescription>
                </DialogHeader>

                <form v-if="selectedRequest" @submit.prevent="updateRequest" class="space-y-4">
                    <div class="space-y-2">
                        <Label for="status">Statut</Label>
                        <Select v-model="updateForm.status">
                            <SelectTrigger id="status">
                                <SelectValue placeholder="Sélectionner un statut" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="received">
                                    <span class="flex items-center gap-2">
                                        <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                                        Reçu
                                    </span>
                                </SelectItem>
                                <SelectItem value="in_process">
                                    <span class="flex items-center gap-2">
                                        <span class="w-2 h-2 rounded-full bg-yellow-500"></span>
                                        En cours
                                    </span>
                                </SelectItem>
                                <SelectItem value="refused">
                                    <span class="flex items-center gap-2">
                                        <span class="w-2 h-2 rounded-full bg-red-500"></span>
                                        Refusé
                                    </span>
                                </SelectItem>
                                <SelectItem value="validated">
                                    <span class="flex items-center gap-2">
                                        <span class="w-2 h-2 rounded-full bg-green-500"></span>
                                        Validé
                                    </span>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div class="space-y-2">
                        <Label for="admin_notes">Notes administrateur</Label>
                        <Textarea
                            id="admin_notes"
                            v-model="updateForm.admin_notes"
                            placeholder="Ajoutez des notes internes sur cette demande..."
                            rows="4"
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" @click="updateDialogOpen = false" :disabled="isUpdating">
                            Annuler
                        </Button>
                        <Button type="submit" :disabled="isUpdating">
                            <span v-if="isUpdating">Mise à jour...</span>
                            <span v-else>Mettre à jour</span>
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    </DashboardLayout>
</template>
