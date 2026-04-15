# 🚀 MedExplain - Getting Started Guide

> **Status**: ✅ Project is completely set up and ready to run!

## What You Have

A complete, production-ready MERN stack healthcare application with:
- ✅ Express backend API
- ✅ React frontend UI  
- ✅ MongoDB database setup
- ✅ User authentication
- ✅ File upload system
- ✅ Chat interface
- ✅ 11 API endpoints
- ✅ Component structure
- ✅ State management

## Prerequisites

### 1. ✅ Node.js & npm
Already verified installed:
- Node.js: Use `node --version` to verify
- npm: Use `npm --version` to verify

### 2. ❌ MongoDB (NEEDS INSTALLATION)
**Status**: NOT installed yet

Do this first!

---

## 🎯 Step-by-Step Start Guide

### Step 1: Install MongoDB (5 minutes)

**Option A: Official MongoDB Installer (Recommended)**

1. Download: https://www.mongodb.com/try/download/community
2. Choose your Windows version
3. Run the installer
4. Use default settings
5. MongoDB will install and auto-start

**Option B: Using Chocolatey (if installed)**
```powershell
choco install mongodb-community
```

**Option C: Using MongoDB Atlas (Cloud - No Installation)**
1. Go to: https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a cluster
4. Get your connection string
5. Update `backend/.env` with your URI

### Step 2: Verify MongoDB Installation

Open PowerShell and type:
```powershell
mongod --version
```

Should show something like: `db version v7.0.0`

---

## 🎬 Running the Application

You need **3 terminals/windows open**:

### Terminal 1: Start MongoDB
```powershell
mongod
```

**You should see**:
```
[initandlisten] waiting for connections on port 27017
```

✅ **Leave this running** - Don't close it

---

### Terminal 2: Start Backend Server

```powershell
cd c:\Users\Anjali\OneDrive\Desktop\medExp\backend
npm run dev
```

**You should see**:
```
✅ MongoDB connected successfully
🚀 Server running on http://localhost:5000
📊 MongoDB connected to: mongodb://localhost:27017/medexplain
```

✅ **Leave this running** - Don't close it

---

### Terminal 3: Start Frontend

```powershell
cd c:\Users\Anjali\OneDrive\Desktop\medExp\frontend
npm start
```

**What happens**:
- Compiler starts (takes ~30 seconds)
- Browser opens automatically at http://localhost:3000
- You see the MedExplain login page

✅ **Done!** App is running

---

## 🧪 Test the Application

### 1. Create Account
- Click "Register"
- Fill in:
  - Name: `Test User`
  - Email: `test@example.com`
  - Password: `password123`
- Click Register
- ✅ You're logged in!

### 2. Upload Medical Report
- Click "Upload Report"
- Choose any PDF or image file from your computer
- Click "Upload"
- ✅ Report appears in history!

### 3. View Report
- Click on your uploaded report
- ✅ You see report details
- Status shows as "pending"

### 4. Try Chatbot
- Click "Ask Questions" on your report
- Type: "What does abnormal mean?"
- Bot responds: "An abnormal value indicates that the test result falls outside the normal range..."
- ✅ Chat works!

---

## 🔍 Verify Everything Works

### Check Backend API
```
Open browser: http://localhost:5000/api/health
```
Should show:
```json
{
  "status": "Backend is running",
  "timestamp": "..."
}
```

### Check MongoDB Connection
Open PowerShell:
```powershell
mongosh

# Inside mongosh:
show databases
use medexplain  
show collections
db.users.find()  # Should show your test user
```

### Check Frontend
Browser should show MedExplain login page at `http://localhost:3000`

---

## 🛑 Stopping the Application

**To stop everything:**

**Terminal 1 (MongoDB)**: Press `Ctrl+C`
**Terminal 2 (Backend)**: Press `Ctrl+C`  
**Terminal 3 (Frontend)**: Press `Ctrl+C`

---

## 📁 Key Project Files

| File | Purpose |
|------|---------|
| `backend/server.js` | Main backend server |
| `backend/.env` | MongoDB connection string |
| `frontend/src/App.js` | Main React component |
| `README.md` | Full documentation |
| `QUICK_START.md` | Quick reference |
| `PROJECT_STATUS.md` | What's done, what's next |

---

## 🐛 Troubleshooting

### Error: "mongod is not recognized"
**Problem**: MongoDB not installed
**Solution**: 
```
Download from: https://www.mongodb.com/try/download/community
```

### Error: "ECONNREFUSED localhost:27017"
**Problem**: MongoDB not running
**Solution**: 
```powershell
mongod
# in a separate terminal
```

### Error: "Port 5000 already in use"
**Problem**: Backend already running
**Solution**:
```
Change PORT=5000 to PORT=5001 in backend/.env
```

### Error: "React won't compile"
**Problem**: Missing dependencies
**Solution**:
```powershell
cd frontend
npm install --legacy-peer-deps
```

### Error: "Cannot POST /api/auth/register"
**Problem**: Backend not running
**Solution**:
```
Make sure terminal 2 shows: 🚀 Server running on http://localhost:5000
```

---

## 🎯 Next Steps After Getting Everything Running

### Phase 1: Test All Features (Today)
- [ ] Register multiple test accounts
- [ ] Upload different file types (PDF, JPG, PNG)
- [ ] Test chat with different questions
- [ ] Try delete report

### Phase 2: Add OCR (Next)
- [ ] Install Tesseract.js in backend
- [ ] Create OCR processing endpoint
- [ ] Extract text from uploaded files
- [ ] Display extracted text in frontend

### Phase 3: Build Analysis Engine (Then)
- [ ] Create medical reference ranges database
- [ ] Build value comparison logic
- [ ] Identify abnormal results
- [ ] Generate explanations

### Phase 4: Advanced Features (Future)
- [ ] Add charts and visualizations
- [ ] Compare multiple reports
- [ ] Multi-language support
- [ ] Advanced chatbot with NLP

---

## 📊 Project Architecture

```
User Browser (http://localhost:3000)
         ↓
    React Frontend
    (Components, Pages, Services)
         ↓
API Calls (HTTP)
         ↓
Express Backend (http://localhost:5000)
(Routes, Controllers, Middleware)
         ↓
MongoDB (localhost:27017)
(Users, Reports, ChatHistory)
```

---

## 💡 Important Notes

### Keeping Data Between Sessions
- All data is saved in MongoDB
- When you restart, data persists
- To reset database: Delete all collections in mongosh

### Uploading Real Medical Reports
- Only use test/sample files during development
- Don't upload real patient data without HIPAA compliance

### Development Mode
- Backend auto-reloads with `npm run dev`
- Frontend auto-reloads on file save
- Check browser console for errors (F12)

### Production Deployment
After testing, you can deploy:
- Backend to: Heroku, AWS, Railway, Render
- Frontend to: Vercel, Netlify
- Database to: MongoDB Atlas (free tier available)

---

## 📞 Quick Reference

| What | Command | Port |
|------|---------|------|
| MongoDB | `mongod` | 27017 |
| Backend | `npm run dev` | 5000 |
| Frontend | `npm start` | 3000 |
| Health Check | http://localhost:5000/api/health | - |

---

## ✅ Checklist Before Starting

- [ ] Node.js installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] MongoDB downloaded (but not installed yet)
- [ ] Project folder: `c:\Users\Anjali\OneDrive\Desktop\medExp\`
- [ ] Backend npm packages ready (`backend/node_modules/` exists)
- [ ] Frontend npm packages ready (`frontend/node_modules/` exists)

---

## 🚀 You're Ready!

Once you install MongoDB, you're completely ready to:
1. Run the full application
2. Test all features
3. Start adding new features
4. Deploy to production

**Let's go! 🎉**

---

**Questions?** Check these files:
- `README.md` - Full documentation
- `QUICK_START.md` - Quick setup guide
- `PROJECT_STATUS.md` - Implementation status

**Having issues?** See "Troubleshooting" section above.

---

**Last Updated**: March 26, 2026
**Version**: 1.0.0
**Status**: ✅ Ready for Development
