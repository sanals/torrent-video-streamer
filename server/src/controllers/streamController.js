import torrentManager from '../torrent/TorrentManager.js';
import { parseRange, getMimeType } from '../utils/rangeParser.js';

/**
 * Stream video file with range request support
 */
export async function streamVideo(req, res, next) {
    try {
        const { infoHash, fileIndex } = req.params;
        const range = req.headers.range;

        // Get torrent
        const torrent = torrentManager.getTorrentByInfoHash(infoHash);
        if (!torrent) {
            return res.status(404).json({
                success: false,
                error: 'Torrent not found',
            });
        }

        // Get file
        const fileIdx = parseInt(fileIndex, 10);
        const file = torrent.files[fileIdx];

        if (!file) {
            return res.status(404).json({
                success: false,
                error: 'File not found',
            });
        }

        // Prioritize this file for streaming (selective downloading)
        torrentManager.prioritizeFileForStreaming(infoHash, fileIdx);

        const fileSize = file.length;
        const mimeType = getMimeType(file.name);

        // Parse range header
        let start = 0;
        let end = fileSize - 1;
        let statusCode = 200;
        let contentLength = fileSize;

        if (range) {
            const parsedRange = parseRange(range, fileSize);

            if (!parsedRange) {
                return res.status(416).json({
                    success: false,
                    error: 'Range not satisfiable',
                });
            }

            start = parsedRange.start;
            end = parsedRange.end;
            contentLength = end - start + 1;
            statusCode = 206; // Partial Content
        }

        // Set response headers
        const headers = {
            'Content-Type': mimeType,
            'Accept-Ranges': 'bytes',
            'Content-Length': contentLength,
        };

        if (statusCode === 206) {
            headers['Content-Range'] = `bytes ${start}-${end}/${fileSize}`;
        }

        res.writeHead(statusCode, headers);

        // Create read stream
        const stream = file.createReadStream({ start, end });

        // Handle stream errors
        stream.on('error', (error) => {
            console.error('❌ Stream error:', error.message);
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    error: 'Stream error',
                });
            }
        });

        // Pipe stream to response
        stream.pipe(res);

        // Cleanup on client disconnect
        req.on('close', () => {
            stream.destroy();
        });

    } catch (error) {
        next(error);
    }
}
