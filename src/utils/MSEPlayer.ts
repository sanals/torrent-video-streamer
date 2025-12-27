/**
 * MSEPlayer - MediaSource Extensions player for seekable transcoded streams
 * 
 * This player enables true seeking in transcoded video streams by:
 * 1. Using the MediaSource API to control media playback
 * 2. Fetching segments on-demand from the backend
 * 3. Managing buffer state and cleanup
 */

import { API_BASE_URL } from '@/config';

export interface MSEPlayerConfig {
    videoElement: HTMLVideoElement;
    infoHash: string;
    fileIndex: number;
    audioTrack: number;
    onError?: (error: Error) => void;
    onBuffering?: (isBuffering: boolean) => void;
    onReady?: () => void;
}

interface MSEManifest {
    success: boolean;
    duration: number;
    segmentDuration: number;
    mimeType: string;
    videoWidth?: number;
    videoHeight?: number;
}

type SegmentLoadState = 'loading' | 'loaded' | 'error';

/**
 * MSEPlayer handles MediaSource-based video playback with segment fetching
 */
export class MSEPlayer {
    private config: MSEPlayerConfig;
    private mediaSource: MediaSource | null = null;
    private sourceBuffer: SourceBuffer | null = null;
    private objectUrl: string | null = null;

    // Stream metadata
    private manifest: MSEManifest | null = null;
    private segmentDuration: number = 6;
    private totalDuration: number = 0;

    // Segment tracking
    private segmentStates: Map<number, SegmentLoadState> = new Map();
    private pendingAppends: { data: ArrayBuffer; startTime: number | null }[] = [];
    private isAppending: boolean = false;
    private lastAppendedSegment: number = -1;

    // State management
    private isInitialized: boolean = false;
    private isDestroyed: boolean = false;
    private initSegmentLoaded: boolean = false;

    // Bound event handlers (for cleanup)
    private boundOnSourceOpen: () => void;
    private boundOnTimeUpdate: () => void;
    private boundOnSeeking: () => void;
    private boundOnWaiting: () => void;
    private boundOnPlaying: () => void;

    constructor(config: MSEPlayerConfig) {
        this.config = config;

        // Bind event handlers
        this.boundOnSourceOpen = this.onSourceOpen.bind(this);
        this.boundOnTimeUpdate = this.onTimeUpdate.bind(this);
        this.boundOnSeeking = this.onSeeking.bind(this);
        this.boundOnWaiting = this.onWaiting.bind(this);
        this.boundOnPlaying = this.onPlaying.bind(this);
    }

    /**
     * Initialize the MSE player - fetches manifest and sets up MediaSource
     */
    async initialize(): Promise<void> {
        if (this.isDestroyed) {
            throw new Error('Player has been destroyed');
        }

        // Check MSE support
        if (!('MediaSource' in window)) {
            throw new Error('MediaSource Extensions not supported');
        }

        try {
            // Fetch manifest first to get duration and MIME type
            this.manifest = await this.fetchManifest();
            this.segmentDuration = this.manifest.segmentDuration || 6;
            this.totalDuration = this.manifest.duration || 0;

            console.log(`📺 MSE: Manifest loaded - duration: ${this.totalDuration}s, segments: ${this.segmentDuration}s`);

            // Check MIME type support
            if (!MediaSource.isTypeSupported(this.manifest.mimeType)) {
                console.warn(`⚠️ MIME type not supported: ${this.manifest.mimeType}`);
                // Try fallback MIME types
                const fallbackMimeTypes = [
                    'video/mp4; codecs="avc1.42E01E, mp4a.40.2"',
                    'video/mp4; codecs="avc1.4D401E, mp4a.40.2"',
                    'video/mp4',
                ];

                const supportedMime = fallbackMimeTypes.find(mime => MediaSource.isTypeSupported(mime));
                if (supportedMime) {
                    this.manifest.mimeType = supportedMime;
                    console.log(`📺 MSE: Using fallback MIME: ${supportedMime}`);
                } else {
                    throw new Error('No supported MIME type found');
                }
            }

            // Create MediaSource
            this.mediaSource = new MediaSource();
            this.mediaSource.addEventListener('sourceopen', this.boundOnSourceOpen);

            // Create object URL and attach to video
            this.objectUrl = URL.createObjectURL(this.mediaSource);
            this.config.videoElement.src = this.objectUrl;

        } catch (error) {
            console.error('❌ MSE initialization failed:', error);
            this.config.onError?.(error as Error);
            throw error;
        }
    }

    /**
     * Handle MediaSource 'sourceopen' event
     */
    private async onSourceOpen(): Promise<void> {
        if (this.isDestroyed || !this.mediaSource || !this.manifest) return;

        console.log('📺 MSE: Source opened');

        try {
            // Create SourceBuffer with correct MIME type
            this.sourceBuffer = this.mediaSource.addSourceBuffer(this.manifest.mimeType);
            this.sourceBuffer.mode = 'sequence'; // Use sequence mode for gapless playback

            // Handle SourceBuffer events
            this.sourceBuffer.addEventListener('updateend', () => {
                this.isAppending = false;
                this.processPendingAppends();
            });

            this.sourceBuffer.addEventListener('error', (e) => {
                console.error('❌ SourceBuffer error:', e);
                this.config.onError?.(new Error('SourceBuffer error'));
            });

            // Set duration if known
            if (this.totalDuration > 0 && this.mediaSource.readyState === 'open') {
                this.mediaSource.duration = this.totalDuration;
            }

            // Load init segment
            await this.loadInitSegment();

            // Load first segment
            await this.loadSegment(0);

            // Set up video element event listeners
            const video = this.config.videoElement;
            video.addEventListener('timeupdate', this.boundOnTimeUpdate);
            video.addEventListener('seeking', this.boundOnSeeking);
            video.addEventListener('waiting', this.boundOnWaiting);
            video.addEventListener('playing', this.boundOnPlaying);

            this.isInitialized = true;
            this.config.onReady?.();

        } catch (error) {
            console.error('❌ MSE sourceopen error:', error);
            this.config.onError?.(error as Error);
        }
    }

    /**
     * Fetch the stream manifest from backend
     */
    private async fetchManifest(): Promise<MSEManifest> {
        const { infoHash, fileIndex, audioTrack } = this.config;
        const url = `${API_BASE_URL.replace('/api', '')}/api/stream-mse/${infoHash}/${fileIndex}/manifest?audioTrack=${audioTrack}`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch manifest: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Load the initialization segment (ftyp + moov)
     */
    private async loadInitSegment(): Promise<void> {
        if (this.initSegmentLoaded || this.isDestroyed) return;

        console.log('📺 MSE: Loading init segment');

        const { infoHash, fileIndex, audioTrack } = this.config;
        const url = `${API_BASE_URL.replace('/api', '')}/api/stream-mse/${infoHash}/${fileIndex}/init?audioTrack=${audioTrack}`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch init segment: ${response.status}`);
        }

        const data = await response.arrayBuffer();

        // Reset state for new init segment
        this.lastAppendedSegment = -1;

        await this.appendBuffer(data, null);

        this.initSegmentLoaded = true;
        console.log('📺 MSE: Init segment loaded');
    }

    /**
     * Load a media segment by index
     */
    private async loadSegment(segmentIndex: number): Promise<void> {
        if (this.isDestroyed) return;

        // Check if already loading or loaded
        const state = this.segmentStates.get(segmentIndex);
        if (state === 'loading' || state === 'loaded') {
            return;
        }

        // Check bounds
        const maxSegment = Math.ceil(this.totalDuration / this.segmentDuration);
        if (segmentIndex < 0 || segmentIndex >= maxSegment) {
            return;
        }

        this.segmentStates.set(segmentIndex, 'loading');
        this.config.onBuffering?.(true);

        const startTime = segmentIndex * this.segmentDuration;
        console.log(`📺 MSE: Loading segment ${segmentIndex} (t=${startTime}s)`);

        // Retry logic
        const maxRetries = 3;
        let lastError: Error | null = null;

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                const { infoHash, fileIndex, audioTrack } = this.config;
                const url = `${API_BASE_URL.replace('/api', '')}/api/stream-mse/${infoHash}/${fileIndex}/segment?t=${startTime}&dur=${this.segmentDuration}&audioTrack=${audioTrack}`;

                const response = await fetch(url);

                if (response.status === 503) {
                    // Torrent data not ready - wait and retry
                    console.log(`📺 MSE: Segment ${segmentIndex} - data not ready, retrying in 2s (attempt ${attempt + 1}/${maxRetries})`);
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    continue;
                }

                if (!response.ok) {
                    throw new Error(`Failed to fetch segment: ${response.status}`);
                }

                const data = await response.arrayBuffer();

                if (data.byteLength === 0) {
                    throw new Error('Received empty segment');
                }

                if (this.isDestroyed) return;

                // Determine if we need to set timestampOffset (discontinuity)
                // If this is the next sequential segment, let "sequence" mode handle it.
                // If it's a seek or out of order, force the offset.
                let offset: number | null = null;
                if (segmentIndex !== this.lastAppendedSegment + 1) {
                    offset = startTime;
                    console.log(`📺 MSE: Discontinuity detected (last=${this.lastAppendedSegment}, curr=${segmentIndex}), setting offset to ${offset}s`);
                }

                console.log(`📺 MSE: Appending segment ${segmentIndex} (${data.byteLength} bytes) ${offset !== null ? `at offset ${offset}s` : 'sequentially'}`);
                await this.appendBuffer(data, offset);

                this.lastAppendedSegment = segmentIndex;

                this.segmentStates.set(segmentIndex, 'loaded');
                console.log(`📺 MSE: Segment ${segmentIndex} loaded successfully`);
                this.config.onBuffering?.(false);
                return; // Success!

            } catch (error) {
                lastError = error as Error;
                console.warn(`📺 MSE: Segment ${segmentIndex} attempt ${attempt + 1} failed:`, lastError.message);

                // Wait before retry
                if (attempt < maxRetries - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        }

        // All retries failed
        console.error(`❌ MSE: Failed to load segment ${segmentIndex} after ${maxRetries} attempts:`, lastError);
        this.segmentStates.set(segmentIndex, 'error');
        this.config.onBuffering?.(false);

        // Clear error state after 5 seconds so we can try again
        setTimeout(() => {
            if (this.segmentStates.get(segmentIndex) === 'error') {
                this.segmentStates.delete(segmentIndex);
            }
        }, 5000);
    }

    /**
     * Append data to the SourceBuffer
     */
    private async appendBuffer(data: ArrayBuffer, startTime: number | null): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.sourceBuffer || this.isDestroyed) {
                reject(new Error('SourceBuffer not available'));
                return;
            }

            // If currently updating, queue the append
            if (this.sourceBuffer.updating || this.isAppending) {
                this.pendingAppends.push({ data, startTime });
                // Wait for this append to be processed
                const checkInterval = setInterval(() => {
                    const found = this.pendingAppends.find(item => item.data === data);
                    if (!found) {
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 50);
                return;
            }

            this.isAppending = true;

            const onUpdateEnd = () => {
                this.sourceBuffer?.removeEventListener('updateend', onUpdateEnd);
                this.sourceBuffer?.removeEventListener('error', onError);
                resolve();
            };

            const onError = (_e: Event) => {
                this.sourceBuffer?.removeEventListener('updateend', onUpdateEnd);
                this.sourceBuffer?.removeEventListener('error', onError);
                reject(new Error('SourceBuffer append error'));
            };

            this.sourceBuffer.addEventListener('updateend', onUpdateEnd);
            this.sourceBuffer.addEventListener('error', onError);

            try {
                // Set the timestamp offset if provided (for discontinuities)
                if (startTime !== null) {
                    // Abort current operations to ensure clean state for timestampOffset change
                    if (this.sourceBuffer.updating) {
                        this.sourceBuffer.abort();
                    }
                    this.sourceBuffer.timestampOffset = startTime;
                }

                this.sourceBuffer.appendBuffer(data);
            } catch (error) {
                this.sourceBuffer.removeEventListener('updateend', onUpdateEnd);
                this.sourceBuffer.removeEventListener('error', onError);
                this.isAppending = false;
                reject(error);
            }
        });
    }

    /**
     * Process queued appends
     */
    private processPendingAppends(): void {
        if (this.pendingAppends.length === 0 || !this.sourceBuffer || this.sourceBuffer.updating) {
            return;
        }

        const item = this.pendingAppends.shift();
        if (item) {
            this.isAppending = true;
            try {
                if (item.startTime !== null) {
                    this.sourceBuffer.timestampOffset = item.startTime;
                }
                this.sourceBuffer.appendBuffer(item.data);
            } catch (error) {
                console.error('❌ MSE: Error appending buffered data:', error);
                this.isAppending = false;
                this.processPendingAppends();
            }
        }
    }

    /**
     * Handle video timeupdate - preload upcoming segments
     */
    private onTimeUpdate(): void {
        if (!this.isInitialized || this.isDestroyed) return;

        const video = this.config.videoElement;
        const currentTime = video.currentTime;

        // Calculate current and next segment indices
        const currentSegment = Math.floor(currentTime / this.segmentDuration);
        const nextSegment = currentSegment + 1;

        // Preload next segment if not already loaded
        const nextState = this.segmentStates.get(nextSegment);
        if (!nextState || nextState === 'error') {
            this.loadSegment(nextSegment);
        }

        // Periodically clean up old buffers
        if (currentTime > 60 && currentSegment % 5 === 0) {
            this.cleanupOldBuffers();
        }
    }

    /**
     * Handle video seeking event
     */
    private async onSeeking(): Promise<void> {
        if (!this.isInitialized || this.isDestroyed) return;

        const video = this.config.videoElement;
        const seekTime = video.currentTime;
        const targetSegment = Math.floor(seekTime / this.segmentDuration);

        console.log(`📺 MSE: Seeking to ${seekTime}s (segment ${targetSegment})`);

        // Load the target segment if not available
        const state = this.segmentStates.get(targetSegment);
        if (state !== 'loaded') {
            await this.loadSegment(targetSegment);
        }

        // Also preload the next segment
        this.loadSegment(targetSegment + 1);
    }

    /**
     * Handle video waiting event (buffering)
     */
    private onWaiting(): void {
        this.config.onBuffering?.(true);

        // Try to load the needed segment and the next one
        const video = this.config.videoElement;
        const targetSegment = Math.floor(video.currentTime / this.segmentDuration);

        console.log(`📺 MSE: Waiting at ${video.currentTime}s, need segment ${targetSegment}`);

        // Reset error state if it was an error so we can retry
        if (this.segmentStates.get(targetSegment) === 'error') {
            this.segmentStates.delete(targetSegment);
        }

        this.loadSegment(targetSegment);

        // Also preload next segment
        const nextSegment = targetSegment + 1;
        if (this.segmentStates.get(nextSegment) === 'error') {
            this.segmentStates.delete(nextSegment);
        }
        this.loadSegment(nextSegment);
    }

    /**
     * Handle video playing event
     */
    private onPlaying(): void {
        this.config.onBuffering?.(false);
    }

    /**
     * Get the total duration of the video
     */
    getDuration(): number {
        return this.totalDuration;
    }

    /**
     * Check if a time range is buffered
     */
    isBuffered(time: number): boolean {
        const video = this.config.videoElement;
        const buffered = video.buffered;

        for (let i = 0; i < buffered.length; i++) {
            if (time >= buffered.start(i) && time <= buffered.end(i)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Clean up old segments to free buffer quota
     */
    private cleanupOldBuffers(): void {
        if (!this.sourceBuffer || this.sourceBuffer.updating || this.isDestroyed) return;

        const video = this.config.videoElement;
        const currentTime = video.currentTime;
        const buffered = video.buffered;

        // Remove data more than 30 seconds behind current time
        const cleanupThreshold = 30;

        for (let i = 0; i < buffered.length; i++) {
            const start = buffered.start(i);
            const end = Math.min(buffered.end(i), currentTime - cleanupThreshold);

            if (end > start) {
                try {
                    this.sourceBuffer.remove(start, end);
                    console.log(`📺 MSE: Removed buffer ${start}s - ${end}s`);

                    // Mark segments as unloaded
                    const startSegment = Math.floor(start / this.segmentDuration);
                    const endSegment = Math.floor(end / this.segmentDuration);
                    for (let s = startSegment; s <= endSegment; s++) {
                        this.segmentStates.delete(s);
                    }

                    break; // Only remove one range at a time
                } catch (e) {
                    console.warn('MSE: Error removing buffer:', e);
                }
            }
        }
    }

    /**
     * Destroy the player and clean up resources
     */
    destroy(): void {
        if (this.isDestroyed) return;

        console.log('📺 MSE: Destroying player');
        this.isDestroyed = true;

        // Remove video event listeners
        const video = this.config.videoElement;
        video.removeEventListener('timeupdate', this.boundOnTimeUpdate);
        video.removeEventListener('seeking', this.boundOnSeeking);
        video.removeEventListener('waiting', this.boundOnWaiting);
        video.removeEventListener('playing', this.boundOnPlaying);

        // Clean up MediaSource
        if (this.mediaSource) {
            this.mediaSource.removeEventListener('sourceopen', this.boundOnSourceOpen);

            if (this.mediaSource.readyState === 'open') {
                try {
                    if (this.sourceBuffer) {
                        this.mediaSource.removeSourceBuffer(this.sourceBuffer);
                    }
                    this.mediaSource.endOfStream();
                } catch (e) {
                    // Ignore errors during cleanup
                }
            }
        }

        // Revoke object URL
        if (this.objectUrl) {
            URL.revokeObjectURL(this.objectUrl);
        }

        // Clear video src
        video.src = '';
        video.load();

        // Clear state
        this.mediaSource = null;
        this.sourceBuffer = null;
        this.objectUrl = null;
        this.manifest = null;
        this.segmentStates.clear();
        this.pendingAppends = [];
    }
}

export default MSEPlayer;
