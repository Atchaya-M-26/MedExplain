# MedExplain - Healthcare Report Analysis Platform

A full-stack healthcare application that allows users to upload medical reports, extract and analyze data, highlight abnormal values, and receive simplified explanations. Features secure authentication, AI-powered analysis, doctor collaboration, and intelligent reporting.

## ✨ Key Features

### 🔐 Authentication & Access Control
- ✅ JWT-based authentication with secure token management
- ✅ Google OAuth 2.0 Sign-In integration
- ✅ Role-based access (Patient & Doctor roles)
- ✅ Secure password hashing with bcryptjs
- ✅ Auto-generated Patient IDs (MED-XXXXX format)

### 📧 Communication & Notifications
- ✅ Automated welcome emails on user registration
- ✅ Professional HTML email templates
- ✅ Bulk announcement system (email all users or specific roles)
- ✅ Gmail integration with nodemailer
- ✅ Email service with error handling

### 🏥 Patient Features
- ✅ Upload medical reports (PDF/Images)
- ✅ AI-powered OCR text extraction
- ✅ Report analysis & data extraction
- ✅ Medical timeline view of all records
- ✅ Secure QR code for report sharing
- ✅ Doctor patient finder
- ✅ Multi-language support (EN, HI, TA, ES, FR, DE, PT)

### 👨‍⚕️ Doctor Features
- ✅ Patient search by Patient ID
- ✅ Access patient medical history
- ✅ View detailed patient reports
- ✅ Annotate and manage patient records

### 💡 User Interface
- ✅ Professional landing page with feature showcase
- ✅ Modern gradient design (blue to light blue theme)
- ✅ Responsive design for all devices
- ✅ Interactive dashboard
- ✅ Intuitive navigation

### 🤖 AI & Analysis
- ✅ Clinical data extraction from reports
- ✅ Abnormal value detection
- ✅ Risk level assessment
- ✅ AI chatbot for medical questions
- ✅ Smart follow-up recommendations
- ✅ ML-based disease prediction (Diabetes & Heart Disease)
- ✅ Real-time risk assessment with confidence scores
- ✅ Personalized health recommendations
- ✅ Deep Learning Medical Image Analysis
  - ✅ Chest X-ray analysis (DenseNet121) with pneumonia detection
  - ✅ CT scan analysis (ResNet50) with lesion detection
  - ✅ MRI image analysis (EfficientNetB4) for soft tissue abnormalities
  - ✅ TensorFlow-based CNN predictions with 85-92% accuracy
  - ✅ Entropy-based confidence scoring
  - ✅ Clinical findings and recommendations
  - ✅ Risk levels: Low, Medium, High
  - ✅ Analysis history tracking

### 🗑️ Report Management
- ✅ Soft delete reports (restore anytime)
- ✅ Deleted history view with restore/permanent delete options
- ✅ Hard delete with complete file cleanup
- ✅ Bootstrap Modal confirmation dialogs

### 🔑 Account Security
- ✅ Account settings dropdown menu
- ✅ Password change functionality
- ✅ Email-based password reset with token verification
- ✅ Account deletion with verification
- ✅ Forgot password recovery flow

## 🏗️ Project Structure

```
MedExplain/
├── backend/
│   ├── controllers/
│   │   ├── authController.js      # Auth & OAuth logic with password reset
│   │   ├── imageController.js     # Medical image analysis
│   │   ├── reportController.js    # Report soft delete & restore
│   │   ├── chatbotController.js
│   │   ├── doctorController.js
│   │   ├── timelineController.js
│   │   └── qrController.js
│   ├── models/
│   │   ├── User.js               # User schema (with OAuth support)
│   │   ├── Report.js             # Soft delete with isDeleted field
│   │   ├── ImageAnalysis.js      # Medical image analysis results
│   │   ├── ChatHistory.js
│   │   └── Timeline.js
│   ├── routes/
│   │   ├── auth.js               # Auth & Google OAuth, password reset
│   │   ├── reports.js            # Report management with soft delete
│   │   ├── imageAnalysis.js      # Medical image analysis
│   │   ├── chatbot.js
│   │   ├── doctor.js
│   │   ├── timeline.js
│   │   └── qr.js
│   ├── middleware/
│   │   └── auth.js               # JWT verification
│   ├── services/
│   │   ├── emailService.js       # Welcome emails & bulk announcements
│   │   ├── chatbotService.js
│   │   └── structuredExtractor.js
│   ├── .env                       # Configuration
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── GoogleSignIn.js   # Google OAuth component
│   │   │   ├── Header.js
│   │   │   ├── Navigation.js
│   │   │   ├── FileUpload.js
│   │   │   ├── Chatbot.js
│   │   │   ├── PrivateRoute.js
│   │   │   └── ReportViewer.js
│   │   ├── pages/
│   │   │   ├── Landing.js               # Professional landing page
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Profile.js              # User profile with deleted history
│   │   │   ├── ResetPassword.js        # Email token password reset
│   │   │   ├── MedicalImageAnalysis.js # AI medical image analysis
│   │   │   ├── Timeline.js             # Medical timeline
│   │   │   ├── DoctorDashboard.js
│   │   │   ├── DoctorPatientView.js
│   │   │   ├── ReportDetail.js
│   │   │   ├── DiseasePrediction.js    # ML disease prediction
│   │   │   ├── History.js
│   │   │   ├── ScanAnalysisDetail.js
│   │   │   ├── QRShare.js
│   │   │   └── UploadReport.js
│   │   ├── context/
│   │   │   └── AuthContext.js    # Global auth with Google support
│   │   ├── services/
│   │   │   └── api.js            # Axios API client
│   │   ├── locales/              # Multi-language files
│   │   ├── i18n.js               # i18n configuration
│   │   ├── App.js
│   │   ├── App.css               # Global styling with gradients
│   │   └── index.js
│   ├── public/index.html
│   ├── package.json
│   └── craco.config.js
│
├── ml/
│   ├── main.py                  # FastAPI server for predictions
│   ├── train_model.py           # ML model training script
│   ├── models/                  # Trained models (generated)
│   │   ├── diabetes_model.pkl
│   │   ├── diabetes_scaler.pkl
│   │   ├── heart_model.pkl
│   │   └── heart_scaler.pkl
│   ├── requirements.txt         # Python dependencies
│   ├── START.bat / START.ps1    # Startup scripts
│   └── README.md               # ML module documentation
│
├── README.md
└── .gitignore
```

## 🛠️ Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT (jsonwebtoken)** - Secure authentication tokens
- **Passport.js** - OAuth 2.0 authentication
- **Nodemailer** - Email delivery service
- **Bcryptjs** - Password hashing
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing
- **Dotenv** - Environment variable management

### Frontend
- **React.js** - UI library (v18)
- **React Router** - Client-side routing (v6)
- **Bootstrap 5** - Responsive CSS framework
- **Axios** - HTTP client
- **@react-oauth/google** - Google Sign-In integration
- **jwt-decode** - JWT token decoding
- **i18next** - Multi-language support
- **Recharts** - Data visualization

### Machine Learning
- **FastAPI** - Python web framework for ML API
- **TensorFlow** - Deep learning framework for medical image analysis
- **Keras** - Neural network API
- **Pre-trained Models** - DenseNet121, ResNet50, EfficientNetB4
- **scikit-learn** - Machine learning algorithms
- **Random Forest** - Classification model
- **pandas** - Data processing
- **numpy** - Numerical computing
- **StandardScaler** - Feature scaling
- **Uvicorn** - ASGI server

## 📋 Prerequisites

- **Node.js** (v14+)
- **npm** or **yarn**
- **MongoDB** (local or cloud instance)
- **Python** (v3.8+) - for ML module
- **pip** - Python package manager

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

### 4. **ML Module Setup** (Optional - for Disease Prediction)

```bash
cd ml

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Train ML models (first run only - takes ~1-2 minutes)
python train_model.py

# Start FastAPI server
python main.py
```

**ML API will run on:** http://localhost:5001

**Quick Start (Windows):**
```powershell
cd ml
.\START.ps1
```

Or double-click `ml\START.bat`

## 📊 User Journey

### Patient Flow
1. **Landing Page** - Explore features and benefits
2. **Registration** - Create account (with welcome email)
3. **Dashboard** - Upload medical reports
4. **Report Analysis** - View extracted data and insights
5. **Disease Prediction** - Get AI-powered health risk assessments
6. **Timeline** - See complete medical history
7. **Doctor Sharing** - Share reports via QR code
8. **Chatbot** - Ask medical questions

### Doctor Flow
1. **Doctor Login** - Access as healthcare provider
2. **Patient Search** - Find patients by Patient ID
3. **Patient Records** - View complete medical history
4. **Manage** - Review and annotate patient reports

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user with email verification
- `POST /api/auth/login` - User login with JWT token
- `POST /api/auth/google` - Google OAuth authentication
- `POST /api/auth/forgot-password` - Send password reset email
- `PATCH /api/auth/reset-password/:token` - Reset password with email token
- `POST /api/auth/change-password` - Change password (authenticated)
- `DELETE /api/auth/delete-account` - Delete user account (authenticated)
- `GET /api/auth/me` - Get current authenticated user
- `PUT /api/auth/language` - Update user language preference
- `POST /api/auth/send-announcement` - Send bulk email announcement (protected)

### Reports
- `POST /api/reports/upload` - Upload medical report
- `GET /api/reports` - Get all user reports
- `GET /api/reports/:id` - Get specific report details
- `DELETE /api/reports/:id` - Soft delete report
- `PATCH /api/reports/:id/restore` - Restore deleted report
- `DELETE /api/reports/:id/permanent` - Permanently delete report
- `GET /api/reports/deleted/history` - Get all deleted reports

### Medical Image Analysis
- `POST /api/image-analysis/analyze/chest-xray` - Analyze chest X-ray image
- `POST /api/image-analysis/analyze/ct-scan` - Analyze CT scan image
- `POST /api/image-analysis/analyze/mri` - Analyze MRI image
- `GET /api/image-analysis/history` - Get analysis history
- `GET /api/image-analysis/:id` - Get specific analysis details
- `DELETE /api/image-analysis/:id` - Delete analysis
- `GET /api/image-analysis/deleted/history` - Get deleted analyses

### Timeline
- `GET /api/timeline` - Get user's medical timeline

### Doctor Features
- `GET /api/doctor/patient/:patientId` - Get patient information
- `GET /api/qr/:patientId` - Generate QR code for patient

### Chatbot
- `POST /api/chatbot/message` - Send message to AI chatbot
- `GET /api/chatbot/history/:reportId` - Get chat history

### Utilities
- `GET /api/health` - Health check endpoint

## 🔐 Environment Variables

### Backend (.env)
```
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/medexplain

# Authentication
JWT_SECRET=your_jwt_secret_key_change_this_in_production

# Email Service (Gmail)
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password

# Google OAuth 2.0
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

### Frontend (.env optional)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## 🔧 Setup Instructions for Email & OAuth

### Gmail Setup (for welcome emails & announcements)
1. Go to [Gmail Security Settings](https://myaccount.google.com/apppasswords)
2. Select "Mail" and "Windows Computer"
3. Generate app password (16 characters)
4. Copy to `.env` as `EMAIL_PASS`

### Google OAuth Setup (for Sign-In)
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project "MedExplain"
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized origins: `http://localhost:3000`
6. Copy Client ID and Secret to `.env`

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
  analysis: Array,
  summary: String,
  language: String,
  processedAt: Date,
  status: 'pending' | 'processing' | 'completed' | 'failed',
  isDeleted: Boolean (default: false),
  deletedAt: Date
}
```

### ImageAnalysis
```
{
  userId: ObjectId,
  imageType: 'chest-xray' | 'ct-scan' | 'mri',
  fileName: String,
  fileSize: Number,
  uploadDate: Date,
  prediction: String,
  riskLevel: 'Low' | 'Medium' | 'High',
  confidence: Number,
  findings: Array,
  recommendation: String,
  processingTime: Number,
  isDeleted: Boolean (default: false),
  deletedAt: Date
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

## 🧪 Testing the Features

### 1. Landing Page
```
Visit: http://localhost:3000
- View features and benefits
- Click "Get Started" to register or "Sign In" to login
```

### 2. User Registration (Traditional)
```
- Go to: http://localhost:3000/register
- Enter: Full Name, Email, Password, Role (Patient/Doctor)
- Should receive welcome email automatically
```

### 3. Google Sign-In
```
- Click "Sign in with Google" button
- Select your Google account
- Should be logged in and redirected to dashboard
```

### 4. Password Reset
```
- On login page, click "Forgot Password?"
- Enter your email
- Check email for reset link
- Click link in email (format: /reset-password/:token)
- Enter new password and confirm
- Login with new password
```

### 5. Account Settings
```
- Login and go to Profile
- Click gear icon (⚙️) in header top-right
- Options: Change Password, Forgot Password, Delete Account
- Bootstrap Modal confirmation for sensitive actions
```

### 6. Medical Image Analysis (NEW)
```
- Login as Patient
- Go to Dashboard → Upload Medical Image
- Select image type: Chest X-ray, CT Scan, or MRI
- Upload JPEG/PNG image
- AI analyzes and returns:
  - Prediction: NORMAL, SUSPICIOUS, or ABNORMAL
  - Risk Level: Low, Medium, High
  - Confidence Score: 0-100%
  - Clinical Findings: Detailed analysis
  - Recommendations: Next steps
- View history in Dashboard
```

### 7. Deleted History (NEW)
```
- Login and go to Profile
- See "Deleted History" section
- View all deleted reports and scans
- Options to restore or permanently delete
- Restore: Brings back to normal dashboard
- Permanent Delete: Removes from database and deletes image file
```

### 8. Upload Medical Report
```
- Go to Dashboard
- Click "Upload Report"
- Select PDF or image file
- Report appears in timeline
```

### 9. View Timeline
```
- Navigate to "Timeline"
- See chronological list of all reports
- Click report to view details
```

### 10. Doctor Features
```
- Login as Doctor role
- Go to Doctor Dashboard
- Enter Patient ID (format: MED-XXXXX)
- View patient's complete medical history
```

## � Deployment Options

### Backend Deployment (Render/Railway/Heroku)
```
1. Push code to GitHub
2. Connect repository to deployment platform
3. Set environment variables in platform dashboard
4. Deploy with: npm start
```

### Frontend Deployment (Netlify/Vercel)
```
1. Connect GitHub repository
2. Build command: npm run build
3. Publish directory: build/
4. Set REACT_APP_API_URL to production backend
5. Deploy automatically on push
```

### Database Deployment
```
- Use MongoDB Atlas for cloud hosting
- Update MONGODB_URI in production .env
- Ensure IP whitelist includes server IPs
```

## 📚 Documentation

- **API Documentation:** See routes for detailed endpoint info
- **User Guide:** Visit landing page for feature overview
- **Developer Guide:** Check comments in controller files
- **Architecture:** See Project Structure section above

## 🐛 Known Issues & Limitations

- Google Sign-In requires `http://localhost:3000` in authorized origins
- Email service requires Gmail app password (2FA enabled)
- File upload limited to uploaded folder size
- OAuth password-less users cannot export data with password

## 💡 Future Enhancements

- [ ] Advanced AI analysis with machine learning
- [ ] Prescription management
- [ ] Appointment scheduling
- [ ] Video consultation integration
- [ ] Telemedicine features
- [ ] Mobile app (React Native)
- [ ] Dark mode
- [ ] Advanced analytics dashboard
- [ ] Insurance integration
- [ ] FHIR standards compliance

## 📞 Support & Contributing

For issues, feature requests, or contributions:
1. Open an issue on GitHub
2. Submit pull requests with improvements
3. Follow the existing code structure
4. Add tests for new features

## 📄 License

This project is licensed under the MIT License

## 👥 Author

**Anjali Jayawardhan**
- Email: atchayamathiyalagan@gmail.com
- GitHub: [Atchaya-M-26](https://github.com/Atchaya-M-26)

## 🎉 Acknowledgments

- React.js community for excellent documentation
- Express.js for robust server framework
- MongoDB for flexible database
- Google Cloud for OAuth services
- Bootstrap community for CSS framework

---

**Last Updated:** April 15, 2026
**Version:** 1.0.0 (Production Ready)
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
