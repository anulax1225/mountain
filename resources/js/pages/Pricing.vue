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
        <div class="text-center mb-16">
          <h1 class="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Des tarifs simples et transparents
          </h1>
          <p class="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choisissez le plan qui correspond à vos besoins. Évoluez à tout moment.
          </p>
          <p class="mt-4 text-sm text-muted-foreground/70 italic">
            Cette page est un exemple fictif. Les tarifs ne sont pas encore disponibles.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card
            v-for="plan in plans"
            :key="plan.name"
            :class="[
              'relative flex flex-col',
              plan.popular ? 'border-primary border-2 shadow-xl' : ''
            ]"
          >
            <Badge
              v-if="plan.popular"
              class="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground"
            >
              Le plus populaire
            </Badge>

            <CardHeader class="text-center pb-2">
              <CardTitle class="text-2xl">{{ plan.name }}</CardTitle>
              <CardDescription>{{ plan.description }}</CardDescription>
            </CardHeader>

            <CardContent class="flex-1">
              <div class="text-center mb-6">
                <span class="text-5xl font-bold text-foreground">{{ plan.price }}€</span>
                <span class="text-muted-foreground">{{ plan.period }}</span>
              </div>

              <ul class="space-y-3">
                <li v-for="feature in plan.features" :key="feature" class="flex items-start gap-3">
                  <Check class="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
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
          <p class="text-muted-foreground mb-4">
            Besoin d'un plan personnalisé pour votre organisation ?
          </p>
          <Button variant="link" class="text-foreground">
            Contactez-nous pour un devis sur mesure
          </Button>
        </div>

        <div class="mt-16 bg-muted rounded-2xl p-8 max-w-4xl mx-auto">
          <h2 class="text-2xl font-bold text-foreground text-center mb-8">
            Questions fréquentes
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 class="font-semibold text-foreground mb-2">
                Puis-je changer de plan à tout moment ?
              </h3>
              <p class="text-muted-foreground text-sm">
                Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Les changements prennent effet immédiatement.
              </p>
            </div>
            <div>
              <h3 class="font-semibold text-foreground mb-2">
                Y a-t-il un engagement ?
              </h3>
              <p class="text-muted-foreground text-sm">
                Non, tous nos plans sont sans engagement. Vous pouvez annuler à tout moment.
              </p>
            </div>
            <div>
              <h3 class="font-semibold text-foreground mb-2">
                Comment fonctionne l'essai gratuit ?
              </h3>
              <p class="text-muted-foreground text-sm">
                L'essai Pro de 14 jours vous donne accès à toutes les fonctionnalités. Aucune carte bancaire requise.
              </p>
            </div>
            <div>
              <h3 class="font-semibold text-foreground mb-2">
                Proposez-vous des réductions ?
              </h3>
              <p class="text-muted-foreground text-sm">
                Oui, nous offrons 20% de réduction sur les abonnements annuels et des tarifs spéciaux pour l'éducation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </LandingLayout>
</template>
