# 🚀 Deploy ML Server to Render

This guide shows how to deploy the ML server as a separate service on Render.

## 📋 Prerequisites

- Render.com account (free tier available)
- GitHub repository with ML code
- The `ml/` folder pushed to GitHub

## 🔧 Step-by-Step Deployment

### Step 1: Connect GitHub to Render

1. Go to [Render.com](https://render.com)
2. Click **New** → **Web Service**
3. Connect your GitHub account
4. Select the **MedExplain** repository

### Step 2: Configure ML Service

Fill in the configuration:

| Setting | Value |
|---------|-------|
| **Name** | `medexplain-ml` |
| **Environment** | Python |
| **Region** | Oregon (or your preferred region) |
| **Branch** | main |
| **Build Command** | `pip install -r ml/requirements.txt` |
| **Start Command** | `cd ml && uvicorn main:app --host 0.0.0.0 --port $PORT` |
| **Plan** | Free (or paid for better specs) |

### Step 3: Add Environment Variables

In Render dashboard, add these environment variables:

```
PYTHON_VERSION = 3.11.4
PORT = 8000
```

### Step 4: Deploy

1. Click **Create Web Service**
2. Wait for deployment (2-3 minutes)
3. You'll get a URL like: `https://medexplain-ml-xxxxx.onrender.com`

### Step 5: Update Backend

After ML server is deployed, update the backend configuration:

1. Go to your **Backend Service** on Render
2. Go to **Environment**
3. Update/Add this variable:
   ```
   ML_API_URL=https://medexplain-ml-xxxxx.onrender.com
   ```
4. Click **Save** (Backend will auto-redeploy)

---

## 📝 Update Backend `.env` Locally (Optional)

For local testing with deployed ML server:

```bash
# backend/.env
ML_API_URL=https://medexplain-ml-xxxxx.onrender.com
```

Then restart backend:
```bash
npm start
```

---

## ✅ Test the Deployment

1. Upload a medical image from frontend
2. Check that analysis works
3. Check Render logs for any errors:
   - Backend logs: `medexplain-3wzb` service
   - ML logs: `medexplain-ml` service

---

## 🔍 Troubleshooting

**If you see 500 errors in frontend:**

1. Check ML server logs on Render
2. Verify `ML_API_URL` is correct in backend environment
3. Make sure `render.yaml` has correct `startCommand`

**If models fail to load:**

1. Check that `ml/models/` folder exists with:
   - `diabetes_model.pkl`
   - `diabetes_scaler.pkl`
   - `heart_model.pkl`
   - `heart_scaler.pkl`
2. Push these files to GitHub
3. Redeploy ML service

**Render free tier limitations:**

- 750 free hours/month per service
- Auto-spins down after 15 minutes of inactivity
- Cold starts (~30 seconds)

For production, upgrade to **paid tier**.

---

## 💡 After Deployment

Once ML server is live on Render:
- Frontend on Vercel connects to Backend on Render ✅
- Backend on Render connects to ML server on Render ✅
- Everything is cloud-based! ☁️

No need for local ML server or ngrok tunnels!

---

## 📞 Need Help?

1. Check Render service logs for errors
2. Verify all environment variables are set
3. Ensure `requirements.txt` has all dependencies
4. Check that `render.yaml` has correct configuration
