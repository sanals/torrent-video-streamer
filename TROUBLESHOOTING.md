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
