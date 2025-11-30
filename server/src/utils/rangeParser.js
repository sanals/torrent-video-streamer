/**
 * Parse HTTP Range header
 * @param {string} rangeHeader - Range header value (e.g., "bytes=0-1023")
 * @param {number} fileSize - Total file size
 * @returns {{ start: number, end: number } | null}
 */
export function parseRange(rangeHeader, fileSize) {
    if (!rangeHeader) {
        return null;
    }

    const parts = rangeHeader.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    // Validate range
    if (isNaN(start) || isNaN(end) || start > end || end >= fileSize) {
        return null;
    }

    return { start, end };
}

/**
 * Get MIME type from file extension
 * @param {string} filename - File name
 * @returns {string} MIME type
 */
export function getMimeType(filename) {
    const ext = filename.split('.').pop()?.toLowerCase();

    const mimeTypes = {
        'mp4': 'video/mp4',
        'mkv': 'video/x-matroska',
        'avi': 'video/x-msvideo',
        'mov': 'video/quicktime',
        'wmv': 'video/x-ms-wmv',
        'flv': 'video/x-flv',
        'webm': 'video/webm',
        'ogv': 'video/ogg',
        'm4v': 'video/x-m4v',
        'mpg': 'video/mpeg',
        'mpeg': 'video/mpeg',
    };

    return mimeTypes[ext] || 'video/mp4';
}
