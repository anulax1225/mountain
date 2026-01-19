export function useFileSize() {
    const formatBytes = (bytes, decimals = 2) => {
        if (!bytes || bytes === 0) return '0 octets';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['octets', 'Ko', 'Mo', 'Go', 'To', 'Po'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));
        const size = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

        return `${size} ${sizes[i]}`;
    };

    const formatBytesShort = (bytes) => {
        if (!bytes || bytes === 0) return '0B';

        const k = 1024;
        const sizes = ['B', 'K', 'M', 'G', 'T', 'P'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));
        const size = Math.round(bytes / Math.pow(k, i));

        return `${size}${sizes[i]}`;
    };

    const parseFileSize = (sizeString) => {
        if (!sizeString) return 0;

        const match = sizeString.match(/^([\d.]+)\s*([KMGTP]?B|octets?)$/i);
        if (!match) return 0;

        const size = parseFloat(match[1]);
        const unit = match[2].toUpperCase();

        const units = {
            'B': 1,
            'OCTETS': 1,
            'KB': 1024,
            'K': 1024,
            'KO': 1024,
            'MB': 1024 * 1024,
            'M': 1024 * 1024,
            'MO': 1024 * 1024,
            'GB': 1024 * 1024 * 1024,
            'G': 1024 * 1024 * 1024,
            'GO': 1024 * 1024 * 1024,
            'TB': 1024 * 1024 * 1024 * 1024,
            'T': 1024 * 1024 * 1024 * 1024,
            'TO': 1024 * 1024 * 1024 * 1024,
            'PB': 1024 * 1024 * 1024 * 1024 * 1024,
            'P': 1024 * 1024 * 1024 * 1024 * 1024,
            'PO': 1024 * 1024 * 1024 * 1024 * 1024
        };

        return size * (units[unit] || 1);
    };

    const convertTo = (bytes, targetUnit) => {
        if (!bytes || bytes === 0) return 0;

        const units = {
            'bytes': 1,
            'KB': 1024,
            'MB': 1024 * 1024,
            'GB': 1024 * 1024 * 1024,
            'TB': 1024 * 1024 * 1024 * 1024
        };

        const divisor = units[targetUnit] || 1;
        return bytes / divisor;
    };

    const getFileSizeCategory = (bytes) => {
        if (!bytes || bytes === 0) return 'empty';
        if (bytes < 1024) return 'tiny'; // < 1 KB
        if (bytes < 1024 * 1024) return 'small'; // < 1 MB
        if (bytes < 10 * 1024 * 1024) return 'medium'; // < 10 MB
        if (bytes < 100 * 1024 * 1024) return 'large'; // < 100 MB
        return 'huge'; // >= 100 MB
    };

    const compareFileSizes = (bytes1, bytes2) => {
        return bytes1 - bytes2;
    };

    const sumFileSizes = (bytesArray) => {
        return bytesArray.reduce((sum, bytes) => sum + bytes, 0);
    };

    const averageFileSize = (bytesArray) => {
        if (!bytesArray || bytesArray.length === 0) return 0;
        return sumFileSizes(bytesArray) / bytesArray.length;
    };

    const formatSpeed = (bytesPerSecond, decimals = 2) => {
        if (!bytesPerSecond || bytesPerSecond === 0) return '0 octets/s';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['octets/s', 'Ko/s', 'Mo/s', 'Go/s'];

        const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k));
        const speed = parseFloat((bytesPerSecond / Math.pow(k, i)).toFixed(dm));

        return `${speed} ${sizes[i]}`;
    };

    const estimateDownloadTime = (bytes, speedBytesPerSecond) => {
        if (!bytes || !speedBytesPerSecond) return 0;
        return Math.ceil(bytes / speedBytesPerSecond);
    };

    const formatDownloadTime = (seconds) => {
        if (seconds < 60) return `${seconds}s`;
        if (seconds < 3600) {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
        }
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    };

    return {
        formatBytes,
        formatBytesShort,
        parseFileSize,
        convertTo,
        getFileSizeCategory,
        compareFileSizes,
        sumFileSizes,
        averageFileSize,
        formatSpeed,
        estimateDownloadTime,
        formatDownloadTime
    };
}

// Export as standalone utility functions as well
export const formatBytes = (bytes, decimals = 2) => {
    const { formatBytes: fn } = useFileSize();
    return fn(bytes, decimals);
};

export const formatBytesShort = (bytes) => {
    const { formatBytesShort: fn } = useFileSize();
    return fn(bytes);
};

export const parseFileSize = (sizeString) => {
    const { parseFileSize: fn } = useFileSize();
    return fn(sizeString);
};
