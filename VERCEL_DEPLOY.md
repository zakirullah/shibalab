# 🚀 ShibaLab Mining Platform - Vercel Deployment

## Step 1: Push to GitHub

### Option A: Create New GitHub Repository
1. Go to https://github.com/new
2. Repository name: `shibalab-mining`
3. Make it **Private** or **Public**
4. Click **Create repository**

### Option B: Run these commands in terminal
```bash
cd /home/z/my-project

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "ShibaLab Mining Platform - Ready for Vercel"

# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/shibalab-mining.git

# Push to GitHub
git push -u origin main
```

---

## Step 2: Deploy on Vercel

### Method 1: Vercel Website (Easiest)
1. Go to **https://vercel.com**
2. Click **"Sign Up"** or **"Log In"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub
5. Click **"New Project"**
6. Import your `shibalab-mining` repository
7. Click **"Deploy"**
8. Wait 2-3 minutes ⏳
9. Done! 🎉 Your site is live!

### Method 2: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

---

## Step 3: Add Environment Variables on Vercel

After deployment, add these environment variables:

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

2. Add these variables:

| Variable Name | Value |
|---------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xghcqsqxgwfnucbpbrtr.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnaGNxc3F4Z3dmbnVjYnBicnRyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjgzNTM4MiwiZXhwIjoyMDg4NDExMzgyfQ._O5qSK5NtbU0hIZUcpa_Z_FslC9Eca8HktSRHZj3x9M` |

3. Click **Save**
4. **Redeploy** your project for changes to take effect

---

## Step 4: Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Update DNS records as shown

---

## 📱 Your Live URLs

After deployment, your site will be available at:
- **Vercel URL**: `https://shibalab-mining.vercel.app`
- **Custom Domain**: Your domain (if configured)

---

## ✅ Deployment Checklist

- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] Vercel account created
- [ ] Project imported on Vercel
- [ ] Environment variables added
- [ ] Site deployed successfully
- [ ] Custom domain configured (optional)

---

## 🔧 Troubleshooting

### Build Error?
- Check Node.js version (18+ required)
- Check build logs in Vercel dashboard

### Environment Variables Not Working?
- Make sure variable names start with `NEXT_PUBLIC_` for client-side access
- Redeploy after adding variables

### Database Connection Error?
- Verify Supabase credentials are correct
- Check if Supabase project is active

---

## 🎉 Enjoy Your Live ShibaLab Mining Platform!

**Admin Panel**: `https://your-site.vercel.app` → Click Admin button
**Credentials**: Username: `admin` | Password: `shiba@2024`
