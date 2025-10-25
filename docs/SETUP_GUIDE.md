# SkripsiMate - Setup Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Prerequisites

Pastikan sudah install:
- **Node.js 18+** - [Download](https://nodejs.org)
- **Git** (optional)
- **Code Editor** (VS Code recommended)

### Step 2: Install Dependencies

Dependencies sudah terinstall! ✅

```bash
npm install  # Already done
```

### Step 3: Setup Firebase

1. **Buat Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Click "Add project"
   - Enter project name: `skripsimate` (or any name)
   - Disable Google Analytics (optional)
   - Click "Create project"

2. **Enable Authentication**
   - In Firebase Console, go to **Authentication**
   - Click "Get started"
   - Enable **Email/Password** sign-in method
   - Enable **Google** sign-in method
   - Add your email as authorized domain

3. **Get Firebase Config**
   - Go to **Project Settings** (gear icon)
   - Scroll to "Your apps" section
   - Click **Web** icon (`</>`)
   - Register app with name "SkripsiMate Web"
   - Copy the config object

4. **Add to .env.local**
   Create `.env.local` file di root project:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=skripsimate.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=skripsimate
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=skripsimate.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:xxx
   ```

### Step 4: Setup Supabase

1. **Buat Supabase Project**
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Click "New project"
   - Organization: Personal (or create new)
   - Project name: `skripsimate`
   - Database password: (generate strong password - SAVE THIS!)
   - Region: Southeast Asia (Singapore)
   - Click "Create new project" (wait 2-3 minutes)

2. **Run Database Migrations**
   - Go to **SQL Editor**
   - Create new query
   - Copy paste SQL dari `docs/database-schema.sql`
   - Click "Run"

3. **Get Supabase Keys**
   - Go to **Settings → API**
   - Copy:
     - **Project URL**: `https://xxx.supabase.co`
     - **anon public**: `eyJxxx...`
     - **service_role**: `eyJxxx...` (click "Reveal" first)

4. **Add to .env.local**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
   SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
   ```

### Step 5: Setup Gemini AI

1. **Get API Key**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Click "Create API key"
   - Select "Create API key in new project" (or use existing)
   - Copy the API key (starts with `AIzaSy...`)

2. **Add to .env.local**
   ```env
   GEMINI_API_KEY=AIzaSyxxx...
   GEMINI_MODEL=gemini-2.5-pro-latest
   GEMINI_EMBEDDING_MODEL=text-embedding-004
   ```

### Step 6: Final .env.local

Your complete `.env.local` should look like:

```env
# FIREBASE
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyxxx...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=skripsimate.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=skripsimate
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=skripsimate.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:xxx

# SUPABASE
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# GEMINI
GEMINI_API_KEY=AIzaSyxxx...
GEMINI_MODEL=gemini-2.5-pro-latest
GEMINI_EMBEDDING_MODEL=text-embedding-004

# APP
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Step 7: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

You should see the Login page! 🎉

---

## ✅ What's Been Done

### ✅ Phase 1: Foundation (COMPLETED)

- [x] Project setup (Next.js 15 + TypeScript)
- [x] Install dependencies (React Flow, Firebase, Supabase, Gemini)
- [x] Clean Architecture folder structure
- [x] Firebase Auth configuration
- [x] Supabase client configuration
- [x] Gemini AI client configuration
- [x] Tailwind CSS Glassmorphism theme
- [x] TypeScript types & interfaces
- [x] Utility functions & helpers
- [x] Auth hook & context
- [x] UI Components (Button, Input, Card)
- [x] Login page
- [x] Route protection middleware
- [x] .gitignore & documentation

### 🚧 Phase 2: Dashboard & Canvas (NEXT)

- [ ] Dashboard layout
- [ ] Project list component
- [ ] Create project modal
- [ ] Canvas page with React Flow
- [ ] Node components (Phase, Step, Substep)
- [ ] AI Chat panel

### 📅 Phase 3: AI Integration

- [ ] Gemini API routes
- [ ] Generate roadmap endpoint
- [ ] RAG system (embeddings + vector search)
- [ ] AI agent actions (refine, break down, etc.)
- [ ] Chat functionality

---

## 🐛 Troubleshooting

### Firebase Auth Not Working

1. Check Firebase console → Authentication → Sign-in methods
2. Make sure Email/Password and Google are **enabled**
3. Check if localhost is in authorized domains

### Supabase Connection Error

1. Check if project is "Active" (not paused)
2. Verify SUPABASE_URL and keys are correct
3. Check if RLS policies are set correctly

### Gemini API Rate Limited

1. Free tier: 2 requests/minute for Gemini 2.5 Pro
2. Use Gemini Flash for development (10 req/min)
3. Or upgrade to paid tier

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Restart dev server
npm run dev
```

---

## 📚 Next Steps

1. **Test Login**: Try email/password and Google sign-in
2. **Build Dashboard**: Create project list UI
3. **Implement Canvas**: React Flow board
4. **Add AI**: Gemini integration for roadmap generation

---

## 💡 Tips

- Use **Gemini Flash** during development (faster, higher rate limit)
- Switch to **Gemini 2.5 Pro** for final demo
- Cache embeddings to save quota
- Test with small datasets first

---

## 🎉 You're Ready!

Sekarang tinggal:
1. Fill `.env.local` dengan credentials dari Firebase, Supabase, dan Gemini
2. Run `npm run dev`
3. Mulai build Dashboard & Canvas!

**Total Setup Time:** ~5-10 minutes (if you have accounts ready)

**Total Cost:** $0 🎉

