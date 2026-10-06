# ☁️ Cloudflare Deployment Guide - Swariya Jewellers Backend

This document provides step-by-step instructions to deploy the **Swariya Jewellers Node.js / Express Backend** using two different approaches:
1. **Option 1 (Direct Edge Serverless):** Deploying directly to **Cloudflare Workers** using `wrangler`.
2. **Option 2 (Hybrid Cloudflare Protection):** Deploying on a container host (Render / VPS / Railway / Docker) with **Cloudflare DNS + Proxy + Cloudflare Tunnel (`cloudflared`)**.

---

## 🚀 Option 1: Direct Edge Deployment (Cloudflare Workers)

This method runs your Express application on Cloudflare's global edge network across 300+ cities with zero cold start delays.

### Step 1: Install Dependencies
From the `backend` directory, run:
```bash
npm install
```

### Step 2: Login to Cloudflare CLI
Authenticate Wrangler with your Cloudflare account:
```bash
npx wrangler login
```

### Step 3: Configure Environment Secrets on Cloudflare Workers
Set all sensitive environment variables securely on Cloudflare Workers using Wrangler:

```bash
# MongoDB Atlas Connection String
npx wrangler secret put MONGO_URI

# Auth JWT Secret
npx wrangler secret put JWT_SECRET

# Cashfree Payment Gateway Credentials
npx wrangler secret put CASHFREE_APP_ID
npx wrangler secret put CASHFREE_SECRET_KEY

# Cloudflare R2 Bucket Storage Credentials
npx wrangler secret put R2_ACCOUNT_ID
npx wrangler secret put R2_ACCESS_KEY_ID
npx wrangler secret put R2_SECRET_ACCESS_KEY
npx wrangler secret put R2_BUCKET_NAME
```

### Step 4: Test Locally with Wrangler
Run the local Cloudflare Worker simulator:
```bash
npm run dev:worker
```

### Step 5: Deploy to Cloudflare Workers
Deploy the backend live to Cloudflare:
```bash
npm run deploy:worker
```
Once completed, Wrangler will provide your live URL (e.g. `https://swariya-backend.<your-subdomain>.workers.dev`).

---

## 🌐 Option 2: Cloudflare Tunnel & Proxy Deployment (Docker / VPS / Render)

This method keeps the standard Node.js process running (e.g. via Docker, Render, Railway, or VPS) while routing all traffic through Cloudflare's global CDN, Web Application Firewall (WAF), and Free SSL/TLS.

### Approach A: Cloudflare DNS Proxy with Hosting Service (Render / Railway / Hostinger)
1. Deploy your backend using `Dockerfile` or `npm start` on Render, Railway, or VPS.
2. In your Cloudflare Dashboard -> **DNS -> Records**:
   - Add a `CNAME` or `A` record pointing to your backend container IP/domain.
   - Ensure the **Proxy status** toggle is set to **Proxied (Orange Cloud 🟠)**.
3. Under **SSL/TLS**, set encryption mode to **Full (strict)**.

### Approach B: Cloudflare Tunnel (`cloudflared`) - Secure No-Open-Ports Setup
Cloudflare Tunnel creates an encrypted outbound-only tunnel between your host server and Cloudflare network without opening inbound firewall ports.

1. **Install cloudflared**:
   ```bash
   # Windows (via winget)
   winget install Cloudflare.cloudflared
   ```
2. **Authenticate Tunnel**:
   ```bash
   cloudflared tunnel login
   ```
3. **Create Tunnel**:
   ```bash
   cloudflared tunnel create swariya-backend
   ```
4. **Configure `cloudflared-config.yml`**:
   Replace `<YOUR-TUNNEL-UUID>` in [`cloudflared-config.yml`](file:///g:/swariya%20jewl/backend/cloudflared-config.yml) with your actual Tunnel UUID.
5. **Route Domain to Tunnel**:
   ```bash
   cloudflared tunnel route dns swariya-backend api.swariyajewellers.com
   ```
6. **Start the Tunnel**:
   ```bash
   cloudflared tunnel run swariya-backend
   ```

---

## 🧪 Verification & Health Check

Once deployed using either method, test your live endpoint:
```bash
curl https://<your-cloudflare-domain>/health
```

Expected Response:
```json
{
  "status": "online",
  "service": "Swariya Jewellers Backend API (MongoDB + Cashfree + Cloudflare)",
  "timestamp": "2026-10-04T16:15:00.000Z"
}
```
