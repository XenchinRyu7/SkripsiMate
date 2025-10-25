# 🚀 SkripsiMate - Setup Instructions

Panduan lengkap untuk menjalankan SkripsiMate secara lokal.

## 📋 Prerequisites

Pastikan sudah terinstall:
- **Node.js** 18+ ([nodejs.org](https://nodejs.org))
- **npm** atau **yarn**
- **Git**

## 🔧 Setup Steps

### 1. Clone Repository

```bash
git clone <repository-url>
cd skripsimate
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Firebase

1. Buat project baru di [Firebase Console](https://console.firebase.google.com)
2. Enable **Authentication** → **Email/Password** dan **Google**
3. Copy Firebase config dari **Project Settings**
4. Tambahkan ke `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:xxxxx
```

### 4. Setup Supabase

1. Buat project baru di [Supabase](https://supabase.com)
2. Jalankan SQL schema di **SQL Editor**:
   - Copy semua content dari `docs/database-schema.sql`
   - Paste dan execute di Supabase SQL Editor
3. Copy **Project URL** dan **Anon Key** dari **Settings > API**
4. Tambahkan ke `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...  # Optional, untuk server-side
```

### 5. Setup Gemini AI

1. Dapatkan API key dari [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Tambahkan ke `.env.local`:

```env
GEMINI_API_KEY=AIzaSyxxx...
GEMINI_MODEL=gemini-2.0-flash-exp
GEMINI_EMBEDDING_MODEL=text-embedding-004
```

### 6. Create Environment File

Copy dan rename file `.env` menjadi `.env.local`, lalu isi semua values:

```bash
cp .env .env.local
```

Edit `.env.local` dengan values yang sesuai dari Firebase, Supabase, dan Gemini.

### 7. Run Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## ✅ Verification

### Test Authentication
1. Buka `/login`
2. Sign up dengan email/password atau Google
3. Harus redirect ke `/dashboard`

### Test Database Connection
1. Create new project di dashboard
2. Check di Supabase Table Editor → `projects` table
3. Data harus tersimpan

### Test AI Generation
1. Open project yang baru dibuat
2. Click "Generate Roadmap with AI"
3. Fill form dan generate
4. Harus muncul nodes di canvas (butuh ~30-60 detik)

## 🐛 Troubleshooting

### Error: "Failed to fetch"
- Check `.env.local` file ada dan terisi dengan benar
- Restart dev server: `Ctrl+C` lalu `npm run dev` lagi

### Firebase Auth Error
- Pastikan Email/Password dan Google OAuth sudah di-enable di Firebase Console
- Check Firebase credentials di `.env.local`

### Supabase Error: "relation does not exist"
- Jalankan SQL schema di Supabase SQL Editor
- Check table `projects`, `nodes`, `node_embeddings` sudah exist

### Gemini API Error: "Rate limit exceeded"
- Gemini free tier: 2 req/min untuk Pro, 10 req/min untuk Flash
- Tunggu sebentar atau upgrade ke paid tier
- Bisa juga pakai multiple API keys

### Node/Edge tidak muncul di Canvas
- Check browser console untuk errors
- Pastikan `reactflow` dan dependencies terinstall
- Clear browser cache dan reload

## 📚 Database Schema

Schema sudah include:
- ✅ `projects` - Store user projects
- ✅ `nodes` - Store roadmap nodes
- ✅ `edges` - Store node connections
- ✅ `node_embeddings` - Store vector embeddings untuk RAG
- ✅ `chat_messages` - Store AI chat history
- ✅ RLS Policies - Row Level Security untuk data isolation
- ✅ Vector search function - `match_nodes()` untuk similarity search

## 🎨 Features Ready

✅ **Authentication**
- Email/Password sign up & login
- Google OAuth
- Protected routes

✅ **Dashboard**
- Project list with stats
- Create new project
- Empty state UI

✅ **Canvas Editor**
- React Flow board
- Drag & drop nodes
- Zoom & pan
- Minimap

✅ **AI Agent**
- Generate thesis roadmap
- Chat with AI
- Refine node details
- Break down tasks

✅ **RAG System**
- Vector embeddings
- Similarity search
- Context-aware AI responses

## 🚀 Next Steps

### For Development:
1. Tambah fitur export (JSON, Markdown)
2. Implement real-time collaboration
3. Add notification system
4. Improve mobile responsiveness

### For Production:
1. Setup custom domain di Vercel
2. Configure Firebase for production
3. Upgrade Supabase/Gemini if needed
4. Setup error monitoring (Sentry)
5. Add analytics (Google Analytics)

## 💰 Cost Estimate

**Development (Sekarang):**
- Firebase Auth: **FREE** ✅
- Supabase: **FREE** ✅
- Gemini API: **FREE** ✅
- Total: **$0/month** ✅

**Production (1000 users):**
- Firebase: **$0** (auth always free)
- Supabase: **$0-25** (upgrade if needed)
- Gemini: **$0-20** (upgrade for heavy usage)
- Vercel: **$0** (within free tier)
- Total: **$0-45/month**

## 📞 Support

Jika ada masalah:
1. Check console untuk error messages
2. Verify `.env.local` file
3. Check Supabase logs
4. Review `docs/PROGRESS.md` untuk status

## 🎉 Ready!

Aplikasi siap digunakan! Mulai buat thesis roadmap dengan AI assistance.

Happy coding! 🚀

