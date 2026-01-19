import { ref } from 'vue';
import { useApiError } from './useApiError';

export function useFileDownload() {
    const { handleError } = useApiError();
    
    const isDownloading = ref(false);
    const downloadProgress = ref(0);

    const extractFilename = (contentDisposition, fallbackUrl = '') => {
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (filenameMatch && filenameMatch[1]) {
                return filenameMatch[1].replace(/['"]/g, '');
            }
        }

        // Fallback to URL
        if (fallbackUrl) {
            const urlParts = fallbackUrl.split('/');
            return urlParts[urlParts.length - 1] || 'download';
        }

        return 'download';
    };

    const downloadBlob = (blob, filename) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        setTimeout(() => {
            window.URL.revokeObjectURL(url);
        }, 100);
    };

    const downloadFromUrl = async (url, filename = null, options = {}) => {
        const {
            onProgress = null,
            method = 'GET',
            headers = {},
            body = null
        } = options;

        isDownloading.value = true;
        downloadProgress.value = 0;

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    ...headers,
                },
                body: body ? JSON.stringify(body) : null
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const contentLength = response.headers.get('content-length');
            const total = contentLength ? parseInt(contentLength, 10) : 0;
            
            let loaded = 0;
            const reader = response.body.getReader();
            const chunks = [];

            while (true) {
                const { done, value } = await reader.read();
                
                if (done) break;
                
                chunks.push(value);
                loaded += value.length;
                
                if (total > 0) {
                    downloadProgress.value = Math.round((loaded / total) * 100);
                    if (onProgress) {
                        onProgress(downloadProgress.value, loaded, total);
                    }
                }
            }

            const blob = new Blob(chunks);
            const finalFilename = filename || extractFilename(
                response.headers.get('content-disposition'),
                url
            );

            downloadBlob(blob, finalFilename);

            return {
                success: true,
                filename: finalFilename,
                size: loaded
            };
        } catch (error) {
            handleError(error, {
                context: 'File Download',
                showToast: true
            });
            throw error;
        } finally {
            isDownloading.value = false;
            downloadProgress.value = 0;
        }
    };

    const downloadFromResponse = (response, filename = null) => {
        try {
            const blob = new Blob([response.data], {
                type: response.headers['content-type'] || 'application/octet-stream'
            });

            const finalFilename = filename || extractFilename(
                response.headers['content-disposition'],
                response.config?.url || ''
            );

            downloadBlob(blob, finalFilename);

            return {
                success: true,
                filename: finalFilename,
                size: blob.size
            };
        } catch (error) {
            handleError(error, {
                context: 'File Download',
                showToast: true
            });
            throw error;
        }
    };

    const downloadMultiple = async (downloads, options = {}) => {
        const {
            sequential = true,
            onProgress = null,
            onFileComplete = null
        } = options;

        const results = [];
        const errors = [];

        if (sequential) {
            // Download one at a time
            for (let i = 0; i < downloads.length; i++) {
                const download = downloads[i];
                
                try {
                    const result = await downloadFromUrl(
                        download.url,
                        download.filename,
                        {
                            ...download.options,
                            onProgress: (progress, loaded, total) => {
                                if (onProgress) {
                                    const totalProgress = ((i + (progress / 100)) / downloads.length) * 100;
                                    onProgress(Math.round(totalProgress), i, downloads.length);
                                }
                            }
                        }
                    );

                    results.push(result);
                    
                    if (onFileComplete) {
                        onFileComplete(result, i, downloads.length);
                    }
                } catch (error) {
                    errors.push({
                        url: download.url,
                        error
                    });
                }
            }
        } else {
            // Download in parallel
            const promises = downloads.map((download, index) =>
                downloadFromUrl(download.url, download.filename, download.options)
                    .then(result => {
                        if (onFileComplete) {
                            onFileComplete(result, index, downloads.length);
                        }
                        return result;
                    })
                    .catch(error => {
                        errors.push({
                            url: download.url,
                            error
                        });
                        return null;
                    })
            );

            const allResults = await Promise.all(promises);
            results.push(...allResults.filter(r => r !== null));
        }

        return {
            success: results.length > 0,
            results,
            errors,
            successCount: results.length,
            errorCount: errors.length
        };
    };

    const downloadAsJson = (data, filename = 'data.json') => {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        downloadBlob(blob, filename);
    };

    const downloadAsText = (text, filename = 'document.txt') => {
        const blob = new Blob([text], { type: 'text/plain' });
        downloadBlob(blob, filename);
    };

    const downloadAsCsv = (data, filename = 'data.csv', headers = []) => {
        let csv = '';
        
        if (headers.length > 0) {
            csv = headers.join(',') + '\n';
        }
        
        csv += data.map(row => {
            if (Array.isArray(row)) {
                return row.map(cell => `"${cell}"`).join(',');
            } else {
                return Object.values(row).map(cell => `"${cell}"`).join(',');
            }
        }).join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv' });
        downloadBlob(blob, filename);
    };

    return {
        isDownloading,
        downloadProgress,
        downloadFromUrl,
        downloadFromResponse,
        downloadMultiple,
        downloadBlob,
        downloadAsJson,
        downloadAsText,
        downloadAsCsv,
        extractFilename
    };
}
