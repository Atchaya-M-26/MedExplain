# 🚀 Deployment Guide - MedExplain

## Production URLs
- **Frontend (Vercel):** https://med-explain-ten.vercel.app
- **Backend (Render):** https://modexplain-3wzb.onrender.com
- **API Base URL:** https://modexplain-3wzb.onrender.com/api

## ⚠️ Current Issue: 401 Errors
Frontend on Vercel is trying to reach `localhost:5000` instead of the Render backend.

## ✅ Solution: Update Vercel Environment Variable

### Step 1: Go to Vercel Dashboard
1. Visit [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your **MedExplain** project
3. Go to **Settings** tab

### Step 2: Add Environment Variable
1. Click **Environment Variables**
2. Add new variable:
   - **Name:** `REACT_APP_API_URL`
   - **Value:** `https://modexplain-3wzb.onrender.com/api`
3. Click **Save**

### Step 3: Redeploy
1. Go to **Deployments** tab
2. Find latest deployment
3. Click the **...** menu → **Redeploy**
4. Or simply do `git push` to auto-trigger new deployment

### Step 4: Verify
After redeployment:
1. Go to https://med-explain-ten.vercel.app
2. Open **Console** (F12)
3. All API calls should now go to `modexplain-3wzb.onrender.com` instead of `localhost:5000`
4. Errors should be gone ✅

## 📋 Backend Render Configuration

Your Render backend (`modexplain-3wzb.onrender.com`) needs these environment variables set:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/medexplain
JWT_SECRET=your-secret-key
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
GOOGLE_CLIENT_ID=your-google-id
GOOGLE_CLIENT_SECRET=your-google-secret
GOOGLE_CALLBACK_URL=https://modexplain-3wzb.onrender.com/api/auth/google/callback
NODE_ENV=production
```

## 📋 Frontend Vercel Configuration

Your Vercel frontend needs:
```
REACT_APP_API_URL=https://modexplain-3wzb.onrender.com/api
```

## 🔐 Google OAuth Configuration

Update Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. **APIs & Services → Credentials**
4. Edit your OAuth 2.0 Client
5. Add **Authorized JavaScript origins:**
   ```
   https://med-explain-ten.vercel.app
   ```
6. Add **Authorized redirect URIs:**
   ```
   https://med-explain-ten.vercel.app
   https://med-explain-ten.vercel.app/auth/google
   https://modexplain-3wzb.onrender.com/api/auth/google/callback
   ```
7. Save

## ✅ Testing Checklist

After updating environment variables:

- [ ] Navigate to https://med-explain-ten.vercel.app/timeline
- [ ] Check Console (F12) - no more 401 errors
- [ ] Can view history
- [ ] Can upload images
- [ ] Can use Google Sign-In
- [ ] Can access Profile
- [ ] Can view deleted history

## 🆘 Troubleshooting

### Still Getting 401 Errors?
1. Clear browser cache (Ctrl+Shift+Delete)
2. Refresh page (Ctrl+F5)
3. Verify Vercel environment variable is saved
4. Wait 2-3 minutes for redeployment to complete

### Render Backend Not Responding?
1. Visit https://modexplain-3wzb.onrender.com/api/health
2. Check Render logs: Render Dashboard → Your Service → Logs
3. Verify MongoDB URI is correct
4. Check all environment variables are set

### CORS Errors?
Backend needs CORS enabled for Vercel domain. Check `backend/server.js`:
```javascript
app.use(cors({
  origin: ['https://med-explain-ten.vercel.app', 'http://localhost:3000'],
  credentials: true
}));
```

## 📞 Quick Links
- Render Service: https://dashboard.render.com
- Vercel Project: https://vercel.com/dashboard
- Google Cloud Console: https://console.cloud.google.com
