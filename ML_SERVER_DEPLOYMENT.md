# 🔧 ML Server Deployment Guide

## Problem
Backend on Render tries to reach `http://localhost:5001` for ML analysis, but:
- `localhost` doesn't exist on Render's servers
- Result: **500 error** when analyzing medical images

## Solution

### Quick Fix: Use ngrok (5 minutes - for testing)

**Step 1: Install ngrok**
```powershell
# Download from: https://ngrok.com/download
# Or use chocolatey:
choco install ngrok
```

**Step 2: Start ML Server Locally**
```powershell
cd "C:\Users\Anjali\Downloads\MedExplain-main (1)\MedExplain-main\ml"
python -m uvicorn image_analyzer:app --reload --port 5001
```

**Step 3: Expose with ngrok**
```powershell
# Open new terminal
ngrok http 5001
```
You'll get a URL like: `https://abc123xyz.ngrok.io`

**Step 4: Update Render Environment**
1. Go to Render Dashboard
2. Select your MedExplain backend service
3. Go to **Environment → Environment Variables**
4. Add/Update:
   ```
   ML_API_URL=https://abc123xyz.ngrok.io
   ```
5. **Redeploy**

**Step 5: Test**
- Go to your app and try analyzing an image
- Should work! ✅

---

### Permanent Fix: Deploy ML Server to Render (Best)

**Option A: Separate Render Service**

1. Create new Web Service on Render
2. Connect your GitHub repo
3. Set root directory: `ml`
4. Build command: `pip install -r requirements.txt`
5. Start command: `python -m uvicorn image_analyzer:app --host 0.0.0.0 --port 10000`
6. Set environment variables (if needed)
7. Get the ML server URL (e.g., `https://medexplain-ml.onrender.com`)
8. Go to backend service on Render
9. Add environment variable:
   ```
   ML_API_URL=https://medexplain-ml.onrender.com
   ```
10. Redeploy backend

**Option B: Use Railway or Hugging Face Spaces**

Deploy ML server to Railway:
1. Go to [Railway](https://railway.app)
2. Create new project
3. Deploy ML folder
4. Get URL and add to Render backend ML_API_URL

---

## Environment Variables Needed

### Backend on Render
```
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
EMAIL_USER=...
EMAIL_PASS=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=https://your-backend-url/api/auth/google/callback
ML_API_URL=https://your-ml-server-url  ← Important!
```

### ML Server on Render
(No special environment variables needed)

---

## Testing

After deploying ML server and updating ML_API_URL:

1. Go to https://med-explain-ten.vercel.app
2. Navigate to Scan page
3. Upload a medical image
4. Click Analyze
5. Should see prediction result within 5-10 seconds ✅

If still getting 500 errors:
- Check Render backend logs for the actual error
- Verify ML_API_URL is correct
- Restart/redeploy both services

---

## Current Status

| Component | Status | Location |
|-----------|--------|----------|
| Frontend | ✅ Running | Vercel: `med-explain-ten.vercel.app` |
| Backend | ✅ Running | Render: `modexplain-3wzb.onrender.com` |
| ML Server | ❌ Not accessible | Needs deployment or ngrok tunnel |
| Database | ✅ Running | MongoDB (check connection) |

**Missing:** ML Server URL must be set in backend environment variables
