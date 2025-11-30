# PWA Setup Guide

## Icons Required

The PWA requires two icon files in the `public` directory:

1. **icon-192.png** - 192x192 pixels
2. **icon-512.png** - 512x512 pixels

### Creating Icons

You can create these icons using:

1. **Online Tools:**
   - [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
   - [RealFaviconGenerator](https://realfavicongenerator.net/)
   - [Favicon.io](https://favicon.io/)

2. **Design Tools:**
   - Use Figma, Photoshop, or any image editor
   - Create a square icon with your app logo/branding
   - Export as PNG at the required sizes

3. **Quick Solution:**
   - Use any image and resize it to 192x192 and 512x512
   - Recommended: Use a video/film icon or your app logo

### Icon Design Tips

- Use a simple, recognizable design
- Ensure good contrast for visibility
- Test on both light and dark backgrounds
- Consider using a film/video icon theme

### After Creating Icons

1. Place `icon-192.png` in the `public` directory
2. Place `icon-512.png` in the `public` directory
3. The app will automatically use them in the manifest

## Features Implemented

✅ **PWA Manifest** - App metadata and configuration
✅ **Service Worker** - Offline capabilities and caching
✅ **Install Prompt** - Mobile-friendly install prompt
✅ **Mobile Optimizations** - Responsive design improvements
✅ **Video Playback** - Mobile-optimized video player with playsInline

## Testing PWA

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Serve the build:**
   ```bash
   npm run preview
   ```

3. **Test on mobile:**
   - Open the app in a mobile browser
   - Look for the install prompt
   - Install the app
   - Test offline functionality

## Browser Support

- ✅ Chrome/Edge (Android & Desktop)
- ✅ Safari (iOS 11.3+)
- ✅ Firefox (Android)
- ⚠️ Safari (Desktop) - Limited PWA support

## Service Worker Features

- Caches static assets for offline access
- Skips caching API calls and WebSocket connections
- Automatically updates when new version is deployed
- Handles push notifications (ready for future use)

