# Deploying E-KAVACH to Your GoDaddy Domain 🌐

This guide explains how to take your custom domain purchased from **GoDaddy** (e.g., `yourdomain.com`) and publish your **E-KAVACH** application to the live internet.

---

## 💡 Important: How Domains and Hosting Work

A **GoDaddy Domain** is like your home's postal address (e.g. `123 Health Street`). 
However, an address needs an actual building behind it. 

To make your website work online, you need two pieces:
1. **The Hosting Server**: The computer that runs your Node.js code and database 24/7.
2. **GoDaddy DNS**: Tells internet browsers: *"When someone types my GoDaddy domain, send them to my hosting server."*

---

## 🔑 Question: "Why do I have JWT Access / Refresh Keys in .env if I don't have them?"

**You do NOT need to buy, register, or request JWT keys from GoDaddy, Google, or any third party!**

### What are JWT Secrets?
- **JWT** stands for *JSON Web Token*.
- When a doctor, patient, or hospital administrator logs into E-KAVACH, the server creates a secure digital identity badge for them.
- To prevent hackers from making fake badges, the server signs each badge with a secret passphrase (like a wax seal or signature stamp). That passphrase is `JWT_ACCESS_SECRET`.
- `ENCRYPTION_SECRET_KEY` is a key used internally to encrypt sensitive medical health IDs (ABHA) before saving them to disk.

### Do you need to provide them?
- **NO!** The application already has safe, built-in fallback defaults in `e-kavach-backend/src/config/env.js`.
- If you leave them empty or don't set them at all in `.env`, **E-KAVACH will work completely fine**.
- If you *want* custom ones for high security on a live public website, you can type **any random string of letters and numbers** you like, for example:
  ```env
  JWT_ACCESS_SECRET=my_custom_super_secret_hospital_passphrase_2026!
  JWT_REFRESH_SECRET=my_custom_super_secret_refresh_passphrase_2026!
  ```

---

## 🚀 Step-by-Step: Publishing to Your GoDaddy Domain

The easiest and most reliable way to host a full-stack Node.js + WebSocket application like E-KAVACH is using a cloud platform like **Render.com** (Free / Starter) or a **Cloud VPS (DigitalOcean / AWS / Linode)**.

Here is the recommended 3-step setup using **Render**:

### Step 1: Push Your Code to GitHub
1. Create a repository on [GitHub](https://github.com/new) (e.g., `e-kavach`).
2. In your local terminal, push your project:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for E-KAVACH"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/e-kavach.git
   git push -u origin main
   ```

---

### Step 2: Deploy on Render.com (Takes 3 Minutes)
1. Go to [Render.com](https://render.com/) and create a free account.
2. Click **"New +"** and choose **"Web Service"**.
3. Connect your GitHub repository.
4. Fill in the settings:
   - **Name**: `e-kavach`
   - **Environment**: `Node`
   - **Region**: Choose the region closest to your users (e.g., Singapore / Frankfurt / Oregon).
   - **Build Command**:
     ```bash
     npm install && npm run build
     ```
   - **Start Command**:
     ```bash
     npm start
     ```
5. Click **"Create Web Service"**.
6. Render will build and deploy your app. When finished, Render gives you a free URL like:
   `https://e-kavach-xyz.onrender.com`

---

### Step 3: Connect Your GoDaddy Domain to the Hosted App

Now connect your custom GoDaddy domain:

1. **In Render**:
   - Go to your Web Service dashboard -> **Settings** -> **Custom Domains**.
   - Click **Add Custom Domain**.
   - Enter your domain (e.g., `yourdomain.com` and `www.yourdomain.com`).
   - Render will display the exact DNS records to enter in GoDaddy:
     - An **A Record** (pointing to an IP like `216.24.57.1`) or an **ANAME/ALIAS**.
     - A **CNAME Record** for `www` (e.g., `e-kavach-xyz.onrender.com`).

2. **In GoDaddy**:
   - Log into your [GoDaddy Account](https://account.godaddy.com/).
   - Under **Domains**, locate your domain and click **"DNS"** (or **"Manage DNS"**).
   - In the **DNS Records** table:
     - **For Root Domain (`@`)**:
       - Type: `A`
       - Name: `@`
       - Value: `216.24.57.1` (or the IP provided by your host)
       - TTL: `1/2 Hour` (or Default)
       - Click **Save**.
     - **For Subdomain (`www`)**:
       - Type: `CNAME`
       - Name: `www`
       - Value: `e-kavach-xyz.onrender.com` (your host's address)
       - TTL: `1/2 Hour`
       - Click **Save**.

3. **Wait for DNS Propagation & SSL**:
   - DNS updates worldwide typically take between **5 to 30 minutes**.
   - Render automatically provisions a **free SSL certificate (HTTPS 🔒)** for your GoDaddy domain so users see the secure lock icon.

---

## 🖥️ Alternative: Deploying on a Cloud VPS (DigitalOcean / Ubuntu)

If you are using a virtual server (like a $4-$6/mo DigitalOcean Droplet, Linode, or AWS EC2 instance):

1. **Point GoDaddy A Record directly to your VPS IP**:
   - Type: `A` | Name: `@` | Value: `YOUR_SERVER_IP` (e.g. `142.93.12.34`)
   - Type: `CNAME` | Name: `www` | Value: `yourdomain.com`

2. **On your VPS server**:
   ```bash
   # 1. Clone your repository
   git clone https://github.com/YOUR_USERNAME/e-kavach.git
   cd e-kavach

   # 2. Install dependencies and build
   npm install
   npm run build

   # 3. Run continuously using PM2 process manager
   npm install -g pm2
   pm2 start npm --name "e-kavach" -- start
   pm2 save
   pm2 startup
   ```

3. **Enable HTTPS with Nginx and Certbot (Free Let's Encrypt SSL)**:
   ```bash
   sudo apt install -y nginx certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

---

## 📋 Summary Checklist

| Component | What You Need | Notes |
|---|---|---|
| **GoDaddy Domain** | Already purchased ✅ | Only provides the name (DNS routing). |
| **Server Hosting** | Render / Railway / DigitalOcean | Needed to run the Node.js backend & frontend 24/7. |
| **GoDaddy DNS** | Add 1 A-Record (`@`) and 1 CNAME (`www`) | Provided by your hosting provider. |
| **SSL Certificate** | Automatic & Free | Automatically issued by Render or Certbot. |
| **JWT Secrets** | **Optional** | Self-generated strings; safe defaults are already built in. |
| **Gemini API Key** | Optional free key | Only needed if using AI clinical triage recommendations. |
