import { ref, computed } from 'vue';
import owl from '@/owl-sdk.js';
import { useApiError } from './useApiError';
import { UPLOAD } from '@/lib/editorConstants.js';

export function useChunkedUpload(options = {}) {
    const {
        maxFileSize = UPLOAD.MAX_FILE_SIZE,
        allowedTypes = UPLOAD.ALLOWED_TYPES,
        chunkSize = UPLOAD.CHUNK_SIZE,
        chunkedThreshold = UPLOAD.CHUNKED_THRESHOLD,
        maxRetries = UPLOAD.MAX_RETRIES,
        maxConcurrent = UPLOAD.MAX_CONCURRENT,
    } = options;

    const { handleError } = useApiError();

    let fileIdCounter = 0;
    const files = ref([]);
    const isSubmitting = ref(false);

    // Queue for files waiting to start S3 upload
    const uploadQueue = [];
    let activeUploads = 0;

    const overallProgress = computed(() => {
        const tracked = files.value.filter(f => f.status !== 'error' || f.progress > 0);
        if (tracked.length === 0) return 0;
        const total = tracked.reduce((sum, f) => sum + f.progress, 0);
        return Math.round(total / tracked.length);
    });

    const readyCount = computed(() => files.value.filter(f => f.status === 'ready').length);
    const uploadingCount = computed(() => files.value.filter(f => f.status === 'uploading').length);
    const completedCount = computed(() => files.value.filter(f => f.status === 'ready' || f.status === 'complete').length);
    const errorCount = computed(() => files.value.filter(f => f.status === 'error').length);
    const isUploading = computed(() => uploadingCount.value > 0);

    const canSubmit = computed(() => readyCount.value > 0 && !isSubmitting.value);

    const validateFile = (file) => {
        const errors = [];

        if (!allowedTypes.includes(file.type)) {
            errors.push(`Type de fichier non supporté. Types acceptés : ${allowedTypes.join(', ')}`);
        }

        if (file.size > maxFileSize) {
            const maxMB = Math.round(maxFileSize / (1024 * 1024));
            errors.push(`Fichier trop volumineux. Taille maximale : ${maxMB} Mo`);
        }

        return errors;
    };

    const simulateProgress = (entry) => {
        let current = 0;
        const interval = setInterval(() => {
            if (entry.status !== 'uploading') {
                clearInterval(interval);
                return;
            }
            current = Math.min(current + Math.random() * 8 + 2, 85);
            entry.progress = Math.round(current);
        }, 300);
        return () => clearInterval(interval);
    };

    const uploadSmallFile = async (entry) => {
        const stopSimulation = simulateProgress(entry);
        try {
            const result = await owl.chunkedUpload.directUpload(entry.file);
            stopSimulation();
            entry.progress = 95;
            return result;
        } catch (error) {
            stopSimulation();
            throw error;
        }
    };

    const uploadLargeFile = async (entry) => {
        const file = entry.file;
        const totalChunks = Math.ceil(file.size / chunkSize);

        const { upload_id: uploadId, key } = await owl.chunkedUpload.initiate(
            file.name,
            file.type || 'application/octet-stream'
        );

        entry._uploadId = uploadId;
        entry._key = key;

        const parts = [];

        for (let i = 0; i < totalChunks; i++) {
            const start = i * chunkSize;
            const end = Math.min(start + chunkSize, file.size);
            const chunk = file.slice(start, end);
            const partNumber = i + 1;

            let lastError = null;
            let success = false;

            for (let attempt = 0; attempt <= maxRetries; attempt++) {
                try {
                    const result = await owl.chunkedUpload.uploadPart(uploadId, key, partNumber, chunk);
                    parts.push({ PartNumber: partNumber, ETag: result.etag });
                    success = true;
                    break;
                } catch (error) {
                    lastError = error;
                    if (attempt < maxRetries) {
                        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
                    }
                }
            }

            if (!success) {
                try {
                    await owl.chunkedUpload.abort(uploadId, key);
                } catch (_) { /* ignore abort errors */ }
                throw lastError;
            }

            entry.progress = Math.round(((i + 1) / totalChunks) * 95);
        }

        await owl.chunkedUpload.complete(uploadId, key, parts);
        return { key, filename: file.name, size: file.size, mime: file.type || 'application/octet-stream' };
    };

    const uploadToS3 = async (entry) => {
        entry.status = 'uploading';
        entry.progress = 0;

        try {
            let s3Result;
            if (entry.file.size > chunkedThreshold) {
                s3Result = await uploadLargeFile(entry);
            } else {
                s3Result = await uploadSmallFile(entry);
            }

            entry.s3Result = s3Result;
            entry.progress = 100;
            entry.status = 'ready';
        } catch (error) {
            entry.status = 'error';
            entry.error = handleError(error, { showToast: false, context: `Upload ${entry.file.name}` });
        } finally {
            activeUploads--;
            processQueue();
        }
    };

    const processQueue = () => {
        while (uploadQueue.length > 0 && activeUploads < maxConcurrent) {
            const entry = uploadQueue.shift();
            // Entry may have been removed while queued
            if (!files.value.find(f => f.id === entry.id)) continue;
            activeUploads++;
            uploadToS3(entry);
        }
    };

    const addFiles = (newFiles) => {
        for (const file of newFiles) {
            const id = ++fileIdCounter;
            const thumbnailUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;

            const errors = validateFile(file);

            files.value.push({
                id,
                file,
                status: errors.length > 0 ? 'error' : 'uploading',
                progress: 0,
                error: errors.length > 0 ? errors.join('. ') : null,
                thumbnailUrl,
                s3Result: null,
                _uploadId: null,
                _key: null,
            });

            if (errors.length === 0) {
                const entry = files.value[files.value.length - 1];
                uploadQueue.push(entry);
            }
        }

        processQueue();
    };

    const removeFile = (fileId) => {
        const index = files.value.findIndex(f => f.id === fileId);
        if (index !== -1) {
            const entry = files.value[index];
            // Remove from queue if still queued
            const queueIndex = uploadQueue.indexOf(entry);
            if (queueIndex !== -1) uploadQueue.splice(queueIndex, 1);
            if (entry.thumbnailUrl) {
                URL.revokeObjectURL(entry.thumbnailUrl);
            }
            files.value.splice(index, 1);
        }
    };

    const retryFile = (fileId) => {
        const entry = files.value.find(f => f.id === fileId);
        if (entry && entry.status === 'error') {
            entry.status = 'uploading';
            entry.progress = 0;
            entry.error = null;
            entry.s3Result = null;
            uploadQueue.push(entry);
            processQueue();
        }
    };

    const submitAll = async (sceneSlug) => {
        isSubmitting.value = true;
        let successCount = 0;
        let errorCountVal = 0;

        const readyFiles = files.value.filter(f => f.status === 'ready' && f.s3Result);

        for (const entry of readyFiles) {
            entry.status = 'submitting';
            try {
                await owl.images.upload(sceneSlug, {
                    key: entry.s3Result.key,
                    name: entry.s3Result.filename,
                    size: entry.s3Result.size,
                    mime: entry.s3Result.mime,
                });
                entry.status = 'complete';
                successCount++;
            } catch (error) {
                entry.status = 'error';
                entry.error = handleError(error, { showToast: false, context: `Enregistrement ${entry.file.name}` });
                errorCountVal++;
            }
        }

        isSubmitting.value = false;

        return {
            success: successCount > 0,
            successCount,
            errorCount: errorCountVal,
        };
    };

    const abortAll = () => {
        uploadQueue.length = 0;
        for (const entry of files.value) {
            if (entry.status === 'uploading' && entry._uploadId && entry._key) {
                owl.chunkedUpload.abort(entry._uploadId, entry._key).catch(() => {});
            }
        }
        activeUploads = 0;
    };

    const reset = () => {
        abortAll();
        files.value.forEach(entry => {
            if (entry.thumbnailUrl) {
                URL.revokeObjectURL(entry.thumbnailUrl);
            }
        });
        files.value = [];
        isSubmitting.value = false;
    };

    return {
        files,
        isUploading,
        isSubmitting,
        overallProgress,
        readyCount,
        completedCount,
        errorCount,
        canSubmit,
        addFiles,
        removeFile,
        retryFile,
        submitAll,
        abortAll,
        reset,
    };
}