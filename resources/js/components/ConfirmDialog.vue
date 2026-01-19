<template>
    <Dialog v-model:open="isOpen">
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{{ title }}</DialogTitle>
                <DialogDescription v-if="description">
                    {{ description }}
                </DialogDescription>
            </DialogHeader>

            <div v-if="message" class="py-4 text-sm text-foreground">
                {{ message }}
            </div>

            <DialogFooter>
                <Button
                    variant="outline"
                    @click="handleCancel"
                    :disabled="isLoading"
                >
                    {{ cancelText }}
                </Button>
                <Button
                    :variant="variant"
                    @click="handleConfirm"
                    :disabled="isLoading"
                >
                    <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
                    {{ confirmText }}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-vue-next';

const props = defineProps({
    open: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        default: 'Confirmer l\'action'
    },
    description: {
        type: String,
        default: null
    },
    message: {
        type: String,
        default: null
    },
    confirmText: {
        type: String,
        default: 'Confirmer'
    },
    cancelText: {
        type: String,
        default: 'Annuler'
    },
    variant: {
        type: String,
        default: 'default',
        validator: (value) => ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'].includes(value)
    },
    onConfirm: {
        type: Function,
        default: null
    },
    onCancel: {
        type: Function,
        default: null
    }
});

const emit = defineEmits(['update:open', 'confirm', 'cancel']);

const isOpen = ref(props.open);
const isLoading = ref(false);

watch(() => props.open, (newValue) => {
    isOpen.value = newValue;
});

watch(isOpen, (newValue) => {
    emit('update:open', newValue);
});

const handleConfirm = async () => {
    isLoading.value = true;

    try {
        if (props.onConfirm) {
            await props.onConfirm();
        }
        emit('confirm');
        isOpen.value = false;
    } catch (error) {
        console.error('Confirm error:', error);
    } finally {
        isLoading.value = false;
    }
};

const handleCancel = () => {
    if (props.onCancel) {
        props.onCancel();
    }
    emit('cancel');
    isOpen.value = false;
};
</script>
