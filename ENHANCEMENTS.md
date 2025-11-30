# Enhancement Roadmap

This document outlines planned enhancements for the Torrent Video Streamer application.

---

## Phase 1: Torrent Search Integration

### Goal
Allow users to search for torrents by name instead of manually finding magnet links.

### Features
- Search input field in UI
- Integration with public torrent APIs (1337x, RARBG, or similar)
- Display search results with:
  - Name
  - Size
  - Seeders/Leechers
  - Upload date
  - Category
- Click to add torrent directly

### Implementation Tasks
- [ ] Research and select torrent search API
- [ ] Create backend endpoint: `GET /api/search?query=`
- [ ] Create frontend `TorrentSearch` component
- [ ] Add search results display with DataGrid/Table
- [ ] Add "Add Torrent" button in search results
- [ ] Handle API rate limiting
- [ ] Add error handling for failed searches

### Files to Create/Modify
**Backend:**
- `server/src/services/torrentSearchService.js` - API integration
- `server/src/controllers/searchController.js` - Search endpoint
- `server/src/routes/searchRoutes.js` - Route definitions

**Frontend:**
- `src/components/TorrentSearch/TorrentSearch.tsx` - Main component
- `src/components/TorrentSearch/SearchResults.tsx` - Results display
- `src/services/searchClient.ts` - API calls

### Estimated Time
2-3 hours

---

## Phase 2: Video Player Enhancements

### Goal
Improve video playback experience with buffering status and visual enhancements.

### Features

#### 2A: Buffering Status
- Show buffer progress in video player
- Display loading spinner during buffering
- Show "Buffering..." text overlay
- Buffer percentage indicator

#### 2B: Thumbnails/Posters
- Extract thumbnail from video first frame
- Display poster image before playback
- Show thumbnail in torrent file list
- Generate thumbnails server-side

### Implementation Tasks

**Buffering Status:**
- [ ] Add buffer event listeners to video element
- [ ] Create loading overlay component
- [ ] Show buffer progress bar
- [ ] Update UI during buffering states

**Thumbnails:**
- [ ] Install `ffmpeg` dependency
- [ ] Create thumbnail generation endpoint
- [ ] Generate thumbnails on torrent metadata load
- [ ] Store thumbnails in temp directory
- [ ] Serve thumbnails via static endpoint
- [ ] Display in UI

### Files to Create/Modify
**Frontend:**
- `src/components/VideoPlayer/VideoPlayer.tsx` - Add buffer UI
- `src/components/VideoPlayer/BufferOverlay.tsx` - Loading component
- `src/components/TorrentManager/FileThumbnail.tsx` - Thumbnail display

**Backend:**
- `server/src/services/thumbnailService.js` - FFmpeg integration
- `server/src/routes/thumbnailRoutes.js` - Serve thumbnails

### Dependencies
```bash
# Backend
npm install fluent-ffmpeg
```

### Estimated Time
3-4 hours

---

## Phase 3: Subtitle Support

### Goal
Allow users to load and display subtitles (SRT/VTT files) with videos.

### Features
- Auto-detect subtitle files in torrents
- Manual subtitle file upload
- Subtitle track selection
- Subtitle styling customization
- Multiple language support

### Implementation Tasks
- [ ] Detect subtitle files (.srt, .vtt) in torrent
- [ ] Convert SRT to VTT (browsers need VTT)
- [ ] Create subtitle upload endpoint
- [ ] Add subtitle track to video element
- [ ] Create subtitle selection UI
- [ ] Add subtitle styling controls (size, position, color)
- [ ] Store subtitle preferences in localStorage

### Files to Create/Modify
**Backend:**
- `server/src/utils/subtitleConverter.js` - SRT to VTT conversion
- `server/src/controllers/subtitleController.js` - Subtitle handling
- `server/src/routes/subtitleRoutes.js` - Subtitle endpoints

**Frontend:**
- `src/components/VideoPlayer/SubtitleControls.tsx` - UI controls
- `src/components/VideoPlayer/SubtitleUpload.tsx` - Upload component
- `src/utils/subtitleParser.ts` - Parse subtitle files

### Dependencies
```bash
# Backend
npm install subsrt  # SRT to VTT conversion
```

### Estimated Time
4-5 hours

---

## Phase 4: Additional Enhancements

### Quality Selection
- Detect multiple video qualities in torrent
- Allow user to switch between qualities
- Prioritize download of selected quality

### Download Management
- Add "Download" button for completed torrents
- Save files to user's downloads folder
- Show download progress

### Playlist Mode
- Create playlist from multiple videos
- Auto-play next video
- Shuffle and repeat options

### Mobile Responsive
- Optimize UI for mobile devices
- Touch-friendly controls
- Responsive video player

---

## Priority Order

1. **Phase 1: Torrent Search** (Most valuable - easier content discovery)
2. **Phase 2A: Buffering Status** (Better UX feedback)
3. **Phase 2B: Thumbnails** (Visual appeal)
4. **Phase 3: Subtitles** (Accessibility)
5. **Phase 4: Nice-to-haves** (Future enhancements)

---

## Development Workflow

For each phase:
1. Create feature branch: `git checkout -b feature/torrent-search`
2. Implement backend first (API endpoints)
3. Test backend with Postman/curl
4. Implement frontend (UI components)
5. Test end-to-end functionality
6. Update documentation
7. Commit and merge

---

## Notes

- Keep backwards compatibility
- Test with various torrent types
- Handle errors gracefully
- Update README with new features
- Consider performance impact
