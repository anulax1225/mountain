<script setup>
import { Head, Link } from '@inertiajs/vue3'
import LandingLayout from '@/layouts/LandingLayout.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check } from 'lucide-vue-next'

const plans = [
  {
    name: 'Gratuit',
    description: 'Parfait pour découvrir la plateforme',
    price: '0',
    period: '/mois',
    features: [
      '3 projets maximum',
      '10 images par projet',
      'Hotspots basiques',
      'Export basse résolution',
      'Support communautaire'
    ],
    cta: 'Commencer gratuitement',
    popular: false,
    variant: 'outline'
  },
  {
    name: 'Pro',
    description: 'Pour les professionnels et créateurs',
    price: '29',
    period: '/mois',
    features: [
      'Projets illimités',
      '100 images par projet',
      'Hotspots personnalisés',
      'Export haute résolution',
      'Stickers et annotations',
      'Support prioritaire',
      'Analytiques de base'
    ],
    cta: 'Essai gratuit 14 jours',
    popular: true,
    variant: 'default'
  },
  {
    name: 'Entreprise',
    description: 'Pour les équipes et organisations',
    price: '99',
    period: '/mois',
    features: [
      'Tout du plan Pro',
      'Images illimitées',
      'Collaboration en équipe',
      'API complète',
      'White-label',
      'SSO / SAML',
      'Support dédié 24/7',
      'Formation personnalisée'
    ],
    cta: 'Contacter les ventes',
    popular: false,
    variant: 'outline'
  }
]
</script>

<template>
  <LandingLayout>
    <Head title="Tarifs" />

    <div class="pt-24 pb-16">
      <div class="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div class="mb-16 text-center">
          <h1 class="mb-4 text-foreground text-4xl sm:text-5xl" style="font-family: var(--font-family-display); font-weight: 800;">
            Des tarifs simples et transparents
          </h1>
          <p class="mx-auto max-w-2xl text-muted-foreground text-xl">
            Choisissez le plan qui correspond à vos besoins. Évoluez à tout moment.
          </p>
          <p class="mt-4 text-muted-foreground/70 text-sm italic">
            Cette page est un exemple fictif. Les tarifs ne sont pas encore disponibles.
          </p>
        </div>

        <div class="gap-8 grid grid-cols-1 md:grid-cols-3 mx-auto max-w-6xl">
          <Card
            v-for="plan in plans"
            :key="plan.name"
            :class="[
              'relative flex flex-col',
              plan.popular ? 'border-primary border-2 shadow-xl shadow-primary/10' : ''
            ]"
          >
            <Badge
              v-if="plan.popular"
              class="-top-3 left-1/2 absolute bg-primary text-primary-foreground -translate-x-1/2"
            >
              Le plus populaire
            </Badge>

            <CardHeader class="pb-2 text-center">
              <CardTitle class="text-2xl">{{ plan.name }}</CardTitle>
              <CardDescription>{{ plan.description }}</CardDescription>
            </CardHeader>

            <CardContent class="flex-1">
              <div class="mb-6 text-center">
                <span class="font-bold text-foreground text-5xl">{{ plan.price }}€</span>
                <span class="text-muted-foreground">{{ plan.period }}</span>
              </div>

              <ul class="space-y-3">
                <li v-for="feature in plan.features" :key="feature" class="flex items-start gap-3">
                  <Check class="mt-0.5 w-5 h-5 text-green-500 shrink-0" />
                  <span class="text-foreground text-sm">{{ feature }}</span>
                </li>
              </ul>
            </CardContent>

            <CardFooter>
              <Link href="/register" class="w-full">
                <Button
                  :variant="plan.variant"
                  class="w-full"
                  :class="plan.popular ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : ''"
                >
                  {{ plan.cta }}
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>

        <div class="mt-16 text-center">
          <p class="mb-4 text-muted-foreground">
            Besoin d'un plan personnalisé pour votre organisation ?
          </p>
          <Link href="/contact">
            <Button variant="link" class="text-foreground">
              Contactez-nous pour un devis sur mesure
            </Button>
          </Link>
        </div>
      </div>
    </div>
  </LandingLayout>
</template>
