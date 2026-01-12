<script setup>
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Notifications</CardTitle>
      <CardDescription>Gérez comment vous recevez les notifications</CardDescription>
    </CardHeader>
    <CardContent class="space-y-6">
      <div class="flex justify-between items-center">
        <div class="space-y-0.5">
          <Label>Notifications par email</Label>
          <p class="text-zinc-500 dark:text-zinc-400 text-sm">Recevez des notifications par email concernant votre compte</p>
        </div>
        <Switch />
      </div>
      <Separator />
      <div class="flex justify-between items-center">
        <div class="space-y-0.5">
          <Label>Mises à jour de projets</Label>
          <p class="text-zinc-500 dark:text-zinc-400 text-sm">Soyez notifié des modifications de vos projets</p>
        </div>
        <Switch />
      </div>
    </CardContent>
  </Card>
</template>