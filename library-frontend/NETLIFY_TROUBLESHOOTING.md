# Netlify "Page Not Found" Troubleshooting Guide

If you're seeing "Page not found" on Netlify, follow these steps:

## Step 1: Check Your Repository Structure

**Option A:** If your repository root contains the `library-frontend` folder:
```
your-repo/
  ├── library-frontend/
  │   ├── src/
  │   ├── public/
  │   ├── package.json
  │   └── netlify.toml
  └── other-files/
```

**Option B:** If your repository root IS the `library-frontend` folder:
```
library-frontend/
  ├── src/
  ├── public/
  ├── package.json
  └── netlify.toml
```

## Step 2: Verify Netlify Build Settings

Go to **Netlify Dashboard** → **Site settings** → **Build & deploy** → **Build settings**

### For Option A (repo contains library-frontend):
- **Base directory:** `library-frontend`
- **Build command:** `npm install && npm run build`
- **Publish directory:** `build`

### For Option B (repo IS library-frontend):
- **Base directory:** (leave empty or `.`)
- **Build command:** `npm install && npm run build`
- **Publish directory:** `build`

## Step 3: Verify Files Are Present

Make sure these files exist in your repository:

1. ✅ `library-frontend/public/_redirects` (should contain: `/*    /index.html   200`)
2. ✅ `library-frontend/netlify.toml`
3. ✅ `library-frontend/package.json`
4. ✅ `library-frontend/public/index.html`

## Step 4: Check Build Logs

1. Go to **Netlify Dashboard** → **Deploys**
2. Click on the latest deploy
3. Check the build logs for errors
4. Look for:
   - ✅ "Build script success"
   - ✅ "Deploy directory: build"
   - ❌ Any errors about missing files

## Step 5: Verify Build Output

After a successful build, check:
1. Go to **Deploys** → Click on deploy → **Browse published files**
2. You should see:
   - `index.html`
   - `static/` folder
   - `_redirects` file

## Step 6: Test the Redirects

1. Visit your site: `https://your-site.netlify.app`
2. Try refreshing the page (F5)
3. Try visiting a non-existent route: `https://your-site.netlify.app/test`
4. All should load your React app (not show 404)

## Step 7: Manual Fix - Update netlify.toml

If still not working, try this configuration in `netlify.toml`:

```toml
[build]
  base = "library-frontend"  # or "." if repo root IS library-frontend
  publish = "build"
  command = "npm install && npm run build"

[build.environment]
  NODE_VERSION = "18"
  DISABLE_ESLINT_PLUGIN = "true"
  CI = "false"

# Critical: SPA redirect rule
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
  force = true
```

## Step 8: Clear Cache and Redeploy

1. Go to **Deploys** → **Trigger deploy** → **Clear cache and deploy site**
2. Wait for build to complete
3. Test again

## Step 9: Check Browser Console

1. Open your site in browser
2. Press F12 to open DevTools
3. Check Console tab for JavaScript errors
4. Check Network tab - are files loading?

## Common Issues:

### Issue: "Cannot GET /"
**Solution:** The `_redirects` file is missing or not in the build folder. Make sure it's in `public/_redirects`.

### Issue: Blank page
**Solution:** Check browser console for JavaScript errors. The app might be failing to load.

### Issue: 404 on refresh
**Solution:** The redirect rule isn't working. Verify `_redirects` file exists in `build/` after deployment.

### Issue: Build fails
**Solution:** Check build logs. Common issues:
- Missing dependencies
- Node version mismatch
- ESLint errors (should be disabled with DISABLE_ESLINT_PLUGIN)

## Still Not Working?

1. **Share your Netlify build logs** (from Deploys tab)
2. **Share your repository structure** (screenshot or description)
3. **Share the exact error message** you see
4. **Check if `_redirects` file is in the build output** (Browse published files)

