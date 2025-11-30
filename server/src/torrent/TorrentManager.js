import WebTorrent from 'webtorrent';
import MemoryChunkStore from 'memory-chunk-store';

class TorrentManager {
    static instance = null;

    constructor() {
        if (TorrentManager.instance) {
            return TorrentManager.instance;
        }

        // Check if we should use memory-only storage (default: true for streaming)
        const useMemoryStorage = process.env.TORRENT_STORAGE_MODE !== 'disk';
        const pauseOnVideoPause = process.env.TORRENT_PAUSE_ON_VIDEO_PAUSE !== 'false';

        this.client = new WebTorrent();
        this.torrents = new Map(); // key: magnetURI, value: torrent object
        this.streamingFiles = new Map(); // key: `${infoHash}:${fileIndex}`, value: torrent
        this.useMemoryStorage = useMemoryStorage;
        this.pauseOnVideoPause = pauseOnVideoPause;
        TorrentManager.instance = this;

        // Log WebTorrent client initialization
        console.log(`✅ WebTorrent client initialized (Storage: ${useMemoryStorage ? 'Memory' : 'Disk'}, Pause on video pause: ${pauseOnVideoPause})`);
    }

    static getInstance() {
        if (!TorrentManager.instance) {
            TorrentManager.instance = new TorrentManager();
        }
        return TorrentManager.instance;
    }

    /**
     * Add a torrent by magnet URI
     * @param {string} magnetURI - Magnet link
     * @returns {Promise<object>} Torrent info
     */
    addTorrent(magnetURI) {
        return new Promise((resolve, reject) => {
            // Check if already exists
            if (this.torrents.has(magnetURI)) {
                const existingTorrent = this.torrents.get(magnetURI);
                resolve(this.serializeTorrent(existingTorrent));
                return;
            }

            console.log('📥 Adding torrent:', magnetURI.substring(0, 60) + '...');

            // Use memory storage if enabled
            // WebTorrent expects a constructor class, not a factory function
            // MemoryChunkStore constructor takes chunkLength as first parameter
            const options = this.useMemoryStorage ? {
                store: MemoryChunkStore
            } : {};

            // Add torrent with callback (callback fires when metadata is ready)
            // We need the callback for the torrent to appear in UI
            const torrent = this.client.add(magnetURI, options, (torrent) => {
                // Add to map first so it appears in UI
                this.torrents.set(magnetURI, torrent);
                
                // Then pause it (after a small delay to ensure it's in the map)
                setTimeout(() => {
                    torrent.pause();
                    console.log(`⏸️  Torrent paused after being added: ${torrent.name || torrent.infoHash}`);
                }, 100);
                
                console.log(`✅ Torrent added (will be paused): ${torrent.name || torrent.infoHash} (${this.useMemoryStorage ? 'Memory' : 'Disk'} storage)`);
                
                // Resolve with serialized torrent (it will show as paused in UI)
                const serialized = this.serializeTorrent(torrent);
                resolve(serialized);
            });
            
            // Set up event listeners to keep it paused if it tries to start
            if (torrent) {
                torrent.on('download', () => {
                    // If download starts before callback fires, pause it
                    if (!this.torrents.has(magnetURI)) {
                        torrent.pause();
                        console.log('⏸️  Paused torrent that started downloading before callback');
                    }
                });
            }

            torrent.on('error', (err) => {
                console.error('❌ Torrent error:', err.message);
                this.torrents.delete(magnetURI);
                reject(new Error(`Torrent error: ${err.message}`));
            });
        });
    }

    /**
     * Add a torrent from a .torrent file buffer
     * @param {Buffer} torrentBuffer - Torrent file buffer
     * @returns {Promise<object>} Torrent info
     */
    addTorrentFile(torrentBuffer) {
        return new Promise((resolve, reject) => {
            console.log('📥 Adding torrent from file...');

            // Use memory storage if enabled
            // WebTorrent expects a constructor class, not a factory function
            // MemoryChunkStore constructor takes chunkLength as first parameter
            const options = this.useMemoryStorage ? {
                store: MemoryChunkStore
            } : {};

            // Add torrent with callback (callback fires when metadata is ready)
            // We need the callback for the torrent to appear in UI
            const torrent = this.client.add(torrentBuffer, options, (torrent) => {
                // Use magnetURI as key, or infoHash if magnetURI is not available
                const key = torrent.magnetURI || torrent.infoHash;
                
                // Add to map first so it appears in UI
                this.torrents.set(key, torrent);
                
                // Then pause it (after a small delay to ensure it's in the map)
                setTimeout(() => {
                    torrent.pause();
                    console.log(`⏸️  Torrent paused after being added from file: ${torrent.name || torrent.infoHash}`);
                }, 100);
                
                console.log(`✅ Torrent added from file (will be paused): ${torrent.name || torrent.infoHash} (${this.useMemoryStorage ? 'Memory' : 'Disk'} storage)`);
                
                // Resolve with serialized torrent (it will show as paused in UI)
                const serialized = this.serializeTorrent(torrent);
                resolve(serialized);
            });
            
            // Set up event listeners to keep it paused if it tries to start
            if (torrent) {
                torrent.on('download', () => {
                    // If download starts before callback fires, pause it
                    const key = torrent.magnetURI || torrent.infoHash;
                    if (!this.torrents.has(key)) {
                        torrent.pause();
                        console.log('⏸️  Paused torrent from file that started downloading before callback');
                    }
                });
            }

            torrent.on('error', (err) => {
                console.error('❌ Torrent error:', err.message);
                reject(new Error(`Torrent error: ${err.message}`));
            });

            torrent.on('error', (err) => {
                console.error('❌ Torrent error:', err.message);
                reject(new Error(`Torrent error: ${err.message}`));
            });
        });
    }

    /**
     * Remove a torrent
     * @param {string} infoHash - Torrent info hash
     * @returns {Promise<void>}
     */
    /**
     * Remove a torrent
     * @param {string} infoHash - Torrent info hash
     * @param {boolean} deleteData - Whether to delete downloaded files
     * @returns {Promise<void>}
     */
    removeTorrent(infoHash, deleteData = false) {
        return new Promise((resolve) => {
            const torrent = this.getTorrentByInfoHash(infoHash);

            if (!torrent) {
                resolve();
                return;
            }

            console.log(`🗑️  Removing torrent: ${torrent.name || infoHash} (Delete Data: ${deleteData})`);

            const destroyOptions = { destroyStore: deleteData };

            torrent.destroy(destroyOptions, () => {
                // Remove from map
                for (const [magnetURI, t] of this.torrents.entries()) {
                    if (t.infoHash === infoHash) {
                        this.torrents.delete(magnetURI);
                        break;
                    }
                }
                resolve();
            });
        });
    }

    /**
     * Pause a torrent
     * @param {string} infoHash 
     */
    pauseTorrent(infoHash) {
        const torrent = this.getTorrentByInfoHash(infoHash);
        if (torrent) {
            torrent.pause();
            console.log('Hz Paused torrent:', infoHash);
            return true;
        }
        return false;
    }

    /**
     * Resume a torrent
     * @param {string} infoHash 
     */
    resumeTorrent(infoHash) {
        const torrent = this.getTorrentByInfoHash(infoHash);
        if (torrent) {
            console.log(`▶️  Resuming torrent: ${infoHash} (${torrent.name || 'unnamed'})`);
            torrent.resume();
            console.log(`✅ Successfully resumed torrent: ${infoHash}`);
            return true;
        }
        console.log(`❌ Torrent not found for resume: ${infoHash}`);
        return false;
    }

    /**
     * Get a torrent by info hash
     * @param {string} infoHash - Info hash
     * @returns {object|undefined} Torrent object
     */
    getTorrentByInfoHash(infoHash) {
        for (const torrent of this.torrents.values()) {
            if (torrent.infoHash === infoHash) {
                return torrent;
            }
        }
        return undefined;
    }

    /**
     * Get all torrents
     * @returns {Array} Array of serialized torrent objects
     */
    getAllTorrents() {
        return Array.from(this.torrents.values()).map(t => this.serializeTorrent(t));
    }

    /**
     * Get torrent progress and stats
     * @param {string} infoHash - Info hash
     * @returns {object|null} Progress data
     */
    getTorrentProgress(infoHash) {
        const torrent = this.getTorrentByInfoHash(infoHash);

        if (!torrent) {
            return null;
        }

        return {
            infoHash: torrent.infoHash,
            progress: torrent.progress,
            downloadSpeed: torrent.downloadSpeed,
            uploadSpeed: torrent.uploadSpeed,
            downloaded: torrent.downloaded,
            uploaded: torrent.uploaded,
            numPeers: torrent.numPeers,
            ratio: torrent.uploaded / torrent.downloaded || 0,
        };
    }

    /**
     * Serialize torrent data for API responses
     * @param {object} torrent - WebTorrent torrent object
     * @returns {object} Serialized torrent data
     */
    serializeTorrent(torrent) {
        return {
            infoHash: torrent.infoHash,
            name: torrent.name || 'Loading metadata...',
            magnetURI: torrent.magnetURI,
            paused: torrent.paused,
            progress: torrent.progress,
            downloadSpeed: torrent.paused ? 0 : torrent.downloadSpeed,
            uploadSpeed: torrent.uploadSpeed,
            downloaded: torrent.downloaded,
            uploaded: torrent.uploaded,
            length: torrent.length,
            numPeers: torrent.numPeers,
            files: torrent.files.map((file, index) => ({
                name: file.name,
                path: file.path,
                length: file.length,
                index: index,
            })),
        };
    }

    /**
     * Prioritize a file for streaming (selective downloading)
     * Does NOT resume the torrent - it stays paused until user manually starts download
     * @param {string} infoHash - Torrent info hash
     * @param {number} fileIndex - File index to prioritize
     */
    prioritizeFileForStreaming(infoHash, fileIndex) {
        const torrent = this.getTorrentByInfoHash(infoHash);
        if (!torrent || !torrent.files[fileIndex]) {
            return false;
        }

        const file = torrent.files[fileIndex];
        const key = `${infoHash}:${fileIndex}`;

        // Select this file (prioritize its pieces) - but DON'T resume torrent
        // The torrent should remain paused until user clicks download button
        file.select();
        this.streamingFiles.set(key, torrent);

        // Ensure torrent stays paused (file.select() doesn't resume, but be explicit)
        if (!torrent.paused) {
            console.log(`⚠️  Torrent was not paused when prioritizing file - this shouldn't happen`);
        }

        console.log(`🎯 Prioritizing file for streaming: ${file.name} (${infoHash}) - Torrent remains paused`);
        return true;
    }

    /**
     * Stop prioritizing a file
     * @param {string} infoHash - Torrent info hash
     * @param {number} fileIndex - File index to deprioritize
     */
    deprioritizeFile(infoHash, fileIndex) {
        const torrent = this.getTorrentByInfoHash(infoHash);
        if (!torrent || !torrent.files[fileIndex]) {
            return false;
        }

        const file = torrent.files[fileIndex];
        const key = `${infoHash}:${fileIndex}`;

        // Deselect this file
        file.deselect();
        this.streamingFiles.delete(key);

        console.log(`⏸️  Deprioritized file: ${file.name} (${infoHash})`);
        return true;
    }

    /**
     * Pause torrent download (for when video is paused)
     * @param {string} infoHash - Torrent info hash
     */
    pauseTorrentDownload(infoHash) {
        const torrent = this.getTorrentByInfoHash(infoHash);
        if (torrent && !torrent.paused) {
            torrent.pause();
            console.log(`⏸️  Paused torrent download: ${infoHash}`);
            return true;
        }
        return false;
    }

    /**
     * Resume torrent download (for when video resumes)
     * Only resumes if pause-on-video-pause is enabled
     * @param {string} infoHash - Torrent info hash
     */
    resumeTorrentDownload(infoHash) {
        // Only auto-resume if pause-on-video-pause feature is enabled
        if (!this.pauseOnVideoPause) {
            return false;
        }
        const torrent = this.getTorrentByInfoHash(infoHash);
        if (torrent && torrent.paused) {
            torrent.resume();
            console.log(`▶️  Resumed torrent download (video play): ${infoHash}`);
            return true;
        }
        return false;
    }

    /**
     * Cleanup all torrents (for shutdown)
     */
    destroy() {
        console.log('🛑 Destroying all torrents...');
        this.client.destroy();
        this.torrents.clear();
        this.streamingFiles.clear();
    }
}

export default TorrentManager.getInstance();
