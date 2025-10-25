# Supabase Database Setup Guide

## 🚀 Quick Setup Steps

### 1. **Run Database Schema**

1. Login ke [Supabase Dashboard](https://app.supabase.com)
2. Pilih project Anda
3. Klik **SQL Editor** di sidebar kiri
4. Klik **New Query**
5. Copy paste semua content dari `docs/database-schema.sql`
6. Klik **Run** atau tekan `Ctrl+Enter`

### 2. **Verify Tables Created**

1. Klik **Table Editor** di sidebar
2. Pastikan tables berikut sudah ada:
   - ✅ `projects`
   - ✅ `nodes`
   - ✅ `edges`
   - ✅ `node_embeddings`
   - ✅ `chat_messages`

### 3. **Check RLS (Row Level Security)**

RLS policies sudah otomatis dibuat oleh schema. Verify dengan:

1. Klik table `projects` → **RLS policies**
2. Pastikan policy `Users can only see their own projects` ada dan **enabled**

### 4. **Test Connection**

1. Jalankan app: `npm run dev`
2. Login dengan Google
3. Buka browser Console (F12)
4. Lihat apakah ada detailed error logs

## 🔍 Common Issues & Solutions

### Issue 1: "relation 'projects' does not exist"
**Solusi:** Schema belum di-run. Jalankan `database-schema.sql` di SQL Editor.

### Issue 2: "new row violates row-level security policy"
**Solusi:** 
- RLS policy menggunakan `auth.uid()` dari Supabase Auth
- Kita pakai Firebase Auth, jadi perlu disable RLS atau modify policy

**Quick Fix - Disable RLS untuk Development:**

```sql
-- Run this in SQL Editor
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE nodes DISABLE ROW LEVEL SECURITY;
ALTER TABLE edges DISABLE ROW LEVEL SECURITY;
ALTER TABLE node_embeddings DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;
```

⚠️ **PENTING**: Ini untuk development only! Di production harus re-enable RLS.

### Issue 3: Empty error object `{}`
**Solusi:** Check detailed error di console sekarang sudah ditambahkan logs:
- `error.message`
- `error.details`
- `error.hint`

## 🔐 Production RLS Setup (TODO)

Untuk production, kita perlu implement custom RLS yang compatible dengan Firebase Auth:

**Option 1: Firebase Admin SDK di Middleware**
- Verify Firebase token di server
- Set Supabase user context
- Enable RLS

**Option 2: Custom Claims di JWT**
- Add Firebase user ID ke Supabase JWT
- Use custom RLS policy

**Option 3: Hybrid Auth**
- Migrate ke Supabase Auth
- Use Firebase as OAuth provider only

## 📝 Next Steps

1. ✅ Run schema dari `database-schema.sql`
2. ✅ Disable RLS untuk development
3. ✅ Test create/read projects
4. ✅ Verify embeddings work
5. 🔲 Setup production RLS (later)

## 🆘 Still Having Issues?

1. Check Supabase logs: **Database** → **Logs**
2. Check API logs: **API** → **Logs**
3. Verify environment variables di `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

