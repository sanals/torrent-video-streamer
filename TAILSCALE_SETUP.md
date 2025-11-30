# Tailscale Setup - Quick Reference

## Your Tailscale IP
**`100.106.121.5`**

## Next Steps

### 1. ✅ Tailscale Installed
You've successfully installed Tailscale on this computer.

### 2. Start Your Servers

**Terminal 1 - Backend:**
```bash
cd server
npm start
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### 3. Access from This Computer
- Open browser: `http://100.106.121.5:3000`
- Or still use: `http://localhost:3000` (works the same)

### 4. Install Tailscale on Other Devices

#### On Family Members' Phones:
1. Install **Tailscale** app from App Store (iOS) or Play Store (Android)
2. Sign in with the **same Tailscale account** you used on your computer
3. Once connected, open browser
4. Go to: `http://100.106.121.5:3000`

#### On Your Travel Laptop:
1. Download Tailscale from [tailscale.com/download](https://tailscale.com/download)
2. Install and sign in with same account
3. Open browser: `http://100.106.121.5:3000`

### 5. Verify Connection

**Check if devices can see each other:**
```bash
# On your computer
& "$env:ProgramFiles\Tailscale\tailscale.exe" status
```

You should see all connected devices listed.

### 6. Troubleshooting

**Can't access from other device?**
- ✅ Make sure Tailscale is running on both devices
- ✅ Check that both devices are logged into the same Tailscale account
- ✅ Verify the IP address is still `100.106.121.5` (run `tailscale ip` again)
- ✅ Make sure your backend server is running on port 4000
- ✅ Make sure your frontend server is running on port 3000

**IP address changed?**
- Tailscale IPs are usually stable, but if it changes:
  1. Run: `& "$env:ProgramFiles\Tailscale\tailscale.exe" ip`
  2. Update `.env` file with new IP
  3. Restart frontend server

### 7. Make It Permanent

**Auto-start Tailscale:**
- Tailscale should auto-start on Windows by default
- Check: Settings → Apps → Startup → Ensure Tailscale is enabled

**Auto-start your app:**
- You can create a startup script or use Task Scheduler
- Or just start manually when needed

## Quick Access URLs

- **Frontend:** `http://100.106.121.5:3000`
- **Backend API:** `http://100.106.121.5:4000/api`
- **WebSocket:** `ws://100.106.121.5:4000`

## Security Notes

✅ **Secure:** Tailscale encrypts all traffic  
✅ **Private:** Only devices on your Tailscale network can access  
✅ **No port forwarding needed:** Works behind any firewall  
✅ **Free:** Personal use is free (up to 100 devices)

---

**You're all set!** 🎉
Now install Tailscale on your phone and try accessing the app from anywhere!

