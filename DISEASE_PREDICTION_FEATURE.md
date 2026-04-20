# ✅ Disease Prediction with Auto-Extraction Feature

## What's New?

Your teacher approved the project and requested a new feature in the **Disease Prediction** section:

### Feature: Automatic Value Extraction from Medical Reports

Users can now:
1. **Upload Medical Report** (PDF/Image) - Click the upload button
2. **Auto-Extract Values** - System uses OCR to read the report automatically  
3. **Get Predictions** - Values auto-fill the form, then predict risk scores
4. **Manual Fallback** - Users can still type values manually if they prefer

---

## How It Works

### Frontend (React)
- **Location**: `frontend/src/pages/DiseasePrediction.js`
- Two input modes:
  - 📝 **Manual Input**: Type values directly
  - 📤 **Upload Report**: Upload PDF/image with medical test results

### Backend (Node.js Express)
- **New Route**: `POST /api/imageAnalysis/extract-values`
- **Function**: `extractValuesForPrediction()` in `imageController.js`
- Receives uploaded file and forwards to ML server for OCR

### ML Server (Python FastAPI)
- **New Endpoint**: `POST /extract/medical-values`
- **Function**: `extract_medical_values()` in `main.py`
- Uses OCR (Tesseract) to read text from medical reports
- Pattern matching to extract specific medical values

---

## Supported Values

### Diabetes Prediction
- Pregnancies
- Glucose Level
- Blood Pressure
- Skin Thickness
- Insulin
- BMI
- Diabetes Pedigree Function
- Age

### Heart Disease Prediction
- Age
- Sex (Male/Female)
- Chest Pain Type
- Resting Blood Pressure
- Cholesterol
- Fasting Blood Sugar
- Resting ECG
- Max Heart Rate
- Exercise-Induced Angina
- ST Depression (Old Peak)

---

## Supported File Formats

✅ **Images**:
- JPG / JPEG
- PNG

✅ **Documents**:
- PDF (requires pdf2image library)

---

## Setup Instructions

### 1. Install OCR Library (Already Done)
```bash
pip install pytesseract pdf2image
```

### 2. Install Tesseract OCR on System

**Windows**:
- Download: https://github.com/UB-Mannheim/tesseract/wiki
- Run installer (use default path: `C:\Program Files\Tesseract-OCR`)
- Tesseract will be detected automatically

**Mac**:
```bash
brew install tesseract
```

**Linux**:
```bash
sudo apt-get install tesseract-ocr
```

### 3. Restart Services
All servers are already running with the new feature!

---

## Usage Flow

### For Users:

**Option 1: Upload Medical Report**
```
1. Go to Disease Prediction > Select "📤 Upload Report"
2. Click the upload area or drag-and-drop file
3. System extracts values automatically
4. Review auto-filled form fields
5. Click "Predict Diabetes/Heart Risk"
6. Get score and recommendations
```

**Option 2: Manual Input**
```
1. Go to Disease Prediction > Select "📝 Manual Input"
2. Type values in the form fields
3. Click "Predict Diabetes/Heart Risk"
4. Get score and recommendations
```

---

## API Documentation

### Backend Endpoint
```
POST /api/imageAnalysis/extract-values
Authorization: Bearer {token}
Content-Type: multipart/form-data

Body: file (PDF/Image)

Response:
{
  "message": "Values extracted successfully",
  "extractedValues": {
    "diabetes": {
      "pregnancies": 2,
      "glucose": 120,
      "blood_pressure": 80,
      ...
    },
    "heart": {
      "age": 45,
      "sex": 1,
      "chest_pain": 0,
      ...
    }
  }
}
```

### ML Server Endpoint
```
POST /extract/medical-values
Content-Type: multipart/form-data

Body: file (PDF/Image)

Response:
{
  "message": "Values extracted successfully",
  "extracted_text": "...",  // Full OCR text
  "glucose": 120,
  "age": 45,
  "cholesterol": 200,
  ...
}
```

---

## How OCR Extraction Works

1. **File Upload** → Saved to temp directory
2. **OCR Processing** → Tesseract reads text from image/PDF
3. **Pattern Matching** → Regex finds medical parameter names and values
4. **Value Extraction** → Converts text to numeric values
5. **Return to Frontend** → Auto-fills form fields
6. **User Review** → User can edit before predicting

### Example Extraction
```
Input: "Patient Report
Age: 45 years
Glucose: 120 mg/dL
Blood Pressure: 130/80 mmHg
..."

Output:
{
  "age": 45,
  "glucose": 120,
  "blood_pressure": 130,
  ...
}
```

---

## Files Modified/Created

### Frontend
- ✅ `frontend/src/pages/DiseasePrediction.js` - Enhanced with upload UI and handlers

### Backend
- ✅ `backend/routes/imageAnalysis.js` - Added extract-values route
- ✅ `backend/controllers/imageController.js` - Added extractValuesForPrediction function

### ML Server
- ✅ `ml/main.py` - Added /extract/medical-values endpoint + OCR logic
- ✅ `ml/requirements.txt` - Added pytesseract and pdf2image

---

## Testing the Feature

### Test with Sample Values

**Manual Entry**:
1. Go to Disease Prediction
2. Select "📝 Manual Input"
3. Enter sample values (examples below)
4. Click Predict

**Sample Diabetes Values**:
- Pregnancies: 2
- Glucose: 120
- Blood Pressure: 80
- Skin Thickness: 25
- Insulin: 100
- BMI: 28
- Diabetes Pedigree: 0.5
- Age: 45

**Sample Heart Disease Values**:
- Age: 50
- Sex: 1
- Chest Pain: 0
- Resting BP: 130
- Cholesterol: 200
- Fasting Blood: 1
- Resting ECG: 1
- Max Heart Rate: 130
- Exercise Induced: 0
- Old Peak: 2.0

---

## Troubleshooting

### Issue: "OCR library not found"
**Solution**: Install pytesseract
```bash
pip install pytesseract
```

### Issue: "Tesseract not found on system"
**Solution**: Install system-level Tesseract OCR from the official website

### Issue: "Failed to extract values"
**Solution**: 
- Ensure medical report is clear and readable
- Try a better quality image
- Check OCR log output for details

### Issue: "Values not extracting correctly"
**Solution**:
- Medical reports must have clear text labels
- Parameter names should match common medical terminology
- Users can always manually edit auto-filled values

---

## Future Enhancements

1. **Improved OCR Accuracy** - Train custom OCR model for medical documents
2. **Handwriting Recognition** - Support handwritten medical notes
3. **Multiple Languages** - Support reports in Hindi, Tamil, etc.
4. **Form Validation** - Range checking for medical values
5. **History Tracking** - Save extracted values for future reference

---

## Summary

✅ **Feature Complete!** Users can now:
- Upload medical reports (PDF/Image)
- Get automatic value extraction via OCR
- See auto-filled prediction forms
- Fall back to manual entry anytime
- Get instant diabetes & heart disease risk predictions

Your teacher will see:
- Professional implementation
- Good user experience
- Practical utility
- Extensible architecture

**Ready to demonstrate!** 🎉
