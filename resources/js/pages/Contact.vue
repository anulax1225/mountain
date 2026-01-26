<script setup>
import { ref } from 'vue'
import { router } from '@inertiajs/vue3'
import LandingLayout from '@/layouts/LandingLayout.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Mail, Phone, Building2, Send, CheckCircle } from 'lucide-vue-next'
import { useToast } from '@/components/ui/toast/use-toast'

const { toast } = useToast()

const form = ref({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
})

const errors = ref({})
const isSubmitting = ref(false)
const submitted = ref(false)

const submitForm = async () => {
    if (isSubmitting.value) return

    isSubmitting.value = true
    errors.value = {}

    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(form.value),
        })

        const data = await response.json()

        if (!response.ok) {
            if (response.status === 422 && data.errors) {
                errors.value = data.errors
                toast({
                    title: 'Erreur de validation',
                    description: 'Veuillez vérifier les champs du formulaire.',
                    variant: 'destructive',
                })
            } else {
                throw new Error(data.message || 'Une erreur est survenue')
            }
        } else {
            submitted.value = true
            form.value = {
                name: '',
                email: '',
                phone: '',
                company: '',
                message: '',
            }
            toast({
                title: 'Message envoyé !',
                description: data.message,
            })
        }
    } catch (error) {
        console.error('Error submitting form:', error)
        toast({
            title: 'Erreur',
            description: 'Une erreur est survenue lors de l\'envoi du formulaire.',
            variant: 'destructive',
        })
    } finally {
        isSubmitting.value = false
    }
}
</script>

<template>
    <LandingLayout>
        <div class="bg-zinc-50 dark:bg-zinc-950 py-24">
            <div class="mx-auto px-6 max-w-7xl lg:px-8">
                <!-- Header -->
                <div class="mx-auto max-w-2xl text-center mb-16">
                    <h1 class="font-bold text-4xl text-zinc-900 dark:text-white sm:text-5xl">
                        Contactez-nous
                    </h1>
                    <p class="mt-6 text-lg text-zinc-600 dark:text-zinc-400 leading-8">
                        Une question sur nos services ? Un projet de visite virtuelle ? Notre équipe est là pour vous accompagner.
                    </p>
                </div>

                <div class="gap-x-8 gap-y-20 lg:gap-y-0 grid lg:grid-cols-2 mx-auto max-w-6xl">
                    <!-- Contact Form -->
                    <div class="bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md p-8 rounded-lg border border-zinc-200 dark:border-zinc-800 transition-shadow">
                        <h2 class="mb-6 font-semibold text-2xl text-zinc-900 dark:text-white">
                            Envoyez-nous un message
                        </h2>

                        <form @submit.prevent="submitForm" class="space-y-6">
                            <!-- Name -->
                            <div class="space-y-2">
                                <Label for="name">Nom complet *</Label>
                                <Input
                                    id="name"
                                    v-model="form.name"
                                    type="text"
                                    placeholder="Jean Dupont"
                                    required
                                    :disabled="isSubmitting"
                                    :class="errors.name ? 'border-red-500' : ''"
                                />
                                <p v-if="errors.name" class="text-red-500 text-sm">
                                    {{ errors.name[0] }}
                                </p>
                            </div>

                            <!-- Email -->
                            <div class="space-y-2">
                                <Label for="email">Email *</Label>
                                <div class="relative">
                                    <Mail class="top-3 left-3 absolute w-5 h-5 text-zinc-400" />
                                    <Input
                                        id="email"
                                        v-model="form.email"
                                        type="email"
                                        placeholder="jean.dupont@exemple.fr"
                                        class="pl-10"
                                        required
                                        :disabled="isSubmitting"
                                        :class="errors.email ? 'border-red-500' : ''"
                                    />
                                </div>
                                <p v-if="errors.email" class="text-red-500 text-sm">
                                    {{ errors.email[0] }}
                                </p>
                            </div>

                            <!-- Phone -->
                            <div class="space-y-2">
                                <Label for="phone">Téléphone</Label>
                                <div class="relative">
                                    <Phone class="top-3 left-3 absolute w-5 h-5 text-zinc-400" />
                                    <Input
                                        id="phone"
                                        v-model="form.phone"
                                        type="tel"
                                        placeholder="+33 6 12 34 56 78"
                                        class="pl-10"
                                        :disabled="isSubmitting"
                                        :class="errors.phone ? 'border-red-500' : ''"
                                    />
                                </div>
                                <p v-if="errors.phone" class="text-red-500 text-sm">
                                    {{ errors.phone[0] }}
                                </p>
                            </div>

                            <!-- Company -->
                            <div class="space-y-2">
                                <Label for="company">Entreprise</Label>
                                <div class="relative">
                                    <Building2 class="top-3 left-3 absolute w-5 h-5 text-zinc-400" />
                                    <Input
                                        id="company"
                                        v-model="form.company"
                                        type="text"
                                        placeholder="Votre entreprise"
                                        class="pl-10"
                                        :disabled="isSubmitting"
                                        :class="errors.company ? 'border-red-500' : ''"
                                    />
                                </div>
                                <p v-if="errors.company" class="text-red-500 text-sm">
                                    {{ errors.company[0] }}
                                </p>
                            </div>

                            <!-- Message -->
                            <div class="space-y-2">
                                <Label for="message">Message *</Label>
                                <Textarea
                                    id="message"
                                    v-model="form.message"
                                    placeholder="Décrivez votre projet ou posez-nous vos questions..."
                                    rows="6"
                                    required
                                    :disabled="isSubmitting"
                                    :class="errors.message ? 'border-red-500' : ''"
                                />
                                <p v-if="errors.message" class="text-red-500 text-sm">
                                    {{ errors.message[0] }}
                                </p>
                            </div>

                            <!-- Submit Button -->
                            <Button
                                type="submit"
                                class="w-full"
                                :disabled="isSubmitting"
                            >
                                <Send v-if="!isSubmitting" class="mr-2 w-4 h-4" />
                                <span v-if="isSubmitting">Envoi en cours...</span>
                                <span v-else>Envoyer le message</span>
                            </Button>
                        </form>

                        <!-- Success Message -->
                        <div
                            v-if="submitted"
                            class="bg-green-50 dark:bg-green-950 mt-6 p-4 rounded-lg border border-green-200 dark:border-green-800"
                        >
                            <div class="flex items-center gap-3">
                                <CheckCircle class="w-5 h-5 text-green-600 dark:text-green-400" />
                                <p class="font-medium text-green-900 text-sm dark:text-green-100">
                                    Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Contact Information -->
                    <div class="space-y-8">
                        <div class="bg-white dark:bg-zinc-900 shadow-sm p-8 rounded-lg border border-zinc-200 dark:border-zinc-800">
                            <h3 class="mb-6 font-semibold text-xl text-zinc-900 dark:text-white">
                                Informations de contact
                            </h3>

                            <div class="space-y-6">
                                <div class="flex items-start gap-4">
                                    <div class="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-lg">
                                        <Mail class="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                                    </div>
                                    <div>
                                        <p class="font-medium text-sm text-zinc-900 dark:text-white">Email</p>
                                        <a href="mailto:contact@example.com" class="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                                            contact@example.com
                                        </a>
                                    </div>
                                </div>

                                <div class="flex items-start gap-4">
                                    <div class="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-lg">
                                        <Phone class="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                                    </div>
                                    <div>
                                        <p class="font-medium text-sm text-zinc-900 dark:text-white">Téléphone</p>
                                        <a href="tel:+33612345678" class="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                                            +33 6 12 34 56 78
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="bg-gradient-to-br from-zinc-100 dark:from-zinc-900 to-zinc-200 dark:to-zinc-800 p-8 rounded-lg border border-zinc-200 dark:border-zinc-700">
                            <h3 class="mb-4 font-semibold text-xl text-zinc-900 dark:text-white">
                                Temps de réponse
                            </h3>
                            <p class="text-zinc-600 text-sm dark:text-zinc-400 leading-relaxed">
                                Notre équipe s'engage à vous répondre dans les <strong>24 heures ouvrées</strong>. Pour les urgences, n'hésitez pas à nous appeler directement.
                            </p>
                        </div>

                        <div class="bg-gradient-to-br from-zinc-100 dark:from-zinc-900 to-zinc-200 dark:to-zinc-800 p-8 rounded-lg border border-zinc-200 dark:border-zinc-700">
                            <h3 class="mb-4 font-semibold text-xl text-zinc-900 dark:text-white">
                                Horaires
                            </h3>
                            <div class="space-y-2 text-zinc-600 text-sm dark:text-zinc-400">
                                <p><strong>Lundi - Vendredi :</strong> 9h00 - 18h00</p>
                                <p><strong>Weekend :</strong> Fermé</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </LandingLayout>
</template>
