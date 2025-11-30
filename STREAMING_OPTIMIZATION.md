# Video Streaming Optimization Guide

## Current Behavior

### How It Works Now

1. **Server-side (Node.js)**: 
   - WebTorrent downloads torrent pieces to **disk** (or memory)
   - Pieces are downloaded in order or based on availability
   - When you request a video chunk, it streams pieces that are already downloaded

2. **Client-side (Browser)**:
   - Browser makes HTTP range requests for specific video chunks
   - Server streams pieces from disk/memory
   - Video player buffers ahead for smooth playback

3. **The Problem**:
   - WebTorrent downloads pieces even when video is paused
   - Pieces are saved to disk permanently (unless deleted)
   - Network usage continues even when not watching

## Your Options

### Option 1: Memory-Only Storage (Recommended for Streaming)
**What it does**: Stores pieces in RAM instead of disk
- ✅ No disk writes (saves storage)
- ✅ Faster access (RAM is faster)
- ✅ Automatically cleared when torrent removed
- ⚠️ Uses more RAM
- ⚠️ Lost on server restart

**Best for**: Streaming-only use cases where you don't need to keep files

### Option 2: Selective Downloading (Streaming Priority)
**What it does**: Prioritizes pieces needed for current playback position
- ✅ Downloads pieces needed for streaming first
- ✅ Reduces unnecessary downloads
- ⚠️ Still downloads pieces (just prioritizes them)
- ⚠️ May buffer if seeking ahead

**Best for**: When you want to minimize downloads but still allow seeking

### Option 3: Pause Download When Video Paused
**What it does**: Stops downloading when video player is paused
- ✅ Saves network when not watching
- ✅ Resumes when video resumes
- ⚠️ May cause buffering when resuming
- ⚠️ Still downloads pieces that were already requested

**Best for**: Saving bandwidth when paused

### Option 4: Hybrid Approach (Best of All)
**What it does**: Combines memory-only + selective downloading + pause on pause
- ✅ Maximum network savings
- ✅ No disk usage
- ✅ Smart prioritization
- ⚠️ More complex implementation

## Implementation

I'll implement **Option 4 (Hybrid)** with the ability to configure which options you want:

1. **Memory-only storage** (configurable)
2. **Streaming priority** (always enabled)
3. **Pause download when video paused** (configurable)

## Configuration

You can control these options via environment variables or UI settings:

```env
# Use memory instead of disk (recommended for streaming)
TORRENT_STORAGE_MODE=memory  # or 'disk'

# Pause download when video is paused
TORRENT_PAUSE_ON_VIDEO_PAUSE=true  # or false
```

## Network Usage Comparison

| Mode | Disk Usage | Network When Playing | Network When Paused |
|------|------------|---------------------|---------------------|
| **Current (Disk)** | Full download | High | High (continues) |
| **Memory-only** | None | High | High (continues) |
| **Memory + Pause** | None | High | Low (paused) |
| **Hybrid (All)** | None | Medium (selective) | Low (paused) |

## Technical Details

### WebTorrent Options

```javascript
// Memory-only storage
const torrent = client.add(magnetURI, {
  store: new MemoryChunkStore()  // In-memory storage
});

// Selective downloading (streaming priority)
torrent.files[fileIndex].select();  // Prioritize this file
torrent.files[fileIndex].deselect(); // Stop prioritizing

// Pause/resume
torrent.pause();   // Stop downloading
torrent.resume();  // Resume downloading
```

### How Streaming Works

1. Video player requests byte range (e.g., bytes 0-1024)
2. Server checks if those pieces are downloaded
3. If yes: Stream immediately
4. If no: WebTorrent prioritizes those pieces, downloads them, then streams
5. Player buffers ahead (requests next chunks)

**Key Point**: You can't stream pieces that aren't downloaded yet. But you CAN:
- Only download pieces needed for streaming (selective)
- Use memory instead of disk (no permanent storage)
- Pause downloading when not watching (save bandwidth)

