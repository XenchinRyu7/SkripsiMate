# 🚀 Vercel Deployment Guide

## ⚡ Quick Setup

### 1. Deploy to Vercel

Click the button below or manually deploy:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/XenchinRyu7/SkripsiMate)

OR manually:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

---

## 🔑 Configure Environment Variables

**CRITICAL:** You MUST add all environment variables in Vercel Dashboard before deployment works!

### Step 1: Go to Vercel Dashboard

1. Go to your project in [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Settings** tab
3. Click **Environment Variables** in sidebar

### Step 2: Add Firebase Variables

**⚠️ IMPORTANT:** Firebase client variables MUST have `NEXT_PUBLIC_` prefix!

Add these variables (**All Environments** or at least **Production**):

#### Firebase Client (Public - Required for Auth)

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC... (get from Firebase Console)
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

**How to get Firebase values:**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click ⚙️ **Project Settings**
4. Scroll down to **Your apps** section
5. Copy values from **SDK setup and configuration**

#### Firebase Admin (Server-side - Optional for advanced features)

```env
FIREBASE_ADMIN_PRIVATE_KEY_ID=abc123...
FIREBASE_ADMIN_PRIVATE=-----BEGIN PRIVATE KEY-----\nMII...
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=123456789
FIREBASE_CLIENT_CERT=https://www.googleapis.com/robot/v1/metadata/x509/...
```

**How to get Firebase Admin values:**
1. Firebase Console → ⚙️ **Project Settings**
2. **Service accounts** tab
3. Click **Generate new private key**
4. Download JSON file
5. Extract values from JSON:
   - `private_key_id` → `FIREBASE_ADMIN_PRIVATE_KEY_ID`
   - `private_key` → `FIREBASE_ADMIN_PRIVATE` (keep the `\n` as is!)
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `client_id` → `FIREBASE_CLIENT_ID`
   - `client_x509_cert_url` → `FIREBASE_CLIENT_CERT`

### Step 3: Add Supabase Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (different from anon key!)
```

**How to get Supabase values:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click ⚙️ **Project Settings**
4. **API** tab
5. Copy:
   - **URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep secret!)

### Step 4: Add Gemini AI Variables

```env
GEMINI_API_KEY=AIzaSyD... (get from Google AI Studio)
GEMINI_MODEL=gemini-2.0-flash-exp
GEMINI_EMBEDDING_MODEL=text-embedding-004
```

**How to get Gemini API key:**
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with Google account
3. Click **Get API Key**
4. Click **Create API key in new project** (or select existing)
5. Copy the API key

---

## 📋 Complete Environment Variables Checklist

Copy this list and check off as you add them in Vercel:

### Required (App won't work without these):
- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `GEMINI_API_KEY`

### Optional (For AI model configuration):
- [ ] `GEMINI_MODEL` (default: gemini-2.0-flash-exp)
- [ ] `GEMINI_EMBEDDING_MODEL` (default: text-embedding-004)

### Optional (For advanced admin features):
- [ ] `FIREBASE_ADMIN_PRIVATE_KEY_ID`
- [ ] `FIREBASE_ADMIN_PRIVATE`
- [ ] `FIREBASE_CLIENT_EMAIL`
- [ ] `FIREBASE_CLIENT_ID`
- [ ] `FIREBASE_CLIENT_CERT`

---

## 🔧 After Adding Variables

### Redeploy Your App

After adding all environment variables:

1. **Option A: Automatic Redeploy**
   - Vercel will detect changes and redeploy automatically
   - Check **Deployments** tab

2. **Option B: Manual Redeploy**
   - Go to **Deployments** tab
   - Click ⋯ on latest deployment
   - Click **Redeploy**

### Verify Deployment

1. Wait for deployment to finish (usually 1-2 minutes)
2. Click **Visit** button
3. Try to login/signup
4. If error persists, check browser console (F12)

---

## 🐛 Common Issues & Solutions

### Issue: `auth/invalid-api-key`

**Cause:** Firebase API key not set or incorrect in Vercel

**Solution:**
1. Check that `NEXT_PUBLIC_FIREBASE_API_KEY` is set in Vercel
2. Verify the key is correct (copy from Firebase Console)
3. Make sure there's no extra spaces or newlines
4. Redeploy after adding/fixing

### Issue: `Failed to fetch` or CORS errors

**Cause:** Firebase domain not authorized for Vercel domain

**Solution:**
1. Go to Firebase Console → Authentication → Settings
2. **Authorized domains** section
3. Add your Vercel domain: `your-app.vercel.app`
4. Also add custom domain if you have one

### Issue: `Supabase RLS policy violation`

**Cause:** Row Level Security blocking requests

**Solution:**
1. Check that `SUPABASE_SERVICE_ROLE_KEY` is set correctly
2. Verify RLS policies in Supabase Dashboard
3. See [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md)

### Issue: `Gemini API quota exceeded`

**Cause:** Free tier rate limit (2 req/min for Pro, 10 req/min for Flash)

**Solution:**
1. Wait a minute and try again
2. App auto-retries with exponential backoff
3. Falls back to Flash model if Pro fails
4. Consider upgrading to paid tier for production

### Issue: Variables not updating

**Cause:** Vercel caches old values

**Solution:**
1. Go to **Deployments** tab
2. Delete latest deployment
3. Push new commit or click **Redeploy**
4. Hard refresh browser (Ctrl+Shift+R)

---

## 🔒 Security Best Practices

### ✅ Safe to Expose (Public)
These are prefixed with `NEXT_PUBLIC_` and exposed to browser:
- Firebase client config (API key, project ID, etc.)
- Supabase URL and anon key

**Why safe?**
- Firebase API key is NOT a secret (protected by domain restrictions)
- Supabase anon key is protected by Row Level Security (RLS)

### ⛔ NEVER Expose (Secret)
Keep these server-side only:
- `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS!)
- `GEMINI_API_KEY` (quota & billing)
- `FIREBASE_ADMIN_PRIVATE` (full admin access)

**How to keep safe:**
- Don't prefix with `NEXT_PUBLIC_`
- Only use in API routes (server-side)
- Never log or console.log these values

---

## 📊 Domain Setup (Optional)

### Add Custom Domain

1. Go to **Settings** → **Domains**
2. Click **Add**
3. Enter your domain (e.g., `skripsimate.com`)
4. Follow DNS configuration steps

### Update Firebase Authorized Domains

After adding custom domain:
1. Firebase Console → Authentication → Settings
2. **Authorized domains** → Add your custom domain
3. Keep `vercel.app` domain too (for preview deployments)

---

## 🎯 Environment-Specific Variables

### Production vs Preview vs Development

Vercel supports 3 environments:
- **Production** - your main domain
- **Preview** - PR/branch deployments
- **Development** - local `vercel dev`

**Recommendation:**
Set variables for **All Environments** (Production, Preview, Development)

**Why?**
- Preview deployments will work
- Local development with `vercel dev` will work
- Consistent behavior across environments

**Advanced:** You can set different values per environment:
- Production API keys (with higher limits)
- Development API keys (separate project for testing)

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] App loads without errors
- [ ] Login with email works
- [ ] Google OAuth login works
- [ ] Dashboard shows correctly
- [ ] Can create new project
- [ ] AI generation works
- [ ] Canvas loads and works
- [ ] Nodes can be created/edited/deleted
- [ ] Export works (JSON/Markdown)
- [ ] No console errors (F12 → Console)

---

## 📞 Still Having Issues?

1. **Check Vercel Logs:**
   - Deployments → Click deployment → **Functions** tab
   - Look for errors in runtime logs

2. **Check Browser Console:**
   - Press F12 → Console tab
   - Look for red errors

3. **Ask for Help:**
   - Open [GitHub Issue](https://github.com/XenchinRyu7/SkripsiMate/issues)
   - Include:
     - Error message
     - Browser console screenshot
     - Vercel deployment URL
     - Steps to reproduce

---

## 🎉 Success!

Once everything is working:

1. Share your deployment URL! 🎊
2. Star the repo ⭐
3. Tweet about it 📣
4. Submit to hackathon 🏆

**Deployment URL format:**
- Default: `https://skripsimate.vercel.app`
- Custom: `https://your-domain.com`

---

Made with ❤️ by [Saeful Rohman](https://github.com/XenchinRyu7)

