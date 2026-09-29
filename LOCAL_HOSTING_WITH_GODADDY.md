# Hosting `ekawach.co.in` Directly From Your Local Computer 💻🌐

Yes, you can absolutely host **`ekawach.co.in`** directly from your local computer without paying for external website hosting like Render, AWS, or DigitalOcean!

This setup turns your own computer into the 24/7 web server serving `https://ekawach.co.in` to the world.

---

## ⚡ The Solution: Cloudflare Tunnel (Free & Secure)

If you have a home broadband connection (Jio Fiber, Airtel, ACT, etc.):
- Direct router port forwarding usually **fails** because Indian ISPs use **CGNAT** (Carrier Grade NAT).
- Opening home router ports directly exposes your home network to hackers and DDoS attacks.

**Cloudflare Tunnel (`cloudflared`)** solves this:
- **100% Free Forever**.
- **No router port forwarding or static IP needed**.
- **Works through any firewall or CGNAT**.
- **Free Automatic SSL (HTTPS 🔒)** for `ekawach.co.in`.
- Protects your personal IP address behind Cloudflare's shield.

---

## 🚀 Step-by-Step: Connect `ekawach.co.in` to Your Local PC

---

### Step 1: Create a Free Cloudflare Account & Add `ekawach.co.in`
1. Go to [Cloudflare.com](https://dash.cloudflare.com/sign-up) and create a free account.
2. Click **"Add a site"** and enter:
   ```text
   ekawach.co.in
   ```
3. Select the **Free Plan ($0)**.
4. Cloudflare will scan your existing GoDaddy records and show you **two Cloudflare Nameservers** (e.g., `gina.ns.cloudflare.com` and `lex.ns.cloudflare.com`).

---

### Step 2: Update Nameservers in GoDaddy
1. Open your [GoDaddy Domain Portfolio](https://account.godaddy.com/products).
2. Click on **`ekawach.co.in`** ➔ Click **"DNS"** (or **"Manage DNS"**).
3. Scroll down to the **Nameservers** section and click **"Change Nameservers"**.
4. Select **"I'll use my own nameservers"**.
5. Paste the two nameservers provided by Cloudflare.
6. Click **Save** (and accept the prompt).
> *Note: It usually takes 5 to 15 minutes for GoDaddy to switch nameservers to Cloudflare.*

---

### Step 3: Install `cloudflared` on Your Computer

#### On Windows:
Open PowerShell as Administrator and run:
```powershell
winget install --id Cloudflare.cloudflared
```
*(Or download the `.exe` directly from [Cloudflare Releases](https://github.com/cloudflare/cloudflared/releases)).*

#### On macOS:
```bash
brew install cloudflare/cloudflare/cloudflared
```

#### On Linux (Ubuntu/Debian):
```bash
sudo mkdir -p --mode=0755 /etc/apt/keyrings
curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | sudo tee /etc/apt/keyrings/cloudflare-main.gpg >/dev/null
echo "deb [signed-by=/etc/apt/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared any main" | sudo tee /etc/apt/sources.list.d/cloudflared.list
sudo apt-get update && sudo apt-get install cloudflared
```

---

### Step 4: Start Your Application Locally

In your project root directory (`E-Kavaach`), start your unified server:

```bash
npm run dev
```
Confirm that it is running locally at **`http://localhost:3000`**.

---

### Step 5: Connect Your Domain to Local Port 3000

In a new terminal window:

1. **Log in to Cloudflare**:
   ```bash
   cloudflared tunnel login
   ```
   A browser window will open. Click on **`ekawach.co.in`** to authorize.

2. **Create a Named Tunnel**:
   ```bash
   cloudflared tunnel create ekawach-server
   ```
   *(This gives you a Tunnel ID).*

3. **Route Your Domain to the Tunnel**:
   ```bash
   cloudflared tunnel route dns ekawach-server ekawach.co.in
   cloudflared tunnel route dns ekawach-server www.ekawach.co.in
   ```

4. **Run the Tunnel**:
   ```bash
   cloudflared tunnel run --url http://localhost:3000 ekawach-server
   ```

**🎉 That's it!**
Your local computer is now broadcasting **`https://ekawach.co.in`** to the entire world with real-time WebSockets, QR scanning, IVR voice alerts, and full database persistence!

---

## 🏃 Quick Option: Instant 30-Second Quick Tunnel (No Setup)

If you want to test right this second without changing GoDaddy nameservers yet:

```bash
cloudflared tunnel --url http://localhost:3000
```
Cloudflare will immediately output a temporary live URL like:
`https://random-words.trycloudflare.com`
Anyone on their phone or laptop anywhere in the world can open that URL to access your local E-KAVACH server.

---

## ⚖️ Trade-offs: Local Hosting vs. Cloud Hosting

| Feature | Local Computer Hosting | Cloud Hosting (Render/VPS) |
|---|---|---|
| **Cost** | 100% Free | Free or $5/month |
| **Data Privacy** | All medical files remain on your physical hard drive | Stored in cloud data centers |
| **Uptime** | Website only works while your computer is on & connected to Wi-Fi | 99.99% uptime 24/7/365 |
| **Power/Sleep** | If laptop sleeps or battery dies, website goes offline | Never turns off |
| **Speed** | Dependent on your home internet upload speed | High-speed 1Gbps fiber data center |

> **Pro Tip**: Local hosting is perfect for development, live demos, and initial testing. When you deploy in a real hospital setting with 24/7 critical emergencies, you can move the exact same codebase to a 24/7 cloud server with zero changes to your code!
