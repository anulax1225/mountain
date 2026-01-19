import { ref, h, render } from 'vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';

export function useConfirm() {
    const confirm = (options = {}) => {
        return new Promise((resolve, reject) => {
            const {
                title = 'Confirmer l\'action',
                description = null,
                message = null,
                confirmText = 'Confirmer',
                cancelText = 'Annuler',
                variant = 'default'
            } = options;

            // Create container for dialog
            const container = document.createElement('div');
            document.body.appendChild(container);

            const cleanup = () => {
                render(null, container);
                document.body.removeChild(container);
            };

            const handleConfirm = () => {
                cleanup();
                resolve(true);
            };

            const handleCancel = () => {
                cleanup();
                resolve(false);
            };

            // Create and render dialog component
            const vnode = h(ConfirmDialog, {
                open: true,
                title,
                description,
                message,
                confirmText,
                cancelText,
                variant,
                onConfirm: handleConfirm,
                onCancel: handleCancel,
                'onUpdate:open': (value) => {
                    if (!value) {
                        handleCancel();
                    }
                }
            });

            render(vnode, container);
        });
    };

    const confirmDelete = (itemName = 'cet élément') => {
        return confirm({
            title: 'Confirmer la suppression',
            message: `Êtes-vous sûr de vouloir supprimer ${itemName} ? Cette action est irréversible.`,
            confirmText: 'Supprimer',
            cancelText: 'Annuler',
            variant: 'destructive'
        });
    };

    const confirmLeave = (hasUnsavedChanges = true) => {
        if (!hasUnsavedChanges) return Promise.resolve(true);

        return confirm({
            title: 'Modifications non enregistrées',
            message: 'Vous avez des modifications non enregistrées. Êtes-vous sûr de vouloir quitter ?',
            confirmText: 'Quitter',
            cancelText: 'Rester',
            variant: 'destructive'
        });
    };

    const confirmAction = (action, itemName = '') => {
        const actions = {
            publish: {
                title: 'Publier',
                message: `Êtes-vous sûr de vouloir publier ${itemName} ?`,
                confirmText: 'Publier',
                variant: 'default'
            },
            archive: {
                title: 'Archiver',
                message: `Êtes-vous sûr de vouloir archiver ${itemName} ?`,
                confirmText: 'Archiver',
                variant: 'secondary'
            },
            restore: {
                title: 'Restaurer',
                message: `Êtes-vous sûr de vouloir restaurer ${itemName} ?`,
                confirmText: 'Restaurer',
                variant: 'default'
            },
            duplicate: {
                title: 'Dupliquer',
                message: `Êtes-vous sûr de vouloir dupliquer ${itemName} ?`,
                confirmText: 'Dupliquer',
                variant: 'default'
            }
        };

        const config = actions[action] || {
            title: 'Confirmer l\'action',
            message: `Êtes-vous sûr de vouloir effectuer cette action sur ${itemName} ?`,
            confirmText: 'Confirmer',
            variant: 'default'
        };

        return confirm(config);
    };

    return {
        confirm,
        confirmDelete,
        confirmLeave,
        confirmAction
    };
}
