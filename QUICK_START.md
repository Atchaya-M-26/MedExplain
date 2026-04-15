# MedExplain - Quick Start Guide

## 🚀 Getting Started (5 minutes)

### Step 1: Install MongoDB Locally

**Option A: Using MongoDB Community Server (Recommended)**

1. Download from: https://www.mongodb.com/try/download/community
2. Choose Windows platform
3. Run the installer
4. Keep default settings (installs to `C:\Program Files\MongoDB\Server\7.0`)
5. MongoDB Service will auto-start

**Option B: Using MongoDB Atlas (Cloud - No installation needed)**
- Go to https://www.mongodb.com/cloud/atlas
- Create free account
- Create cluster
- Get connection string
- Update `backend/.env` with your MongoDB URI

### Step 2: Verify MongoDB Installation

Open PowerShell and run:
```powershell
mongod --version
```

You should see something like: `db version v7.0.0`

### Step 3: Start the Project

**Terminal 1 - Start MongoDB (if using local):**
```powershell
mongod
```
Leave this running. You should see: `waiting for connections on port 27017`

**Terminal 2 - Start Backend:**
```powershell
cd c:\Users\Anjali\OneDrive\Desktop\medExp\backend
npm run dev
```
You should see: `🚀 Server running on http://localhost:5000`

**Terminal 3 - Start Frontend:**
```powershell
cd c:\Users\Anjali\OneDrive\Desktop\medExp\frontend
npm start
```
Browser should open automatically at http://localhost:3000

## ✅ Testing the App

1. **Register**: Go to http://localhost:3000/register
   - Email: `test@example.com`
   - Password: `password123`

2. **Upload Report**: Click "Upload Report"
   - Use any PDF or image file as test

3. **View Reports**: Check dashboard to see uploaded reports

4. **Chat**: Click "Ask Questions" on a report to interact with chatbot

## 🔧 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Fix**: Make sure MongoDB is running with `mongod` command

### Port 5000 Already in Use
**Fix**: Kill the process or change PORT in `backend/.env`

### Port 3000 Already in Use
**Fix**: React will ask to use port 3001 - say yes

### EADDRINUSE: address already in use
```powershell
# Kill process on port
Get-Process | Where-Object {$_.Handles -like "*5000*"} | Stop-Process
```

## 📊 Database Verification

Check if database created successfully:

```powershell
mongosh

# In mongosh shell:
show databases
use medexplain
show collections
db.users.find()  # Should be empty initially
```

## 🎯 Next Steps After Setup

1. **Extract Text from Reports** (OCR)
   - Install Tesseract.js in backend
   - Build OCR processing endpoint

2. **Build Analysis Engine**
   - Create reference ranges database
   - Compare values and mark abnormal results
   - Generate explanations

3. **Enhance Chatbot**
   - Add more medical Q&A rules
   - Integrate NLP library
   - Context-aware responses

4. **Add Visualizations**
   - Chart library (Chart.js, Recharts)
   - Trend analysis
   - Report comparison

## 📚 Useful Commands

### Backend
```powershell
npm run dev      # Development mode (auto-reload)
npm start        # Production mode
npm test         # Run tests
```

### Frontend
```powershell
npm start        # Development mode (auto-reload)
npm build        # Build for production
npm test         # Run tests
```

### Database
```powershell
mongod           # Start MongoDB
mongosh          # Connect to MongoDB CLI
mongosh --eval "db.adminCommand('ping')"  # Test connection
```

## 🌐 API Health Check

Test API is running:
```
GET http://localhost:5000/api/health

Expected response:
{
  "status": "Backend is running",
  "timestamp": "2024-03-26T..."
}
```

## 📱 Default Test Credentials

After registration:
- **Email**: test@example.com
- **Password**: password123

## 💾 Database Reset

To reset database (delete all data):

```powershell
mongosh
use medexplain
db.dropDatabase()
exit
```

---

**Everything set up? Start using MedExplain! 🎉**
