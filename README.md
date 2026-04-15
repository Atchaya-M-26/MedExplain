# MedExplain - Healthcare Report Analysis Platform

A full-stack healthcare application that allows users to upload medical reports, extract and analyze data, highlight abnormal values, and receive simplified explanations.

## 🏗️ Project Structure

```
medExp/
├── backend/          # Node.js + Express API
│   ├── models/       # MongoDB schemas
│   ├── routes/       # API endpoints
│   ├── controllers/  # Business logic
│   ├── middleware/   # Auth & validation
│   ├── uploads/      # Uploaded files
│   ├── server.js     # Main server file
│   └── package.json
├── frontend/         # React application
│   ├── src/
│   │   ├── components/  # Reusable React components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   ├── context/     # React Context
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## 🛠️ Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **JWT** - Authentication
- **Multer** - File uploads
- **Tesseract.js** - OCR (offline)
- **PDF-Parse** - PDF parsing

### Frontend
- **React.js** - UI library
- **React Router** - Navigation
- **Bootstrap 5** - UI styling
- **Recharts** - Charts and graphs
- **Axios** - HTTP client

## 📋 Prerequisites

- **Node.js** (v14+)
- **npm** or **yarn**
- **MongoDB** (local or cloud instance)

## 🚀 Installation & Setup

### 1. **Start MongoDB Locally**

**On Windows (using Windows Subsystem or MongoDB directly):**

```powershell
# If MongoDB is installed via installer
mongod

# Or if using MongoDB as a service
net start MongoDB
```

**Verify MongoDB is running:**
```powershell
mongosh
```

### 2. **Backend Setup**

```bash
cd backend

# Install dependencies
npm install

# Create .env file (already created with defaults)
# Verify .env has correct MongoDB URI:
# MONGODB_URI=mongodb://localhost:27017/medexplain
# JWT_SECRET=your_jwt_secret_key_change_this_in_production

# Start the backend server
npm run dev
# or for production: npm start
```

**Backend will run on:** http://localhost:5000

### 3. **Frontend Setup**

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

**Frontend will run on:** http://localhost:3000

## 📝 Features

### ✅ Currently Implemented
- User Authentication (Register/Login with JWT)
- Medical report upload (PDF/Images)
- Report history storage
- Basic chatbot with rule-based responses
- Data model for analysis results
- Multi-language support (structure ready)
- File storage management

### 🔄 Ready to Implement
- OCR text extraction (Tesseract.js)
- Data analysis engine (compare against reference ranges)
- Advanced explanation generator
- Report visualization with charts
- Advanced chatbot with NLP
- Multilingual interface

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/language` - Update language preference

### Reports
- `POST /api/reports/upload` - Upload medical report
- `GET /api/reports` - Get all user reports
- `GET /api/reports/:id` - Get specific report
- `DELETE /api/reports/:id` - Delete report

### Chatbot
- `POST /api/chatbot/message` - Send message to chatbot
- `GET /api/chatbot/history/:reportId` - Get chat history

### History
- `GET /api/history` - Get user's report history

## 🔐 Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/medexplain
JWT_SECRET=your_jwt_secret_key_change_this_in_production
NODE_ENV=development
```

### Frontend (.env optional)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## 📊 Database Schema

### User
```
{
  name: String,
  email: String (unique),
  password: String (hashed),
  language: String (en/es/fr/de/hi/pt),
  createdAt: Date,
  updatedAt: Date
}
```

### Report
```
{
  userId: ObjectId,
  fileName: String,
  fileType: 'pdf' | 'image',
  uploadDate: Date,
  extractedText: String,
  analysis: Array of {
    parameter: String,
    value: String,
    unit: String,
    referenceRange: String,
    isAbnormal: Boolean,
    explanation: String
  },
  summary: String,
  language: String,
  processedAt: Date,
  status: 'pending' | 'processing' | 'completed' | 'failed'
}
```

### ChatHistory
```
{
  userId: ObjectId,
  reportId: ObjectId,
  messages: Array of {
    type: 'user' | 'bot',
    content: String,
    timestamp: Date
  },
  createdAt: Date
}
```

## 🧪 Testing the Application

### 1. Register a new account
- Visit http://localhost:3000/register
- Fill in name, email, and password
- Click Register

### 2. Upload a report
- Go to Dashboard
- Upload a medical report (PDF or image)
- Report will appear in history

### 3. View report
- Click on report in history
- View analysis results
- Interact with chatbot

## 🔧 Troubleshooting

### MongoDB Connection Error
```
❌ Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Make sure MongoDB is running
```powershell
mongod
# or
net start MongoDB
```

### Port Already in Use
```
❌ Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:** Change PORT in .env or kill process using the port

### Frontend API Errors
- Check if backend is running (http://localhost:5000/api/health)
- Clear browser cache and local storage
- Check browser console for detailed errors

## 📚 Next Steps

1. **Implement OCR Processing**
   - Use Tesseract.js for text extraction
   - Process PDF files server-side

2. **Build Analysis Engine**
   - Create reference ranges database
   - Implement value comparison logic
   - Generate insights

3. **Enhance Chatbot**
   - Integrate NLP library
   - Training data for medical terms
   - Context-aware responses

4. **Add Visualizations**
   - Chart library integration
   - Trend analysis
   - Report comparisons

5. **Deployment**
   - Host backend on Heroku/AWS
   - Deploy frontend on Vercel/Netlify
   - Use MongoDB Atlas cloud

## 📄 License

MIT License

## 👨‍💻 Developer Notes

- Backend uses standard REST API conventions
- Frontend uses React Context for state management
- JWT tokens stored in localStorage
- CORS enabled for development
- Database indexes recommended for production

---

**Happy Coding! 🚀**
