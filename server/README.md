# Torrent Video Streamer - Backend Server

A **Node.js backend server** for torrent video streaming that handles WebTorrent downloads, video streaming, and real-time progress updates via WebSocket.

## 🏗️ Architecture

- **Node.js + Express**: HTTP API server
- **WebTorrent**: Server-side torrent client for downloading and streaming
- **WebSocket (ws)**: Real-time progress updates to connected clients
- **HTTP Range Requests**: Support for video seeking

## ✨ Features

- ✅ Stream any torrent (not limited to WebRTC-only torrents)
- ✅ Real-time download progress with peers/speed info
- ✅ Video seeking support via HTTP range requests
- ✅ Multiple concurrent torrents
- ✅ WebSocket live updates
- ✅ Torrent search API integration
- ✅ Configurable storage (memory or disk)

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## 🚀 Installation

```bash
npm install
```

## 🔧 Configuration

Create `.env` file (or copy from `.env.example`):

```env
PORT=4000
NODE_ENV=production
DOWNLOADS_PATH=./downloads
CORS_ORIGIN=*
TORRENT_STORAGE_MODE=memory
AUTO_DELETE_ON_DISCONNECT=true
TORRENT_PAUSE_ON_VIDEO_PAUSE=true
```

## 🎬 Running the Server

### Development
```bash
npm start
```

The server will start on **http://localhost:4000**

### Production
```bash
NODE_ENV=production npm start
```

## 📡 API Endpoints

### Torrent Management
- `POST /api/torrents` - Add a torrent (magnet link or file)
- `GET /api/torrents` - Get all torrents
- `GET /api/torrents/:infoHash` - Get specific torrent
- `DELETE /api/torrents/:infoHash` - Remove a torrent
- `POST /api/torrents/:infoHash/pause` - Pause torrent download
- `POST /api/torrents/:infoHash/resume` - Resume torrent download
- `GET /api/torrents/:infoHash/progress` - Get progress

### Video Streaming
- `GET /api/stream/:infoHash/:fileIndex` - Stream video with range support

### Search
- `GET /api/search?q=query&source=yts` - Search for torrents

### Utility
- `GET /api/health` - Health check
- `GET /` - API information

## 🌐 WebSocket Events

The server broadcasts the following events:

- `torrent:progress` - Real-time progress updates (1-second interval)
- `torrent:update` - Initial torrent list and updates

### WebSocket Connection
```javascript
const ws = new WebSocket('ws://localhost:4000');

ws.on('message', (data) => {
  const message = JSON.parse(data);
  if (message.type === 'torrent:progress') {
    console.log('Progress:', message.data);
  }
});
```

## 📁 Project Structure

```
server/
├── src/
│   ├── config/              # Configuration
│   ├── controllers/         # Route handlers
│   │   ├── torrentController.js
│   │   ├── streamController.js
│   │   └── searchController.js
│   ├── middleware/          # Express middleware
│   ├── routes/              # API routes
│   ├── services/            # Business logic
│   │   ├── torrentSearchService.js
│   │   └── alternativeSearchService.js
│   ├── torrent/             # TorrentManager
│   │   └── TorrentManager.js
│   ├── utils/               # Utilities
│   │   └── rangeParser.js
│   ├── websocket/           # WebSocket server
│   │   └── WebSocketServer.js
│   └── server.js            # Entry point
└── package.json
```

## 🛠️ Tech Stack

- **Node.js** - Runtime
- **Express** - Web framework
- **WebTorrent** - BitTorrent client
- **WebSocket (ws)** - Real-time communication
- **dotenv** - Environment configuration

## 📝 Environment Variables

- `PORT` - Server port (default: 4000)
- `NODE_ENV` - Environment (development/production)
- `DOWNLOADS_PATH` - Where to store downloads (if using disk storage)
- `CORS_ORIGIN` - Allowed frontend origin (use `*` for Tailscale)
- `TORRENT_STORAGE_MODE` - `memory` or `disk` (default: memory)
- `AUTO_DELETE_ON_DISCONNECT` - Delete torrents when last client disconnects (default: true)
- `TORRENT_PAUSE_ON_VIDEO_PAUSE` - Pause download when video pauses (default: true)

## 🚧 Development

### Linting
```bash
npm run lint
```

## ⚠️ Known Limitations

- **Some torrents may be slow** - Depends on seeders/peers availability
- **Large files take time** - Full download needed before seeking works smoothly
- **Memory usage** - Using memory storage loads entire torrents into RAM

## 🐛 Troubleshooting

### Port Already in Use
If you see `EADDRINUSE` error:
```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Or use the provided script
.\stop-port-4000.ps1

# Linux/Mac
lsof -ti:4000 | xargs kill -9
```

### Can't Connect from Frontend
- Ensure CORS settings in `.env` allow your frontend origin
- Check firewall allows port 4000
- Verify `CORS_ORIGIN` is set correctly

## 📄 License

MIT

---

**Note**: This is the backend server. For the frontend client, see the main repository.

