import { ref } from 'vue';
import { useToast } from '@/components/ui/toast/use-toast';

export function useApiError() {
    const { toast } = useToast();
    const lastError = ref(null);

    const getErrorMessage = (error) => {
        if (error.response) {
            // Server responded with error status
            const status = error.response.status;
            const data = error.response.data;

            if (status === 422 && data.errors) {
                // Validation errors
                const firstError = Object.values(data.errors)[0];
                return Array.isArray(firstError) ? firstError[0] : firstError;
            }

            if (data.message) {
                return data.message;
            }

            // Default status messages
            const statusMessages = {
                400: 'Requête invalide',
                401: 'Non authentifié',
                403: 'Accès refusé',
                404: 'Ressource introuvable',
                422: 'Données invalides',
                429: 'Trop de requêtes, veuillez réessayer plus tard',
                500: 'Erreur serveur interne',
                502: 'Service temporairement indisponible',
                503: 'Service en maintenance'
            };

            return statusMessages[status] || `Erreur ${status}`;
        }

        if (error.request) {
            // Request made but no response
            return 'Impossible de se connecter au serveur';
        }

        // Other errors
        return error.message || 'Une erreur est survenue';
    };

    const handleError = (error, options = {}) => {
        const {
            showToast = true,
            logToConsole = true,
            context = '',
            onRetry = null
        } = options;

        lastError.value = error;
        const message = getErrorMessage(error);

        if (logToConsole) {
            console.error(context ? `[${context}]` : '[API Error]', error);
        }

        if (showToast) {
            toast({
                variant: 'destructive',
                title: 'Erreur',
                description: message,
                ...(onRetry && {
                    action: {
                        label: 'Réessayer',
                        onClick: onRetry
                    }
                })
            });
        }

        return message;
    };

    const isNetworkError = (error) => {
        return error.request && !error.response;
    };

    const isValidationError = (error) => {
        return error.response?.status === 422;
    };

    const isAuthError = (error) => {
        return error.response?.status === 401 || error.response?.status === 403;
    };

    const getValidationErrors = (error) => {
        if (!isValidationError(error)) return {};
        return error.response?.data?.errors || {};
    };

    const withRetry = async (fn, options = {}) => {
        const {
            maxRetries = 3,
            delay = 1000,
            backoff = true
        } = options;

        let lastError;

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;

                // Don't retry on client errors (4xx except 429)
                if (error.response?.status >= 400 && 
                    error.response?.status < 500 && 
                    error.response?.status !== 429) {
                    throw error;
                }

                // Don't retry on last attempt
                if (attempt === maxRetries - 1) {
                    throw error;
                }

                // Calculate delay with optional exponential backoff
                const waitTime = backoff ? delay * Math.pow(2, attempt) : delay;
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }

        throw lastError;
    };

    return {
        handleError,
        getErrorMessage,
        isNetworkError,
        isValidationError,
        isAuthError,
        getValidationErrors,
        withRetry,
        lastError
    };
}
