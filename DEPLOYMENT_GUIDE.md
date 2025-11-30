# Deployment Guide - Torrent Video Streamer

This guide covers various deployment options to make your torrent video streaming app accessible to family members or when traveling.

## Table of Contents

1. [Local Network Access](#local-network-access)
2. [Remote Access via VPN](#remote-access-via-vpn)
3. [Cloud Hosting](#cloud-hosting)
4. [GitHub Pages (Static Frontend)](#github-pages-static-frontend)
5. [Comparison Table](#comparison-table)

---

## 1. Local Network Access

### What It Is
Access the app from any device on your local Wi-Fi network (home, office, etc.).

### Setup Steps

1. **Find your computer's local IP address:**
   ```bash
   # Windows
   ipconfig
   # Look for "IPv4 Address" (e.g., 192.168.1.100)
   
   # Mac/Linux
   ifconfig
   # or
   ip addr show
   ```

2. **Start the backend server:**
   ```bash
   cd server
   npm start
   # or
   node src/index.js
   ```

3. **Update frontend API URL:**
   - Create/update `.env` file in the root directory:
   ```env
   VITE_API_URL=http://YOUR_LOCAL_IP:4000
   VITE_WS_URL=ws://YOUR_LOCAL_IP:4000
   ```
   Replace `YOUR_LOCAL_IP` with your actual IP (e.g., `192.168.1.100`)

4. **Start the frontend:**
   ```bash
   npm run dev
   ```

5. **Access from other devices:**
   - Open browser on phone/tablet/other computer
   - Go to: `http://YOUR_LOCAL_IP:3000`

### Pros
- ✅ Free
- ✅ No internet required (works offline)
- ✅ Fast (local network)
- ✅ Simple setup

### Cons
- ❌ Only works on same Wi-Fi network
- ❌ Doesn't work when traveling
- ❌ IP address may change

---

## 2. Remote Access via VPN

### Option A: Tailscale VPN (Recommended) 🌟

#### What It Is
Tailscale creates a secure, encrypted mesh VPN network. Your devices appear as if they're on the same local network, even when miles apart.

#### Why It's Great
- **Free for personal use** (up to 100 devices)
- **Zero configuration** - works behind firewalls/NAT
- **Secure** - Uses WireGuard encryption
- **Easy setup** - ~15 minutes
- **Works on mobile** - iOS/Android apps available
- **No port forwarding** - Magic!

#### Setup Steps

1. **Install Tailscale:**
   - **Server (your computer):**
     - Windows: Download from [tailscale.com](https://tailscale.com/download)
     - Mac: `brew install tailscale` or download installer
     - Linux: `curl -fsSL https://tailscale.com/install.sh | sh`
   
   - **Mobile devices:**
     - Install Tailscale app from App Store/Play Store

2. **Sign up & Login:**
   - Create free account at [tailscale.com](https://login.tailscale.com)
   - Login on all devices using same account

3. **Get your Tailscale IP:**
   ```bash
   # On your server computer
   tailscale ip
   # Example output: 100.x.x.x
   ```

4. **Update app configuration:**
   - Update `.env` file:
   ```env
   VITE_API_URL=http://YOUR_TAILSCALE_IP:4000
   VITE_WS_URL=ws://YOUR_TAILSCALE_IP:4000
   ```

5. **Start your servers:**
   ```bash
   # Terminal 1 - Backend
   cd server
   npm start
   
   # Terminal 2 - Frontend
   npm run dev
   ```

6. **Access from anywhere:**
   - Open Tailscale app on phone
   - Open browser, go to: `http://YOUR_TAILSCALE_IP:3000`
   - Works from anywhere in the world!

#### Advanced: Share with Family

1. **Option 1: Same Account (Simplest)**
   - Everyone uses the same Tailscale account
   - All devices appear on same network
   - ✅ Easiest setup
   - ⚠️ Everyone has access to all devices

2. **Option 2: Tailscale Sharing (Recommended)**
   - You keep your account
   - Share specific devices with family members
   - They create their own free accounts
   - You share your server with them
   - ✅ Better security
   - ✅ Each person manages their own devices

#### Tailscale Pricing
- **Free Tier:** 100 devices, 1 user, 3 users in shared devices
- **Paid Plans:** Start at $6/user/month (for teams)

---

### Option B: ZeroTier (Alternative VPN)

#### What It Is
Similar to Tailscale - creates a virtual network layer.

#### Setup Steps

1. **Install ZeroTier:**
   - Download from [zerotier.com](https://www.zerotier.com/download/)
   - Install on all devices

2. **Create Network:**
   - Sign up at [my.zerotier.com](https://my.zerotier.com)
   - Create a new network
   - Note the Network ID

3. **Join Network:**
   - On all devices, join the network using Network ID
   - Approve devices in ZeroTier web console

4. **Get ZeroTier IP:**
   - Each device gets an IP (e.g., 10.147.x.x)
   - Use this IP in your app configuration

#### Comparison: Tailscale vs ZeroTier

| Feature | Tailscale | ZeroTier |
|---------|-----------|----------|
| Free Tier | 100 devices | Unlimited devices |
| Setup Difficulty | Very Easy | Easy |
| Mobile Apps | ✅ Excellent | ✅ Good |
| Web Admin | ✅ Yes | ✅ Yes |
| Performance | Excellent | Very Good |
| Security | WireGuard | Custom protocol |
| **Recommendation** | ⭐ Best for beginners | Good alternative |

---

### Option C: WireGuard (Manual Setup)

#### What It Is
Open-source VPN protocol. More technical setup but very fast and secure.

#### When to Use
- You want full control
- You're comfortable with networking
- You need maximum performance

#### Setup Complexity
- ⚠️ Requires server setup
- ⚠️ Port forwarding needed
- ⚠️ More technical

#### Resources
- [WireGuard Setup Guide](https://www.wireguard.com/quickstart/)
- [PiVPN](https://pivpn.io/) - Easy WireGuard installer for Raspberry Pi

---

## 3. Cloud Hosting

### Option A: Vercel + Railway/Render (Recommended)

#### Architecture
- **Frontend:** Deploy to Vercel (free)
- **Backend:** Deploy to Railway or Render (free tier available)

#### Setup Steps

1. **Deploy Frontend to Vercel:**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   ```
   - Or connect GitHub repo to Vercel dashboard
   - Vercel auto-deploys on git push

2. **Deploy Backend to Railway:**
   - Sign up at [railway.app](https://railway.app)
   - Connect GitHub repo
   - Select `server` folder
   - Railway auto-detects Node.js and deploys
   - Get the public URL (e.g., `https://your-app.railway.app`)

3. **Update Environment Variables:**
   - In Vercel: Set `VITE_API_URL` to your Railway backend URL
   - In Railway: Set any required env vars

#### Pros
- ✅ Free tiers available
- ✅ Automatic HTTPS
- ✅ Easy deployment
- ✅ Auto-updates on git push

#### Cons
- ⚠️ Free tiers have limits
- ⚠️ Backend may sleep after inactivity (Railway free tier)

---

### Option B: DigitalOcean Droplet

#### What It Is
Virtual private server (VPS) - full control over a Linux server.

#### Setup Steps

1. **Create Droplet:**
   - Sign up at [digitalocean.com](https://www.digitalocean.com)
   - Create a Droplet ($6/month minimum)
   - Choose Ubuntu 22.04

2. **SSH into server:**
   ```bash
   ssh root@YOUR_SERVER_IP
   ```

3. **Install Node.js:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

4. **Clone and setup app:**
   ```bash
   git clone YOUR_REPO_URL
   cd torrent-video-streamer
   cd server && npm install
   ```

5. **Use PM2 to run backend:**
   ```bash
   npm install -g pm2
   pm2 start src/index.js --name torrent-backend
   pm2 save
   pm2 startup
   ```

6. **Setup Nginx reverse proxy:**
   ```bash
   sudo apt install nginx
   # Configure nginx to proxy to your app
   ```

#### Pricing
- **Droplet:** $6-12/month
- **Full control:** Yes
- **Performance:** Excellent

---

### Option C: AWS/GCP/Azure

#### When to Use
- Enterprise needs
- High traffic
- Complex requirements

#### Complexity
- ⚠️ Very complex setup
- ⚠️ Higher costs
- ⚠️ Steep learning curve

---

## 4. GitHub Pages (Static Frontend Only)

### What It Is
Free static hosting for your frontend. **Note:** This only works for the frontend. You'll still need a backend elsewhere.

### Setup Steps

1. **Build the frontend:**
   ```bash
   npm run build
   ```

2. **Install gh-pages:**
   ```bash
   npm install --save-dev gh-pages
   ```

3. **Update package.json:**
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     },
     "homepage": "https://YOUR_USERNAME.github.io/torrent-video-streamer"
   }
   ```

4. **Deploy:**
   ```bash
   npm run deploy
   ```

5. **Update API URLs:**
   - Since GitHub Pages is HTTPS, your backend must also be HTTPS
   - Update `VITE_API_URL` to point to your backend (Railway, Render, etc.)

### Limitations
- ❌ **Only frontend** - Backend must be hosted separately
- ❌ **HTTPS required** - Backend must support HTTPS
- ❌ **No server-side code** - Pure static files only

### When to Use
- ✅ You have backend hosted elsewhere (Railway, Render, etc.)
- ✅ You want free frontend hosting
- ✅ You're okay with separate deployments

---

## 5. Comparison Table

| Solution | Cost | Setup Time | Difficulty | Remote Access | Mobile Support | Best For |
|----------|------|------------|------------|---------------|---------------|----------|
| **Local Network** | Free | 5 min | ⭐ Easy | ❌ No | ✅ Yes | Home use only |
| **Tailscale VPN** | Free | 15 min | ⭐ Easy | ✅ Yes | ✅ Excellent | **Family/Travel** ⭐ |
| **ZeroTier VPN** | Free | 20 min | ⭐⭐ Medium | ✅ Yes | ✅ Good | Alternative VPN |
| **Vercel + Railway** | Free* | 30 min | ⭐⭐ Medium | ✅ Yes | ✅ Yes | Public access |
| **DigitalOcean** | $6/mo | 1 hour | ⭐⭐⭐ Hard | ✅ Yes | ✅ Yes | Full control |
| **GitHub Pages** | Free | 10 min | ⭐ Easy | ⚠️ Partial** | ✅ Yes | Frontend only |

\* Free tiers have limits  
\*\* Requires separate backend hosting

---

## Recommended Setup for Family/Travel Access

### 🏆 Best Option: Tailscale VPN

**Why:**
1. **Free** - No cost for personal use
2. **Easy** - 15-minute setup
3. **Secure** - Encrypted connection
4. **Works everywhere** - Home, travel, anywhere
5. **Mobile-friendly** - Native apps for iOS/Android
6. **No port forwarding** - Works behind any firewall

**Setup Time:** ~15 minutes  
**Monthly Cost:** $0  
**Difficulty:** ⭐ Easy

### Alternative: Vercel + Railway

**Why:**
- If you want public access (not just family)
- If you want automatic HTTPS
- If you're comfortable with cloud hosting

**Setup Time:** ~30 minutes  
**Monthly Cost:** $0 (free tiers)  
**Difficulty:** ⭐⭐ Medium

---

## Quick Start: Tailscale Setup

1. **Install Tailscale on your computer:**
   - Visit [tailscale.com/download](https://tailscale.com/download)
   - Install and sign up

2. **Install Tailscale on family phones:**
   - App Store / Play Store
   - Sign in with same account

3. **Get your Tailscale IP:**
   ```bash
   tailscale ip
   # Example: 100.64.1.2
   ```

4. **Update `.env`:**
   ```env
   VITE_API_URL=http://100.64.1.2:4000
   VITE_WS_URL=ws://100.64.1.2:4000
   ```

5. **Start servers and access from anywhere!**

---

## Security Considerations

### For VPN Solutions (Tailscale/ZeroTier)
- ✅ Encrypted by default
- ✅ Only devices you approve can connect
- ✅ No open ports on your router

### For Cloud Hosting
- ✅ Use HTTPS (automatic with most providers)
- ⚠️ Consider adding authentication
- ⚠️ Rate limiting recommended

### General Tips
- Keep your backend server updated
- Use strong passwords
- Consider adding basic auth for cloud deployments
- Monitor access logs

---

## Troubleshooting

### Tailscale: Can't connect
- Ensure all devices are logged into same account
- Check Tailscale status: `tailscale status`
- Verify firewall allows Tailscale

### Backend not accessible
- Check if backend is running: `netstat -ano | findstr :4000`
- Verify IP address is correct
- Check firewall settings

### Mobile app won't load
- Ensure mobile device is on Tailscale network
- Check if backend URL is correct
- Try accessing backend URL directly in mobile browser

---

## Need Help?

- **Tailscale Docs:** [tailscale.com/kb](https://tailscale.com/kb)
- **ZeroTier Docs:** [docs.zerotier.com](https://docs.zerotier.com)
- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **Railway Docs:** [docs.railway.app](https://docs.railway.app)

---

**Recommendation:** Start with **Tailscale VPN** - it's the easiest, free, and works perfectly for family/travel access! 🚀
