# 🐕 GitHub Push Commands - Copy & Run These!

## Step 1: GitHub Repository Banayein
1. **Browser mein jayein**: https://github.com/new
2. **Repository name**: `shibalab`
3. **Description**: `SHIB Mining Platform - 140% Returns`
4. **Public** select karein
5. **Create repository** click karein

## Step 2: Terminal Commands Run Karein

```bash
# Directory mein jayein
cd /home/z/my-project

# Remote add karein
git remote add origin https://github.com/zakirullah1579/shibalab.git

# Push karein
git push -u origin main
```

## Agar Authentication Error Aaye:

### Option A: Personal Access Token Use Karein
1. https://github.com/settings/tokens pe jayein
2. "Generate new token" click karein
3. "repo" permission select karein
4. Token copy karein
5. Push karte waqt password ki jagah token paste karein

### Option B: GitHub CLI Use Karein
```bash
# Install GitHub CLI (if not installed)
# Then run:
gh auth login
gh repo create shibalab --public --source=. --push
```

## ✅ Push Ke Baad:

**Repository URL**: https://github.com/zakirullah1579/shibalab

**Deploy ke liye**:
1. https://vercel.com pe jayein
2. "New Project" click karein
3. GitHub repo import karein
4. Deploy!

---

## 🚀 Quick Deploy (Vercel CLI):

```bash
# Vercel CLI install karein
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

---

**Current Commit**: `🐕 ShibaLab Mining Platform - Complete`
