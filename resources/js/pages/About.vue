<script setup>
import { Head } from '@inertiajs/vue3'
import LandingLayout from '@/layouts/LandingLayout.vue'
</script>

<template>
  <LandingLayout>
    <Head title="À propos" />

    <div class="pt-24 pb-16">
      <div class="mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div class="text-center mb-16">
          <h1 class="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            À propos d'OwlAround
          </h1>
        </div>

        <!-- Notre mission -->
        <section class="mb-16">
          <h2 class="text-2xl font-bold text-foreground mb-6">Notre mission</h2>
          <div class="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              OwlAround est une plateforme qui permet de créer et partager facilement des visites virtuelles immersives à 360°.
              L'objectif est de permettre aux utilisateurs de découvrir des lieux à distance de manière simple, interactive et accessible.
            </p>
            <p>
              Grâce aux visites virtuelles, il devient possible d'explorer un appartement, un espace professionnel ou un lieu culturel comme si l'on s'y trouvait réellement. Cette technologie ouvre de nouvelles possibilités pour valoriser des espaces et faciliter leur découverte.
            </p>
          </div>
        </section>

        <!-- Le projet TIP -->
        <section class="mb-16">
          <h2 class="text-2xl font-bold text-foreground mb-6">Le projet TIP</h2>
          <div class="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              OwlAround a été développé dans le cadre de notre Travail Interdisciplinaire de Projet (TIP) réalisé en 4ᵉ année de maturité professionnelle au CPNE (Centre professionnel neuchâtelois).
            </p>
            <p>
              Ce projet est suivi par deux mentors et un expert externe, qui nous accompagnent et nous conseillent tout au long du développement.
            </p>
            <p>
              L'objectif du TIP est de mener un projet concret en combinant les compétences de différentes formations. Dans notre cas, la collaboration entre médiamaticiens et informaticiens nous a permis de développer OwlAround sous plusieurs aspects.
            </p>
            <p>
              Les médiamaticiens ont principalement travaillé sur la création de l'identité visuelle et de la charte graphique, ainsi que sur les aspects de communication et de présentation du projet.
            </p>
            <p>
              Les informaticiens se sont concentrés sur la partie technique, notamment le développement du site web, l'intégration des visites virtuelles et la gestion de l'infrastructure nécessaire au projet.
            </p>
            <p>
              La gestion du projet, la réflexion autour du concept et les différentes décisions stratégiques ont été réalisées en collaboration par l'ensemble de l'équipe.
            </p>
            <p>
              Ce travail nous a permis de combiner nos compétences et de développer une solution complète autour des visites virtuelles.
            </p>
          </div>
        </section>

        <!-- L'équipe -->
        <section class="mb-16">
          <h2 class="text-2xl font-bold text-foreground mb-6">L'équipe</h2>
          <p class="text-muted-foreground leading-relaxed mb-8">
            OwlAround est porté par une équipe de quatre étudiants du CPNE, provenant de deux formations complémentaires.
          </p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="bg-muted rounded-2xl p-6">
              <h3 class="text-lg font-semibold text-foreground mb-2">Médiamaticiens</h3>
              <ul class="text-muted-foreground space-y-1 mb-4">
                <li>Alyssa</li>
                <li>Mathieu</li>
              </ul>
              <p class="text-muted-foreground text-sm leading-relaxed">
                Ils ont principalement travaillé sur les aspects liés à la communication, au design et à l'identité visuelle du projet, ainsi que sur la présentation et la valorisation du concept.
              </p>
            </div>

            <div class="bg-muted rounded-2xl p-6">
              <h3 class="text-lg font-semibold text-foreground mb-2">Informaticiens</h3>
              <ul class="text-muted-foreground space-y-1 mb-4">
                <li>Vinayak</li>
                <li>Carl</li>
              </ul>
              <p class="text-muted-foreground text-sm leading-relaxed">
                Ils se sont concentrés sur le développement technique du site web, l'intégration des visites virtuelles et les aspects informatiques du projet.
              </p>
            </div>
          </div>

          <p class="text-muted-foreground leading-relaxed mt-6">
            Cette collaboration entre médiamaticiens et informaticiens nous a permis de combiner nos compétences pour développer un projet complet.
          </p>
        </section>

        <!-- Notre vision -->
        <section class="mb-16">
          <h2 class="text-2xl font-bold text-foreground mb-6">Notre vision</h2>
          <div class="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Avec OwlAround, nous souhaitions explorer le potentiel des visites virtuelles immersives et montrer comment cette technologie peut être utilisée dans différents domaines comme l'immobilier, l'événementiel ou la culture.
            </p>
            <p>
              Au-delà du cadre scolaire, ce projet nous a permis d'apprendre à travailler en équipe, gérer un projet sur la durée et transformer une idée en solution concrète.
            </p>
            <p>
              OwlAround représente aujourd'hui le résultat de plusieurs mois de travail, de recherche et de développement.
            </p>
          </div>
        </section>
      </div>
    </div>
  </LandingLayout>
</template>