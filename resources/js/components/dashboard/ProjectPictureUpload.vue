<script setup lang="ts">
import { ref } from 'vue';
import { useForm } from '@inertiajs/vue3';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-vue-next';

interface Props {
  projectSlug: string;
  currentPicture?: string | null;
}

const props = defineProps<Props>();

const form = useForm({
  picture: null as File | null,
});

const previewUrl = ref<string | null>(props.currentPicture ? `/storage/${props.currentPicture}` : null);
const fileInputRef = ref<HTMLInputElement>();

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (file) {
    form.picture = file;
    previewUrl.value = URL.createObjectURL(file);
  }
}

function clearFile() {
  form.picture = null;
  previewUrl.value = props.currentPicture ? `/storage/${props.currentPicture}` : null;
  
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
}

function submit() {
  form.post(`/projects/${props.projectSlug}`, {
    forceFormData: true,
    onSuccess: () => {
      form.reset();
      if (fileInputRef.value) {
        fileInputRef.value.value = '';
      }
    },
  });
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Image du projet</CardTitle>
      <CardDescription>
        Téléchargez une image de couverture pour votre projet
      </CardDescription>
    </CardHeader>

    <CardContent>
      <form @submit.prevent="submit" class="space-y-4">
        <div class="space-y-2">
          <Label for="picture">Image</Label>
          
          <div v-if="previewUrl" class="relative aspect-video bg-muted rounded-lg overflow-hidden mb-2">
            <img :src="previewUrl" alt="Aperçu" class="w-full h-full object-cover" />
            <Button
              v-if="form.picture"
              type="button"
              variant="destructive"
              size="icon"
              class="absolute top-2 right-2"
              @click="clearFile"
            >
              <X class="h-4 w-4" />
            </Button>
          </div>

          <div class="flex items-center gap-2">
            <Input
              id="picture"
              ref="fileInputRef"
              type="file"
              accept="image/*"
              @change="handleFileChange"
              class="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              @click="fileInputRef?.click()"
            >
              <Upload class="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Button type="submit" :disabled="form.processing || !form.picture">
          Enregistrer
        </Button>
      </form>
    </CardContent>
  </Card>
</template>
