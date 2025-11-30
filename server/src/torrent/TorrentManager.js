import WebTorrent from 'webtorrent';

class TorrentManager {
    static instance = null;

    constructor() {
        if (TorrentManager.instance) {
            return TorrentManager.instance;
        }

        this.client = new WebTorrent();
        this.torrents = new Map(); // key: magnetURI, value: torrent object
        TorrentManager.instance = this;

        // Log WebTorrent client initialization
        console.log('✅ WebTorrent client initialized');
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

            const torrent = this.client.add(magnetURI, (torrent) => {
                this.torrents.set(magnetURI, torrent);
                console.log('✅ Torrent added:', torrent.name || torrent.infoHash);
                resolve(this.serializeTorrent(torrent));
            });

            torrent.on('error', (err) => {
                console.error('❌ Torrent error:', err.message);
                this.torrents.delete(magnetURI);
                reject(new Error(`Torrent error: ${err.message}`));
            });
        });
    }

    /**
     * Remove a torrent
     * @param {string} infoHash - Torrent info hash
     * @returns {Promise<void>}
     */
    removeTorrent(infoHash) {
        return new Promise((resolve) => {
            const torrent = this.getTorrentByInfoHash(infoHash);

            if (!torrent) {
                resolve();
                return;
            }

            console.log('🗑️  Removing torrent:', torrent.name || infoHash);

            torrent.destroy(() => {
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
            progress: torrent.progress,
            downloadSpeed: torrent.downloadSpeed,
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
     * Cleanup all torrents (for shutdown)
     */
    destroy() {
        console.log('🛑 Destroying all torrents...');
        this.client.destroy();
        this.torrents.clear();
    }
}

export default TorrentManager.getInstance();
