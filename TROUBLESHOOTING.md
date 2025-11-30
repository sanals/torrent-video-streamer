# Fixing Torrent Search API Connection Issues

## Problem
The torrent search API works in your browser but fails from Node.js with `ECONNRESET` error. This is a network/firewall issue, not a code issue.

---

## Solutions to Try (In Order)

### 1. Check Windows Firewall

**Allow Node.js through firewall:**

1. Press `Win + R`, type `wf.msc`, press Enter
2. Click "Inbound Rules" → "New Rule"
3. Select "Program" → Next
4. Browse to your Node.js installation (usually `C:\Program Files\nodejs\node.exe`)
5. Select "Allow the connection" → Next
6. Check all profiles → Next
7. Name it "Node.js" → Finish
8. Repeat for "Outbound Rules"

**Or use PowerShell (Run as Administrator):**
```powershell
New-NetFirewallRule -DisplayName "Node.js" -Direction Inbound -Program "C:\Program Files\nodejs\node.exe" -Action Allow
New-NetFirewallRule -DisplayName "Node.js" -Direction Outbound -Program "C:\Program Files\nodejs\node.exe" -Action Allow
```

### 2. Disable Antivirus HTTPS Scanning (Temporarily)

Many antivirus programs (Norton, McAfee, Kaspersky, Avast) intercept HTTPS traffic and can block Node.js requests.

**Windows Defender:**
1. Open Windows Security
2. Virus & threat protection → Manage settings
3. Temporarily turn off "Real-time protection"
4. Test the search
5. Turn it back on

**Third-party Antivirus:**
- Look for "Web Protection" or "HTTPS Scanning" settings
- Temporarily disable it
- Test the search

### 3. Configure Proxy (If Behind Corporate Network)

If you're on a corporate/school network with a proxy:

**Set proxy in environment variables:**
```powershell
# In PowerShell (Administrator)
$env:HTTP_PROXY="http://proxy-server:port"
$env:HTTPS_PROXY="http://proxy-server:port"
```

**Or configure in Node.js globally:**

Create/edit `%USERPROFILE%\.npmrc`:
```
proxy=http://proxy-server:port
https-proxy=http://proxy-server:port
strict-ssl=false
```

### 4. Use VPN

If your ISP is blocking torrent-related domains for server applications:

1. **Install a VPN** (ProtonVPN, NordVPN, etc.)
2. **Connect to VPN**
3. **Restart your backend server**
4. **Test search**

### 5. Change DNS Server

Sometimes ISP DNS blocks torrent sites.

**Change to Google DNS:**
1. Open Control Panel → Network and Internet → Network Connections
2. Right-click your network adapter → Properties
3. Select "Internet Protocol Version 4 (TCP/IPv4)" → Properties
4. Choose "Use the following DNS server addresses"
5. Preferred: `8.8.8.8`
6. Alternate: `8.8.4.4`
7. Click OK
8. Restart your computer

**Or use Cloudflare DNS:**
- Preferred: `1.1.1.1`
- Alternate: `1.0.0.1`

### 6. Add Exception in Network Security Software

If you have additional security software (Sophos, Symantec, etc.):

1. Open your security software
2. Find "Application Control" or "Program Rules"
3. Add `node.exe` to allowed applications
4. Allow all outbound HTTPS connections

### 7. Restart Network Adapter

Sometimes a simple restart fixes connectivity issues:

**PowerShell (Administrator):**
```powershell
Get-NetAdapter | Restart-NetAdapter
```

**Or manually:**
1. Right-click network icon in taskbar
2. Open Network & Internet settings
3. Change adapter options
4. Right-click your adapter → Disable
5. Wait 5 seconds
6. Right-click → Enable

---

## Testing After Each Fix

After trying each solution:

1. **Restart your backend server** (`Ctrl+C` then `npm run dev`)
2. **Try searching** for "avengers" in the app
3. **Check server logs** for success/error messages

---

## Still Not Working?

### Alternative: Use Browser as Proxy

If nothing works, you can configure the app to make search requests from the **frontend** (browser) instead of backend, since browser requests work for you.

**Let me know if you want me to implement this workaround!**

---

## Quick Test Command

After trying fixes, test with this command in PowerShell:

```powershell
curl https://yts.torrentbay.to/api/v2/list_movies.json?query_term=test&limit=1
```

✅ **If this works**, your search will work too!
❌ **If this fails**, try the next solution above.

---

## Most Likely Causes (Based on Your Error)

1. **Windows Firewall** blocking Node.js HTTPS (60% chance)
2. **Antivirus HTTPS scanning** intercepting requests (30% chance)
3. **ISP blocking** torrent domains for apps (10% chance)

Try solutions 1 & 2 first - they fix most cases!

---

## Understanding Cloudflare Protection

### Why Cloudflare Blocks Automated Requests

**Cloudflare** is a security service that protects websites from bots and automated scripts. Here's why it blocks your app but not your browser:

1. **Browser Fingerprinting**: Cloudflare checks for:
   - JavaScript execution (browsers run JS, simple HTTP requests don't)
   - Browser headers (User-Agent, Accept-Language, etc.)
   - TLS fingerprinting (browser TLS handshakes differ from Node.js)
   - Behavioral patterns (mouse movements, page interactions)

2. **Your Browser Works Because:**
   - It executes JavaScript (Cloudflare's challenge page)
   - It has a full browser fingerprint
   - It maintains cookies and sessions
   - It passes Cloudflare's "Just a Moment" challenge

3. **Your App Fails Because:**
   - Node.js `axios`/`fetch` don't execute JavaScript
   - They have different TLS fingerprints
   - They can't solve Cloudflare's JavaScript challenges
   - They're detected as automated/bot traffic

### How to Verify It's Cloudflare

When you see an error, check the server logs. Cloudflare blocks typically show:

```
⚠️  Confirmed: Cloudflare protection detected
```

Or in the error response:
- Status code: `403` or `503`
- Response body contains: `"Cloudflare"`, `"Just a moment"`, `"challenge-platform"`
- Cloudflare Ray ID in the error message

### Solutions for Cloudflare Blocks

#### 1. Use Alternative Search Source (Recommended)

The app now includes an **"Alternative"** search source that tries multiple providers:
- **RARBG** (usually no Cloudflare)
- **ThePirateBay** (may work)
- **Torrent9** (alternative)
- **1337x** (fallback)

**How to use:**
1. Select "Backend API" mode
2. Choose "Alternative" as the source
3. Search - it will automatically try providers until one works

#### 2. Wait and Retry

Cloudflare blocks are often temporary. Wait 5-10 minutes and try again.

#### 3. Use YTS for Movies

YTS (yts.mx) typically doesn't have Cloudflare protection and works reliably for movies.

#### 4. Use Browser Direct Mode

Switch to "Browser Direct" mode in the search UI - this bypasses the backend and searches directly from your browser, avoiding Cloudflare blocks.

#### 5. Use a VPN (Advanced)

Some VPNs can help bypass Cloudflare, but this is not guaranteed and may violate terms of service.

### Why DNS (1.1.1.1) Won't Help

**Changing DNS won't bypass Cloudflare** because:
- Cloudflare protection happens at the **application layer** (HTTP/HTTPS)
- DNS only resolves domain names to IP addresses
- Cloudflare checks happen **after** DNS resolution
- The protection is based on request characteristics, not DNS

### What About Using Puppeteer/Playwright?

**Yes, this could work**, but:
- **Heavy**: Requires installing Chromium (~170MB)
- **Slow**: Much slower than direct HTTP requests
- **Resource-intensive**: Uses significant CPU/memory
- **Complex**: Requires handling browser lifecycle, cookies, etc.

**If you want this implemented**, I can add it, but it's not recommended unless other solutions fail.

---

## Quick Reference: Search Sources

| Source | Content | Cloudflare? | Reliability |
|--------|---------|-------------|-------------|
| **YTS** | Movies only | ❌ No | ✅ High |
| **1337x** | Movies, TV, More | ⚠️ Yes | ⚠️ Medium |
| **Alternative** | All types | ⚠️ Tries to avoid | ✅ High |
| **Browser Direct** | Movies (YTS) | ❌ No | ✅ High |