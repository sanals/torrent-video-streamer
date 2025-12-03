# Troubleshooting Guide - Backend Server

## Common Issues

### Port Already in Use

**Error**: `EADDRINUSE: address already in use :::4000`

**Solution**:
```powershell
# Windows - Find and kill process
.\stop-port-4000.ps1

# Or manually:
netstat -ano | findstr :4000
taskkill /PID <PID> /F
```

### Server Won't Start

**Check**:
1. Node.js version: `node --version` (must be v18+)
2. Dependencies installed: `npm install`
3. `.env` file exists and is configured
4. Port 4000 is available

### Frontend Can't Connect

**Check**:
1. Backend is running on port 4000
2. CORS settings in `.env`:
   - For Tailscale: `CORS_ORIGIN=*`
   - For localhost: `CORS_ORIGIN=http://localhost:3000`
3. Firewall allows port 4000
4. Frontend `.env.local` has correct `VITE_API_URL`

### Torrent Search API Issues

**Problem**: Search API returns errors or timeouts

**Solutions**:
1. Check Windows Firewall allows Node.js
2. Temporarily disable antivirus HTTPS scanning
3. Check network connectivity
4. Try alternative search sources

See `TROUBLESHOOTING.md` in the main repository for detailed search API troubleshooting.

### Memory Issues

**Problem**: Server runs out of memory

**Solutions**:
1. Use disk storage: `TORRENT_STORAGE_MODE=disk`
2. Limit concurrent torrents
3. Enable auto-delete: `AUTO_DELETE_ON_DISCONNECT=true`
4. Increase Node.js memory: `node --max-old-space-size=4096 src/server.js`

### WebSocket Connection Issues

**Problem**: Frontend can't connect via WebSocket

**Check**:
1. WebSocket server is running (check logs)
2. Firewall allows WebSocket connections
3. Frontend `VITE_WS_URL` is correct
4. CORS allows WebSocket origin

### Torrents Not Downloading

**Check**:
1. Internet connection
2. Torrent has seeders/peers
3. Check server logs for errors
4. Verify torrent is valid (try different torrent)

## Getting Help

1. Check server logs for error messages
2. Verify all environment variables are set correctly
3. Test with a known working torrent
4. Check the main repository's troubleshooting guide

