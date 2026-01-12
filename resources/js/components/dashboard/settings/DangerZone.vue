<script setup>
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const deleteAccount = () => {
  if (confirm('Êtes-vous sûr de vouloir supprimer votre compte? Cette action est irréversible.')) {
    // Handle account deletion
  }
}
</script>

<template>
  <Card class="border-red-200 dark:border-red-900">
    <CardHeader>
      <CardTitle class="text-red-600 dark:text-red-400">Zone de danger</CardTitle>
      <CardDescription>Actions irréversibles pour votre compte</CardDescription>
    </CardHeader>
    <CardContent>
      <div class="flex justify-between items-center">
        <div>
          <p class="font-medium text-zinc-900 dark:text-zinc-100">Supprimer le compte</p>
          <p class="text-zinc-500 dark:text-zinc-400 text-sm">Supprimer définitivement votre compte et toutes vos données</p>
        </div>
        <Button variant="destructive" @click="deleteAccount">
          Supprimer le compte
        </Button>
      </div>
    </CardContent>
  </Card>
</template>