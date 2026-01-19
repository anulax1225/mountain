import { ref, computed } from 'vue';
import { useApiError } from './useApiError';

export function useImageUpload(options = {}) {
    const {
        maxFileSize = 50 * 1024 * 1024, // 50MB default
        allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'],
        validateEquirectangular = false,
        onSuccess = null,
        onError = null
    } = options;

    const { handleError } = useApiError();
    
    const isUploading = ref(false);
    const uploadProgress = ref(0);
    const uploadedFiles = ref([]);
    const errors = ref([]);

    const validateFile = (file) => {
        const validationErrors = [];

        // Check file type
        if (!allowedTypes.includes(file.type)) {
            validationErrors.push({
                file: file.name,
                message: `Type de fichier non supporté. Types acceptés : ${allowedTypes.join(', ')}`
            });
        }

        // Check file size
        if (file.size > maxFileSize) {
            const maxSizeMB = maxFileSize / (1024 * 1024);
            validationErrors.push({
                file: file.name,
                message: `Fichier trop volumineux. Taille maximale : ${maxSizeMB}MB`
            });
        }

        return validationErrors;
    };

    const validateImageDimensions = (file) => {
        return new Promise((resolve) => {
            if (!validateEquirectangular) {
                resolve([]);
                return;
            }

            const img = new Image();
            const url = URL.createObjectURL(file);

            img.onload = () => {
                URL.revokeObjectURL(url);
                const aspectRatio = img.width / img.height;
                
                // Equirectangular images should have 2:1 aspect ratio
                if (Math.abs(aspectRatio - 2) > 0.1) {
                    resolve([{
                        file: file.name,
                        message: 'L\'image doit être au format équirectangulaire (ratio 2:1)'
                    }]);
                } else {
                    resolve([]);
                }
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                resolve([{
                    file: file.name,
                    message: 'Impossible de valider les dimensions de l\'image'
                }]);
            };

            img.src = url;
        });
    };

    const validateFiles = async (files) => {
        errors.value = [];
        
        for (const file of files) {
            // Basic validation
            const basicErrors = validateFile(file);
            errors.value.push(...basicErrors);

            // Dimension validation
            if (basicErrors.length === 0 && validateEquirectangular) {
                const dimensionErrors = await validateImageDimensions(file);
                errors.value.push(...dimensionErrors);
            }
        }

        return errors.value.length === 0;
    };

    const uploadFile = async (file, uploadFn, onProgress = null) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const config = {
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    uploadProgress.value = progress;
                    if (onProgress) onProgress(progress, file);
                }
            };

            const result = await uploadFn(formData, config);
            
            uploadedFiles.value.push({
                file: file.name,
                result
            });

            return result;
        } catch (error) {
            const errorMessage = handleError(error, {
                showToast: false,
                context: `Upload ${file.name}`
            });
            
            errors.value.push({
                file: file.name,
                message: errorMessage
            });

            if (onError) onError(error, file);
            throw error;
        }
    };

    const uploadFiles = async (files, uploadFn, onProgress = null) => {
        isUploading.value = true;
        uploadProgress.value = 0;
        uploadedFiles.value = [];
        errors.value = [];

        try {
            // Validate all files first
            const isValid = await validateFiles(files);
            if (!isValid) {
                isUploading.value = false;
                return {
                    success: false,
                    errors: errors.value
                };
            }

            // Upload files sequentially
            const results = [];
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const fileProgress = (progress) => {
                    const totalProgress = ((i * 100 + progress) / files.length);
                    uploadProgress.value = Math.round(totalProgress);
                    if (onProgress) onProgress(totalProgress, file, i, files.length);
                };

                try {
                    const result = await uploadFile(file, uploadFn, fileProgress);
                    results.push(result);
                } catch (error) {
                    // Continue with next file even if one fails
                    console.error(`Failed to upload ${file.name}:`, error);
                }
            }

            isUploading.value = false;

            if (onSuccess && uploadedFiles.value.length > 0) {
                onSuccess(uploadedFiles.value);
            }

            return {
                success: uploadedFiles.value.length > 0,
                results,
                errors: errors.value
            };
        } catch (error) {
            isUploading.value = false;
            handleError(error, { context: 'Batch Upload' });
            throw error;
        }
    };

    const reset = () => {
        isUploading.value = false;
        uploadProgress.value = 0;
        uploadedFiles.value = [];
        errors.value = [];
    };

    const hasErrors = computed(() => errors.value.length > 0);
    const successCount = computed(() => uploadedFiles.value.length);
    const errorCount = computed(() => errors.value.length);

    return {
        isUploading,
        uploadProgress,
        uploadedFiles,
        errors,
        hasErrors,
        successCount,
        errorCount,
        validateFiles,
        uploadFile,
        uploadFiles,
        reset
    };
}
