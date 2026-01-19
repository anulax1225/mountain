import { ref, reactive, computed, watch } from 'vue';
import { useApiError } from './useApiError';

export function useForm(initialData = {}, options = {}) {
    const {
        validate = null,
        onSuccess = null,
        onError = null,
        resetOnSuccess = false,
        transform = null
    } = options;

    const { handleError, getValidationErrors } = useApiError();

    const data = reactive({ ...initialData });
    const errors = ref({});
    const isSubmitting = ref(false);
    const isDirty = ref(false);
    const hasErrors = computed(() => Object.keys(errors.value).length > 0);

    // Track which fields have been touched
    const touched = ref(new Set());

    const setData = (field, value) => {
        data[field] = value;
        isDirty.value = true;
        touched.value.add(field);
        
        // Clear error for this field when user starts typing
        if (errors.value[field]) {
            delete errors.value[field];
        }
    };

    const setErrors = (newErrors) => {
        errors.value = { ...newErrors };
    };

    const clearErrors = () => {
        errors.value = {};
    };

    const clearError = (field) => {
        if (errors.value[field]) {
            delete errors.value[field];
        }
    };

    const validateField = (field) => {
        if (!validate) return true;

        const fieldValidation = validate[field];
        if (!fieldValidation) return true;

        const value = data[field];
        const validationRules = Array.isArray(fieldValidation) ? fieldValidation : [fieldValidation];

        for (const rule of validationRules) {
            if (typeof rule === 'function') {
                const result = rule(value, data);
                if (result !== true) {
                    errors.value[field] = result;
                    return false;
                }
            }
        }

        clearError(field);
        return true;
    };

    const validateAll = () => {
        if (!validate) return true;

        clearErrors();
        let isValid = true;

        for (const field in validate) {
            if (!validateField(field)) {
                isValid = false;
            }
        }

        return isValid;
    };

    const submit = async (submitFn) => {
        // Validate before submitting
        if (!validateAll()) {
            return {
                success: false,
                errors: errors.value
            };
        }

        isSubmitting.value = true;
        clearErrors();

        try {
            // Transform data if transformer provided
            const submissionData = transform ? transform(data) : data;

            const response = await submitFn(submissionData);

            if (onSuccess) {
                onSuccess(response, data);
            }

            if (resetOnSuccess) {
                reset();
            } else {
                isDirty.value = false;
            }

            return {
                success: true,
                data: response
            };
        } catch (error) {
            // Handle validation errors from API
            const validationErrors = getValidationErrors(error);
            if (Object.keys(validationErrors).length > 0) {
                setErrors(validationErrors);
            }

            if (onError) {
                onError(error, data);
            }

            handleError(error, {
                context: 'Form Submission',
                showToast: true
            });

            return {
                success: false,
                errors: errors.value,
                error
            };
        } finally {
            isSubmitting.value = false;
        }
    };

    const reset = () => {
        Object.keys(data).forEach(key => {
            data[key] = initialData[key];
        });
        clearErrors();
        isDirty.value = false;
        touched.value.clear();
    };

    const fill = (newData) => {
        Object.keys(newData).forEach(key => {
            if (key in data) {
                data[key] = newData[key];
            }
        });
        isDirty.value = false;
    };

    const hasError = (field) => {
        return !!errors.value[field];
    };

    const getError = (field) => {
        return errors.value[field];
    };

    const isTouched = (field) => {
        return touched.value.has(field);
    };

    const touch = (field) => {
        touched.value.add(field);
    };

    const touchAll = () => {
        Object.keys(data).forEach(field => {
            touched.value.add(field);
        });
    };

    // Watch for changes to mark form as dirty
    watch(
        () => ({ ...data }),
        () => {
            isDirty.value = true;
        },
        { deep: true }
    );

    return {
        data,
        errors,
        isSubmitting,
        isDirty,
        hasErrors,
        touched,
        setData,
        setErrors,
        clearErrors,
        clearError,
        validateField,
        validateAll,
        submit,
        reset,
        fill,
        hasError,
        getError,
        isTouched,
        touch,
        touchAll
    };
}

// Common validation rules
export const validators = {
    required: (message = 'Ce champ est requis') => (value) => {
        if (value === null || value === undefined || value === '') {
            return message;
        }
        return true;
    },

    minLength: (min, message = null) => (value) => {
        if (!value) return true;
        if (value.length < min) {
            return message || `Minimum ${min} caractères requis`;
        }
        return true;
    },

    maxLength: (max, message = null) => (value) => {
        if (!value) return true;
        if (value.length > max) {
            return message || `Maximum ${max} caractères autorisés`;
        }
        return true;
    },

    email: (message = 'Email invalide') => (value) => {
        if (!value) return true;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            return message;
        }
        return true;
    },

    url: (message = 'URL invalide') => (value) => {
        if (!value) return true;
        try {
            new URL(value);
            return true;
        } catch {
            return message;
        }
    },

    min: (min, message = null) => (value) => {
        if (value === null || value === undefined) return true;
        if (Number(value) < min) {
            return message || `La valeur doit être supérieure ou égale à ${min}`;
        }
        return true;
    },

    max: (max, message = null) => (value) => {
        if (value === null || value === undefined) return true;
        if (Number(value) > max) {
            return message || `La valeur doit être inférieure ou égale à ${max}`;
        }
        return true;
    },

    pattern: (regex, message = 'Format invalide') => (value) => {
        if (!value) return true;
        if (!regex.test(value)) {
            return message;
        }
        return true;
    },

    matches: (field, message = null) => (value, formData) => {
        if (value !== formData[field]) {
            return message || `Les valeurs ne correspondent pas`;
        }
        return true;
    }
};
