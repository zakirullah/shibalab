# ShibaLab Mining Platform - Deployment Guide

## 🚀 Deployment Options

### Option 1: Vercel (Recommended - Easiest)
Vercel Next.js ka official hosting platform hai. Sab se easy hai.

### Option 2: Google Cloud Platform
Google Cloud pe deploy karne ke liye.

### Option 3: Netlify
Free hosting with easy setup.

---

## 📋 Option 1: Vercel Deployment (Recommended)

### Step 1: Vercel Account Banayein
1. https://vercel.com pe jayein
2. "Sign Up" click karein
3. GitHub se connect karein (recommended)

### Step 2: Project Push to GitHub
```bash
# GitHub pe new repository banayein
# Then local se push karein:

git init
git add .
git commit -m "ShibaLab Mining Platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/shibalab.git
git push -u origin main
```

### Step 3: Vercel pe Deploy
1. Vercel dashboard pe "New Project" click karein
2. GitHub repository select karein
3. "Import" click karein
4. Framework Preset: Next.js (auto-detect)
5. "Deploy" button click karein
6. 2-3 minutes mein website live ho jayegi!

### Step 4: Custom Domain (Optional)
1. Vercel dashboard > Settings > Domains
2. Apna domain add karein
3. DNS records update karein

**Cost: FREE (Hobby Plan)**

---

## 📋 Option 2: Google Cloud Platform Deployment

### Step 1: Google Cloud Account
1. https://cloud.google.com pe jayein
2. "Get Started Free" click karein
3. Billing setup karein ($300 free credits milte hain)

### Step 2: Google Cloud CLI Install Karein
```bash
# Windows/Mac/Linux
# https://cloud.google.com/sdk/docs/install

# Verify installation
gcloud --version
```

### Step 3: Project Setup
```bash
# Login to Google Cloud
gcloud auth login

# Create new project
gcloud projects create shibalab-mining --name="ShibaLab Mining"

# Set project
gcloud config set project shibalab-mining
```

### Step 4: App Engine Deployment
Create `app.yaml` file:
```yaml
runtime: nodejs20
env: standard
instance_class: F2

automatic_scaling:
  min_idle_instances: 1
  max_idle_instances: 2

env_variables:
  NODE_ENV: "production"
```

### Step 5: Package.json Update
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start -p $PORT",
    "lint": "next lint"
  }
}
```

### Step 6: Deploy Command
```bash
# Build the project
npm run build

# Deploy to App Engine
gcloud app deploy

# Open website
gcloud app browse
```

**Cost: ~$10-20/month (App Engine Standard)**

---

## 📋 Option 3: Google Cloud Run (Better for Next.js)

### Step 1: Dockerfile Create Karein
```dockerfile
# File: Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
```

### Step 2: next.config.js Update
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
}

module.exports = nextConfig
```

### Step 3: Deploy to Cloud Run
```bash
# Build and deploy in one command
gcloud run deploy shibalab \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

# Your URL will be like:
# https://shibalab-XXXXX-uc.a.run.app
```

**Cost: ~$5-15/month (Cloud Run pay-per-use)**

---

## 📋 Option 4: Netlify Deployment

### Step 1: Netlify Account
1. https://netlify.com pe jayein
2. GitHub se sign up karein

### Step 2: Deploy
1. "New site from Git" click karein
2. GitHub repository select karein
3. Build command: `npm run build`
4. Publish directory: `.next`
5. "Deploy site" click karein

### Step 3: netlify.toml Create
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

**Cost: FREE (Starter Plan)**

---

## 📊 Platform Comparison

| Platform | Cost | Ease | Speed | Custom Domain |
|----------|------|------|-------|---------------|
| Vercel | FREE | ⭐⭐⭐⭐⭐ | Fast | ✅ Free |
| Google Cloud Run | ~$10/mo | ⭐⭐⭐ | Very Fast | ✅ Free |
| Google App Engine | ~$15/mo | ⭐⭐ | Fast | ✅ Free |
| Netlify | FREE | ⭐⭐⭐⭐ | Fast | ✅ Free |

---

## 🎯 Recommended: Vercel (Best Choice)

### Why Vercel?
1. ✅ **FREE Hosting** - No cost
2. ✅ **Easy Setup** - 5 minutes mein live
3. ✅ **Auto SSL** - HTTPS free
4. ✅ **Custom Domain** - Free
5. ✅ **Auto Deploy** - Git push pe auto deploy
6. ✅ **Fast CDN** - Global content delivery
7. ✅ **Analytics** - Free analytics

### Vercel Quick Steps:
```
1. GitHub pe code push karein
2. Vercel.com pe login karein
3. "Import Project" click karein
4. GitHub repo select karein
5. "Deploy" click karein
6. Done! 🎉
```

---

## 🔧 Pre-Deployment Checklist

### 1. Images Check
```bash
# Public folder mein images honi chahiye
/public/shiba-mascot.png
/public/shiba-coin.png
/public/hero-illustration.png
/public/favicon.png
```

### 2. Environment Variables (if any)
```bash
# .env.local file (for sensitive data)
# But current code mein koi secret nahi hai
```

### 3. Build Test
```bash
# Local pe test karein
npm run build
npm start

# Check karein http://localhost:3000
```

---

## 📱 Custom Domain Setup

### Free Domain Options:
1. **Freenom** - .tk, .ml, .ga domains (FREE)
2. **DuckDNS** - Free subdomain
3. **No-IP** - Free dynamic DNS

### Paid Domain:
1. **Namecheap** - Cheap domains
2. **GoDaddy** - Popular option
3. **Google Domains** - Easy integration

### Connect Domain to Vercel:
```
1. Domain purchase karein
2. Vercel > Settings > Domains
3. Domain add karein
4. DNS records copy karein
5. Domain registrar mein DNS update karein
6. Wait 24-48 hours (usually faster)
```

---

## 🎉 Quick Deploy Command (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (one command!)
vercel --prod

# Your site will be live at:
# https://shibalab.vercel.app
```

---

## ❓ Common Issues & Solutions

### Issue 1: Build Failed
```bash
# Solution: Check Node version (18+ required)
node --version

# Update if needed
```

### Issue 2: Images Not Loading
```bash
# Solution: Check public folder
# Images should be in /public folder
```

### Issue 3: Environment Variables
```bash
# Solution: Add in Vercel dashboard
# Settings > Environment Variables
```

---

## 📞 Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Google Cloud Docs**: https://cloud.google.com/docs
- **Next.js Deploy**: https://nextjs.org/docs/deployment

---

**Best of Luck! 🚀**
