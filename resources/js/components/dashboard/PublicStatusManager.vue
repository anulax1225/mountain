<script setup lang="ts">
import { computed } from 'vue';
import { useForm } from '@inertiajs/vue3';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Globe, Lock } from 'lucide-vue-next';

interface Image {
  id: string;
  name: string;
}

interface Props {
  projectSlug: string;
  isPublic: boolean;
  startImageId?: string | null;
  images: Image[];
}

const props = defineProps<Props>();

const form = useForm({
  is_public: props.isPublic,
  start_image_id: props.startImageId || '',
});

const canMakePublic = computed(() => {
  return props.images.length > 0;
});

function submit() {
  form.put(`/projects/${props.projectSlug}/public-status`);
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Visibilité du projet</CardTitle>
      <CardDescription>
        Gérez l'accès public à votre projet
      </CardDescription>
    </CardHeader>

    <CardContent>
      <form @submit.prevent="submit" class="space-y-6">
        <div class="flex items-center justify-between space-x-2">
          <div class="flex items-center space-x-2">
            <Lock v-if="!form.is_public" class="h-5 w-5 text-muted-foreground" />
            <Globe v-else class="h-5 w-5 text-green-600" />
            <div>
              <Label for="public-toggle" class="text-base">
                {{ form.is_public ? 'Public' : 'Privé' }}
              </Label>
              <p class="text-sm text-muted-foreground">
                {{ form.is_public 
                  ? 'Visible dans la galerie publique' 
                  : 'Accessible uniquement aux utilisateurs assignés' 
                }}
              </p>
            </div>
          </div>
          <Switch
            id="public-toggle"
            v-model:checked="form.is_public"
            :disabled="!canMakePublic"
          />
        </div>

        <div v-if="form.is_public" class="space-y-2">
          <Label for="start-image">Image de départ</Label>
          <Select v-model="form.start_image_id" required>
            <SelectTrigger id="start-image">
              <SelectValue placeholder="Sélectionnez une image" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="image in images"
                :key="image.id"
                :value="image.id"
              >
                {{ image.name }}
              </SelectItem>
            </SelectContent>
          </Select>
          <p class="text-xs text-muted-foreground">
            Les visiteurs commenceront leur visite à cette image
          </p>
        </div>

        <div v-if="!canMakePublic" class="rounded-lg bg-muted p-4">
          <p class="text-sm text-muted-foreground">
            Ajoutez au moins une image au projet pour le rendre public
          </p>
        </div>

        <Button 
          type="submit" 
          :disabled="form.processing || !canMakePublic || (form.is_public && !form.start_image_id)"
        >
          Enregistrer
        </Button>
      </form>
    </CardContent>
  </Card>
</template>
