# 🚀 Deployment Guide - SkripsiMate

## Vercel Deployment (Recommended)

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit - SkripsiMate MVP"
git push origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"New Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### 3. Add Environment Variables

Di Vercel Dashboard → Settings → Environment Variables, tambahkan:

#### Firebase (Public)
```
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx
```

#### Firebase Admin (Server-only)
```
FIREBASE_ADMIN_PRIVATE_KEY_ID=xxx
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_ADMIN_CLIENT_EMAIL=xxx
FIREBASE_ADMIN_CLIENT_ID=xxx
```

#### Supabase
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
```

#### Gemini AI
```
GEMINI_API_KEY=xxx
GEMINI_MODEL=gemini-2.0-flash-exp
GEMINI_EMBEDDING_MODEL=text-embedding-004
```

### 4. Deploy

Click **"Deploy"** - Deployment akan memakan waktu 2-3 menit.

### 5. Configure Custom Domain (Optional)

1. Vercel Dashboard → Settings → Domains
2. Add your domain
3. Follow DNS configuration instructions

## Post-Deployment Checklist

### Firebase Configuration

1. Go to Firebase Console → Authentication → Settings
2. Add production domain:
   - **Authorized domains**: Add `your-app.vercel.app`

### Supabase Configuration

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add **Site URL**: `https://your-app.vercel.app`
3. Add **Redirect URLs**:
   - `https://your-app.vercel.app/dashboard`
   - `https://your-app.vercel.app/*`

### Test Production Build

1. Visit `https://your-app.vercel.app`
2. Test auth flow (sign up, login, Google OAuth)
3. Test project creation
4. Test AI generation
5. Check browser console for errors

## Environment-Specific Settings

### Development
```env
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Production
```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

## Monitoring & Analytics

### Vercel Analytics (Built-in)
- Automatic performance monitoring
- Web Vitals tracking
- Visit Vercel Dashboard → Analytics

### Error Tracking (Optional)

#### Sentry Setup
```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

Add to `.env.local`:
```env
SENTRY_DSN=your-sentry-dsn
```

### Google Analytics (Optional)

1. Create GA4 property
2. Add to `app/layout.tsx`:

```typescript
import Script from 'next/script';

export default function RootLayout() {
  return (
    <html>
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX');
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
```

## Scaling Considerations

### When to Upgrade

#### Supabase (Free → Pro $25/mo)
- ✅ Free: Up to 500MB database
- ⚠️ Upgrade when:
  - Database > 400MB
  - Need > 2GB bandwidth/month
  - Need guaranteed uptime
  - Need point-in-time recovery

#### Gemini API (Free → Pay-as-you-go)
- ✅ Free: 2 req/min (Pro), 10 req/min (Flash)
- ⚠️ Upgrade when:
  - Need higher rate limits
  - Production with > 50 daily active users
  - Need guaranteed SLA

#### Vercel (Free → Pro $20/mo)
- ✅ Free: 100GB bandwidth, serverless functions
- ⚠️ Upgrade when:
  - Need > 100GB bandwidth/month
  - Need longer serverless execution time
  - Need team collaboration features

### Performance Optimization

#### Enable Caching
```typescript
// app/api/agent/generate/route.ts
export const revalidate = 0; // No cache for AI generation

// app/dashboard/page.tsx
export const revalidate = 60; // Cache for 60 seconds
```

#### Image Optimization
```typescript
import Image from 'next/image';

<Image
  src="/logo.png"
  width={200}
  height={100}
  alt="SkripsiMate"
  priority
/>
```

#### Database Indexing
Already implemented in `docs/database-schema.sql`:
- Indexed columns: `user_id`, `project_id`, `parent_id`
- Vector index: HNSW for fast similarity search

## Security Best Practices

### 1. Environment Variables
- ✅ Never commit `.env.local` to git
- ✅ Use Vercel environment variables
- ✅ Separate dev/prod environments

### 2. API Security
- ✅ Rate limiting (implement with Vercel)
- ✅ CORS configuration
- ✅ Input validation
- ✅ Error handling (no sensitive data in responses)

### 3. Database Security
- ✅ RLS policies enabled
- ✅ User data isolation
- ✅ Service role key server-side only

### 4. Authentication
- ✅ Firebase Auth (industry standard)
- ✅ HTTPS only (Vercel default)
- ✅ Secure session management

## Backup Strategy

### Supabase Automatic Backups
- **Free Plan**: Daily backups (7 days retention)
- **Pro Plan**: Point-in-time recovery (30 days)

### Manual Backup

```bash
# Export all tables
npx supabase db dump > backup-$(date +%Y%m%d).sql

# Restore
psql -h your-db-host -U postgres -d postgres < backup.sql
```

### Code Backup
- ✅ GitHub repository (version control)
- ✅ Vercel automatic deployments history

## Troubleshooting Production Issues

### Check Logs

**Vercel Logs:**
```bash
vercel logs your-app.vercel.app
```

**Supabase Logs:**
- Dashboard → Logs → API / Database

**Browser Console:**
- Open DevTools → Console
- Check Network tab for failed requests

### Common Issues

#### 1. "Failed to fetch" errors
- Check environment variables
- Verify API endpoints
- Check CORS configuration

#### 2. Auth not working
- Verify Firebase authorized domains
- Check Supabase redirect URLs
- Ensure HTTPS (no mixed content)

#### 3. AI generation timeout
- Increase serverless function timeout (Vercel Pro)
- Use Flash model instead of Pro (faster)
- Implement request queuing

#### 4. Database errors
- Check RLS policies
- Verify user permissions
- Check connection pool limits

## Continuous Deployment

### Automatic Deployments

Vercel automatically deploys:
- ✅ **Production**: Pushes to `main` branch
- ✅ **Preview**: Pull requests and branches

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod

# Deploy to preview
vercel
```

## Rollback Strategy

### Vercel Rollback

1. Go to Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "Promote to Production"

### Database Rollback

**Important**: Database changes are not automatically rolled back!

```sql
-- Restore from backup
psql -h your-db-host -U postgres -d postgres < backup.sql
```

## Monitoring Checklist

- [ ] Vercel deployment successful
- [ ] Firebase auth working
- [ ] Supabase connection active
- [ ] Gemini API responding
- [ ] All pages loading correctly
- [ ] No console errors
- [ ] Performance metrics acceptable
- [ ] SSL certificate valid
- [ ] Custom domain configured
- [ ] Analytics tracking

## Cost Optimization Tips

1. **Use Gemini Flash** for development (10x faster rate limit)
2. **Cache API responses** where possible
3. **Batch operations** (embeddings, database updates)
4. **Optimize images** with Next.js Image component
5. **Monitor usage** in dashboards (Vercel, Supabase, Gemini)

## Support & Resources

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Firebase Docs**: [firebase.google.com/docs](https://firebase.google.com/docs)
- **Gemini Docs**: [ai.google.dev/docs](https://ai.google.dev/docs)

---

**Deployment completed! 🎉**

Your app is now live at `https://your-app.vercel.app`

