<script setup>
import { ref } from 'vue'
import { useForm } from '@inertiajs/vue3'
import LandingLayout from '@/layouts/LandingLayout.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Mail, Phone, Building2, Send, CheckCircle } from 'lucide-vue-next'

const form = useForm({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
})

const submitted = ref(false)

const submitForm = () => {
    form.post('/contact', {
        onSuccess: () => {
            submitted.value = true
            form.reset()
        },
    })
}
</script>

<template>
    <LandingLayout>
        <div class="bg-muted/50 py-24">
            <div class="mx-auto px-6 max-w-7xl lg:px-8">
                <!-- Header -->
                <div class="mx-auto max-w-2xl text-center mb-16">
                    <h1 class="text-4xl text-foreground sm:text-5xl" style="font-family: var(--font-family-display); font-weight: 800;">
                        Contactez-nous
                    </h1>
                    <p class="mt-6 text-lg text-muted-foreground leading-8">
                        Une question sur nos services ? Un projet de visite virtuelle ? Notre équipe est là pour vous accompagner.
                    </p>
                </div>

                <div class="gap-x-8 gap-y-20 lg:gap-y-0 grid lg:grid-cols-2 mx-auto max-w-6xl">
                    <!-- Contact Form -->
                    <div class="bg-card shadow-sm hover:shadow-md p-8 rounded-2xl border border-border transition-shadow">
                        <h2 class="mb-6 text-2xl text-foreground" style="font-family: var(--font-family-display); font-weight: 600;">
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
                                    :disabled="form.processing"
                                    :class="form.errors.name ? 'border-red-500' : ''"
                                />
                                <p v-if="form.errors.name" class="text-red-500 text-sm">
                                    {{ form.errors.name }}
                                </p>
                            </div>

                            <!-- Email -->
                            <div class="space-y-2">
                                <Label for="email">Email *</Label>
                                <div class="relative">
                                    <Mail class="top-3 left-3 absolute w-5 h-5 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        v-model="form.email"
                                        type="email"
                                        placeholder="jean.dupont@exemple.fr"
                                        class="pl-10"
                                        required
                                        :disabled="form.processing"
                                        :class="form.errors.email ? 'border-red-500' : ''"
                                    />
                                </div>
                                <p v-if="form.errors.email" class="text-red-500 text-sm">
                                    {{ form.errors.email }}
                                </p>
                            </div>

                            <!-- Phone -->
                            <div class="space-y-2">
                                <Label for="phone">Téléphone</Label>
                                <div class="relative">
                                    <Phone class="top-3 left-3 absolute w-5 h-5 text-muted-foreground" />
                                    <Input
                                        id="phone"
                                        v-model="form.phone"
                                        type="tel"
                                        placeholder="+33 6 12 34 56 78"
                                        class="pl-10"
                                        :disabled="form.processing"
                                        :class="form.errors.phone ? 'border-red-500' : ''"
                                    />
                                </div>
                                <p v-if="form.errors.phone" class="text-red-500 text-sm">
                                    {{ form.errors.phone }}
                                </p>
                            </div>

                            <!-- Company -->
                            <div class="space-y-2">
                                <Label for="company">Entreprise</Label>
                                <div class="relative">
                                    <Building2 class="top-3 left-3 absolute w-5 h-5 text-muted-foreground" />
                                    <Input
                                        id="company"
                                        v-model="form.company"
                                        type="text"
                                        placeholder="Votre entreprise"
                                        class="pl-10"
                                        :disabled="form.processing"
                                        :class="form.errors.company ? 'border-red-500' : ''"
                                    />
                                </div>
                                <p v-if="form.errors.company" class="text-red-500 text-sm">
                                    {{ form.errors.company }}
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
                                    :disabled="form.processing"
                                    :class="form.errors.message ? 'border-red-500' : ''"
                                />
                                <p v-if="form.errors.message" class="text-red-500 text-sm">
                                    {{ form.errors.message }}
                                </p>
                            </div>

                            <!-- Submit Button -->
                            <Button
                                type="submit"
                                class="w-full"
                                :disabled="form.processing"
                            >
                                <Send v-if="!form.processing" class="mr-2 w-4 h-4" />
                                <span v-if="form.processing">Envoi en cours...</span>
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
                        <div class="bg-card shadow-sm p-8 rounded-2xl border border-border">
                            <h3 class="mb-6 font-semibold text-xl text-foreground">
                                Informations de contact
                            </h3>

                            <div class="space-y-6">
                                <div class="flex items-start gap-4">
                                    <div class="bg-muted p-3 rounded-lg">
                                        <Mail class="w-5 h-5 text-foreground" />
                                    </div>
                                    <div>
                                        <p class="font-medium text-sm text-foreground">Email</p>
                                        <a href="mailto:contact@example.com" class="text-sm text-muted-foreground hover:text-foreground">
                                            contact@example.com
                                        </a>
                                    </div>
                                </div>

                                <div class="flex items-start gap-4">
                                    <div class="bg-muted p-3 rounded-lg">
                                        <Phone class="w-5 h-5 text-foreground" />
                                    </div>
                                    <div>
                                        <p class="font-medium text-sm text-foreground">Téléphone</p>
                                        <a href="tel:+33612345678" class="text-sm text-muted-foreground hover:text-foreground">
                                            +33 6 12 34 56 78
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="bg-gradient-to-br from-muted to-muted/50 p-8 rounded-lg border border-border">
                            <h3 class="mb-4 font-semibold text-xl text-foreground">
                                Temps de réponse
                            </h3>
                            <p class="text-sm text-muted-foreground leading-relaxed">
                                Notre équipe s'engage à vous répondre dans les <strong>24 heures ouvrées</strong>. Pour les urgences, n'hésitez pas à nous appeler directement.
                            </p>
                        </div>

                        <div class="bg-gradient-to-br from-muted to-muted/50 p-8 rounded-lg border border-border">
                            <h3 class="mb-4 font-semibold text-xl text-foreground">
                                Horaires
                            </h3>
                            <div class="space-y-2 text-sm text-muted-foreground">
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
