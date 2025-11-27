# Deploying Library Management System to Netlify

This guide will help you deploy your React frontend to Netlify.

## Prerequisites

1. A GitHub, GitLab, or Bitbucket account (for Git-based deployment)
2. A Netlify account (free at https://www.netlify.com)
3. Your project pushed to a Git repository

## Method 1: Deploy via Netlify Dashboard (Recommended for Beginners)

### Step 1: Prepare Your Repository

1. Make sure your code is committed and pushed to GitHub/GitLab/Bitbucket:
   ```bash
   git add .
   git commit -m "Ready for Netlify deployment"
   git push origin main
   ```

### Step 2: Connect to Netlify

1. Go to [https://app.netlify.com](https://app.netlify.com)
2. Sign up or log in (you can use GitHub to sign in)
3. Click **"Add new site"** → **"Import an existing project"**
4. Choose your Git provider (GitHub, GitLab, or Bitbucket)
5. Authorize Netlify to access your repositories
6. Select your repository containing the `library-frontend` folder

### Step 3: Configure Build Settings

Netlify should auto-detect React, but verify these settings:

- **Base directory:** `library-frontend` (if your repo root contains the frontend folder)
- **Build command:** `npm run build`
- **Publish directory:** `library-frontend/build`

**OR** if your repository root IS the `library-frontend` folder:
- **Base directory:** (leave empty)
- **Build command:** `npm run build`
- **Publish directory:** `build`

### Step 4: Deploy

1. Click **"Deploy site"**
2. Wait for the build to complete (usually 2-5 minutes)
3. Once deployed, you'll get a URL like: `https://random-name-123456.netlify.app`

### Step 5: Customize Your Domain (Optional)

1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"** to use your own domain
3. Or click **"Change site name"** to change the Netlify subdomain

---

## Method 2: Deploy via Netlify CLI

### Step 1: Install Netlify CLI

```bash
npm install -g netlify-cli
```

### Step 2: Login to Netlify

```bash
netlify login
```

This will open your browser to authenticate.

### Step 3: Navigate to Your Frontend Directory

```bash
cd library-frontend
```

### Step 4: Initialize Netlify Site

```bash
netlify init
```

Follow the prompts:
- Create & configure a new site
- Choose your team
- Site name (or leave blank for auto-generated)
- Build command: `npm run build`
- Directory to deploy: `build`

### Step 5: Deploy

```bash
# Build and deploy
netlify deploy --prod
```

Or for a draft/preview deployment:
```bash
netlify deploy
```

---

## Method 3: Drag & Drop Deployment

### Step 1: Build Your Project Locally

```bash
cd library-frontend
npm install
npm run build
```

### Step 2: Deploy

1. Go to [https://app.netlify.com](https://app.netlify.com)
2. Drag and drop the `library-frontend/build` folder onto the Netlify dashboard
3. Your site will be live in seconds!

**Note:** This method requires manual redeployment for updates.

---

## Configuration Files

The project includes `netlify.toml` which automatically configures:
- Build settings
- SPA routing (redirects all routes to index.html)
- Security headers
- Caching for static assets

---

## Environment Variables (If Needed)

If you need to set environment variables:

1. Go to **Site settings** → **Environment variables**
2. Add your variables (e.g., API URLs)
3. Redeploy your site

---

## Continuous Deployment

Once connected via Git:
- Every push to your main branch automatically triggers a new deployment
- Pull requests get preview deployments automatically
- You can see deployment history in the Netlify dashboard

---

## Troubleshooting

### Build Fails

1. Check the build logs in Netlify dashboard
2. Ensure `package.json` has all dependencies
3. Try building locally: `npm run build`

### 404 Errors on Refresh

The `netlify.toml` file includes redirect rules for SPAs. If you still see 404s:
- Verify the `netlify.toml` file is in your repository
- Check that the redirect rule is correct

### Node Version Issues

If you need a specific Node version, add to `netlify.toml`:
```toml
[build.environment]
  NODE_VERSION = "18"
```

---

## Quick Reference

- **Netlify Dashboard:** https://app.netlify.com
- **Documentation:** https://docs.netlify.com
- **Build logs:** Available in the Netlify dashboard under "Deploys"

---

## Your Site is Live! 🎉

After deployment, your Library Management System will be accessible at:
- `https://your-site-name.netlify.app`

Share this URL with others to use your application!

