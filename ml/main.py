"""
FastAPI server for ML disease predictions and medical image analysis
Endpoints:
- POST /predict/diabetes - Diabetes risk prediction
- POST /predict/heart - Heart disease risk prediction
- POST /analyze/chest-xray - Chest X-ray analysis
- POST /analyze/ct-scan - CT scan analysis
- POST /analyze/mri - MRI analysis
- GET /health - Health check
- GET /models - List available models
"""

from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import numpy as np
import os
from image_analyzer import get_analyzer

app = FastAPI(title="MedExplain ML API", version="1.0")

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001", 
        "http://localhost:5000",
        "http://localhost:5001",
        "https://med-explain-ten.vercel.app",
        "https://med-explain-l55l3rv1x-atchaya-m-26s-projects.vercel.app",
        "https://medexplain-3wzb.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== LOAD MODELS ====================
MODELS_DIR = "models"

try:
    with open(f'{MODELS_DIR}/diabetes_model.pkl', 'rb') as f:
        diabetes_model = pickle.load(f)
    with open(f'{MODELS_DIR}/diabetes_scaler.pkl', 'rb') as f:
        diabetes_scaler = pickle.load(f)
    print("✅ Diabetes model loaded")
except Exception as e:
    print(f"⚠️ Diabetes model not found: {e}")
    diabetes_model = None
    diabetes_scaler = None

try:
    with open(f'{MODELS_DIR}/heart_model.pkl', 'rb') as f:
        heart_model = pickle.load(f)
    with open(f'{MODELS_DIR}/heart_scaler.pkl', 'rb') as f:
        heart_scaler = pickle.load(f)
    print("✅ Heart disease model loaded")
except Exception as e:
    print(f"⚠️ Heart disease model not found: {e}")
    heart_model = None
    heart_scaler = None

# ==================== REQUEST MODELS ====================
class DiabetesInput(BaseModel):
    pregnancies: float
    glucose: float
    blood_pressure: float
    skin_thickness: float
    insulin: float
    bmi: float
    diabetes_pedigree: float
    age: float

class HeartDiseaseInput(BaseModel):
    age: float
    sex: float
    chest_pain: float
    resting_bp: float
    cholesterol: float
    fasting_blood: float
    resting_ecg: float
    max_heart_rate: float
    exercise_induced: float
    old_peak: float

# ==================== RESPONSE MODELS ====================
class PredictionResponse(BaseModel):
    disease: str
    risk: float  # 0.0 to 1.0
    risk_level: str  # Low, Medium, High
    confidence: float  # Model confidence
    interpretation: str
    recommendation: str

# ==================== ENDPOINTS ====================
@app.get("/")
def root():
    return {
        "message": "MedExplain ML Prediction API",
        "version": "1.0",
        "endpoints": {
            "diabetes": "/predict/diabetes",
            "heart": "/predict/heart",
            "health": "/health",
            "models": "/models"
        }
    }

@app.get("/health")
def health_check():
    """Health check endpoint"""
    try:
        image_analyzer = get_analyzer()
        image_models_loaded = bool(image_analyzer and image_analyzer.models)
    except:
        image_models_loaded = False
    
    return {
        "status": "healthy",
        "models": {
            "diabetes": diabetes_model is not None,
            "heart": heart_model is not None,
            "image_analysis": image_models_loaded
        }
    }

@app.get("/models")
def list_models():
    """List available models"""
    return {
        "available_models": [
            "diabetes_prediction",
            "heart_disease_prediction",
            "chest_xray_analysis",
            "ct_scan_analysis",
            "mri_analysis"
        ],
        "prediction_models": {
            "diabetes": {
                "name": "Diabetes Risk Prediction",
                "features": 8,
                "loaded": diabetes_model is not None
            },
            "heart": {
                "name": "Heart Disease Risk Prediction",
                "features": 10,
                "loaded": heart_model is not None
            }
        },
        "image_models": {
            "chest_xray": {
                "name": "Chest X-ray Analysis",
                "type": "DenseNet121",
                "output": "Normal/Abnormal classification"
            },
            "ct_scan": {
                "name": "CT Scan Analysis",
                "type": "ResNet50",
                "output": "Normal/Suspicious/Abnormal classification"
            },
            "mri": {
                "name": "MRI Analysis",
                "type": "VGG16",
                "output": "Normal/Abnormal classification"
            }
        }
    }

@app.post("/predict/diabetes", response_model=PredictionResponse)
def predict_diabetes(data: DiabetesInput):
    """
    Predict diabetes risk
    
    Features:
    - pregnancies: Number of pregnancies (0-15)
    - glucose: Glucose level in mg/dL (44-200)
    - blood_pressure: Diastolic blood pressure in mmHg (24-122)
    - skin_thickness: Triceps skin thickness in mm (7-100)
    - insulin: Serum insulin in mu U/ml (14-846)
    - bmi: Body Mass Index (18.2-67.1)
    - diabetes_pedigree: Diabetes pedigree function (0.078-2.42)
    - age: Age in years (21-81)
    """
    
    if diabetes_model is None or diabetes_scaler is None:
        raise HTTPException(status_code=503, detail="Diabetes model not available")
    
    try:
        # Prepare features in correct order
        features = np.array([[
            data.pregnancies,
            data.glucose,
            data.blood_pressure,
            data.skin_thickness,
            data.insulin,
            data.bmi,
            data.diabetes_pedigree,
            data.age
        ]])
        
        # Scale features
        features_scaled = diabetes_scaler.transform(features)
        
        # Get prediction and probability
        prediction = diabetes_model.predict(features_scaled)[0]
        probability = diabetes_model.predict_proba(features_scaled)[0]
        
        risk = float(probability[1])  # Probability of positive class
        
        # Determine risk level
        if risk < 0.3:
            risk_level = "Low"
            interpretation = "Your diabetes risk is low based on current health metrics."
            recommendation = "Continue maintaining a healthy lifestyle and regular check-ups."
        elif risk < 0.7:
            risk_level = "Medium"
            interpretation = "Your diabetes risk is moderate. Consider lifestyle modifications."
            recommendation = "Consult with a healthcare provider and monitor glucose levels regularly."
        else:
            risk_level = "High"
            interpretation = "Your diabetes risk is high. Immediate medical attention recommended."
            recommendation = "Schedule an appointment with an endocrinologist and get blood tests done."
        
        return PredictionResponse(
            disease="Diabetes",
            risk=round(risk, 4),
            risk_level=risk_level,
            confidence=round(float(max(probability)), 4),
            interpretation=interpretation,
            recommendation=recommendation
        )
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction error: {str(e)}")

@app.post("/predict/heart", response_model=PredictionResponse)
def predict_heart_disease(data: HeartDiseaseInput):
    """
    Predict heart disease risk
    
    Features:
    - age: Age in years
    - sex: Sex (0=Female, 1=Male)
    - chest_pain: Chest pain type (0-3)
    - resting_bp: Resting blood pressure in mmHg
    - cholesterol: Serum cholesterol in mg/dL
    - fasting_blood: Fasting blood sugar > 120 mg/dL (0=No, 1=Yes)
    - resting_ecg: Resting ECG (0-2)
    - max_heart_rate: Maximum heart rate achieved
    - exercise_induced: Exercise-induced angina (0=No, 1=Yes)
    - old_peak: ST depression induced by exercise
    """
    
    if heart_model is None or heart_scaler is None:
        raise HTTPException(status_code=503, detail="Heart disease model not available")
    
    try:
        # Prepare features in correct order
        features = np.array([[
            data.age,
            data.sex,
            data.chest_pain,
            data.resting_bp,
            data.cholesterol,
            data.fasting_blood,
            data.resting_ecg,
            data.max_heart_rate,
            data.exercise_induced,
            data.old_peak
        ]])
        
        # Scale features
        features_scaled = heart_scaler.transform(features)
        
        # Get prediction and probability
        prediction = heart_model.predict(features_scaled)[0]
        probability = heart_model.predict_proba(features_scaled)[0]
        
        risk = float(probability[1])  # Probability of positive class
        
        # Determine risk level
        if risk < 0.3:
            risk_level = "Low"
            interpretation = "Your heart disease risk is low based on current health metrics."
            recommendation = "Continue regular exercise and maintain a healthy diet. Annual check-ups recommended."
        elif risk < 0.7:
            risk_level = "Medium"
            interpretation = "Your heart disease risk is moderate. Lifestyle modifications advised."
            recommendation = "Consult a cardiologist, reduce salt intake, and increase physical activity."
        else:
            risk_level = "High"
            interpretation = "Your heart disease risk is high. Urgent medical evaluation needed."
            recommendation = "Seek immediate consultation with a cardiologist and undergo ECG/stress testing."
        
        return PredictionResponse(
            disease="Heart Disease",
            risk=round(risk, 4),
            risk_level=risk_level,
            confidence=round(float(max(probability)), 4),
            interpretation=interpretation,
            recommendation=recommendation
        )
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction error: {str(e)}")

# ==================== IMAGE ANALYSIS ENDPOINTS ====================

@app.post("/analyze/chest-xray")
async def analyze_chest_xray(file: UploadFile = File(...)):
    """
    Analyze chest X-ray image
    
    Returns:
    - prediction: NORMAL or ABNORMAL
    - confidence: Confidence percentage (0-100)
    - findings: List of detected findings
    - risk_level: Low, Medium, or High
    - recommendation: Clinical recommendation
    """
    try:
        # Read file
        image_data = await file.read()
        
        # Validate file type
        if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
            raise HTTPException(status_code=400, detail="Only JPEG and PNG images are supported")
        
        # Analyze image
        analyzer = get_analyzer()
        if not analyzer or not analyzer.models.get('chest_xray'):
            raise HTTPException(status_code=503, detail="Chest X-ray model not available")
        
        result = analyzer.analyze_chest_xray(image_data)
        return result
    
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Image analysis error: {str(e)}")

@app.post("/analyze/ct-scan")
async def analyze_ct_scan(file: UploadFile = File(...)):
    """
    Analyze CT scan image
    
    Returns:
    - prediction: Normal, Suspicious, or Abnormal
    - confidence: Confidence percentage (0-100)
    - probabilities: Per-class probabilities
    - findings: List of detected findings
    - risk_level: Low, Medium, or High
    - recommendation: Clinical recommendation
    """
    try:
        # Read file
        image_data = await file.read()
        
        # Validate file type
        if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
            raise HTTPException(status_code=400, detail="Only JPEG and PNG images are supported")
        
        # Analyze image
        analyzer = get_analyzer()
        if not analyzer or not analyzer.models.get('ct_scan'):
            raise HTTPException(status_code=503, detail="CT scan model not available")
        
        result = analyzer.analyze_ct_scan(image_data)
        return result
    
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Image analysis error: {str(e)}")

@app.post("/analyze/mri")
async def analyze_mri(file: UploadFile = File(...)):
    """
    Analyze MRI scan image
    
    Returns:
    - prediction: NORMAL or ABNORMAL
    - confidence: Confidence percentage (0-100)
    - findings: List of detected findings
    - risk_level: Low, Medium, or High
    - recommendation: Clinical recommendation
    """
    try:
        # Read file
        image_data = await file.read()
        
        # Validate file type
        if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
            raise HTTPException(status_code=400, detail="Only JPEG and PNG images are supported")
        
        # Analyze image
        analyzer = get_analyzer()
        if not analyzer or not analyzer.models.get('mri'):
            raise HTTPException(status_code=503, detail="MRI model not available")
        
        result = analyzer.analyze_mri(image_data)
        return result
    
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Image analysis error: {str(e)}")

# ==================== OCR & VALUE EXTRACTION ====================
import sys
import os

try:
    import pytesseract
    from PIL import Image
    import tempfile
    import re
except ImportError:
    pytesseract = None

# Check if pytesseract is available and Tesseract is installed
TESSERACT_AVAILABLE = False
if pytesseract:
    try:
        # Set Tesseract path on Windows
        tesseract_found = False
        if sys.platform == 'win32':
            tesseract_paths = [
                r'C:\Program Files\Tesseract-OCR\tesseract.exe',
                r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe'
            ]
            for path in tesseract_paths:
                if os.path.exists(path):
                    pytesseract.pytesseract.pytesseract_cmd = path
                    print(f"✅ Tesseract found at: {path}")
                    tesseract_found = True
                    TESSERACT_AVAILABLE = True
                    break
        
        # If not Windows or not found, try default
        if not tesseract_found:
            try:
                pytesseract.get_tesseract_version()
                TESSERACT_AVAILABLE = True
                print("✅ Tesseract OCR is available!")
            except Exception as e:
                print(f"⚠️  Tesseract not found: {e}")
                print("📝 To enable OCR, install Tesseract from: https://github.com/UB-Mannheim/tesseract/releases")
    except Exception as e:
        print(f"⚠️  Error setting up Tesseract: {e}")
        
if TESSERACT_AVAILABLE:
    print("✅ Tesseract OCR is ready for use!")

@app.post("/extract/medical-values")
async def extract_medical_values(file: UploadFile = File(...)):
    """
    Extract medical values from uploaded medical report using OCR
    Supports: PDF, JPG, PNG images
    Returns: Extracted values for diabetes and heart disease prediction
    """
    try:
        # Check if Tesseract is available
        if not TESSERACT_AVAILABLE:
            print("⚠️  Tesseract OCR not available - returning empty values")
            return {
                "message": "OCR not configured. Please enter values manually.",
                "warning": "Tesseract OCR is not installed. To enable automatic extraction, install Tesseract from https://github.com/UB-Mannheim/tesseract/releases",
                "extracted_text": "",
                "pregnancies": None,
                "glucose": None,
                "blood_pressure": None,
                "skin_thickness": None,
                "insulin": None,
                "bmi": None,
                "diabetes_pedigree": None,
                "age": None,
                "sex": None,
                "chest_pain": None,
                "cholesterol": None,
                "fasting_blood": None,
                "resting_ecg": None,
                "max_heart_rate": None,
                "exercise_induced": None,
                "old_peak": None
            }
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp:
            contents = await file.read()
            tmp.write(contents)
            tmp_path = tmp.name
        
        # Handle PDF files
        if file.filename.lower().endswith('.pdf'):
            try:
                print(f"📄 Extracting text from PDF using PyPDF2...")
                import PyPDF2
                extracted_text = ""
                try:
                    with open(tmp_path, 'rb') as pdf_file:
                        pdf_reader = PyPDF2.PdfReader(pdf_file)
                        for page_num, page in enumerate(pdf_reader.pages):
                            print(f"📄 Processing page {page_num+1}/{len(pdf_reader.pages)}...")
                            extracted_text += page.extract_text() + "\n"
                except Exception as pdf_error:
                    print(f"⚠️  PyPDF2 extraction failed, trying Tesseract on page images...")
                    try:
                        from pdf2image import convert_from_path
                        images = convert_from_path(tmp_path)
                        for i, image in enumerate(images):
                            print(f"📄 Processing page {i+1}/{len(images)} with Tesseract...")
                            extracted_text += pytesseract.image_to_string(image) + "\n"
                    except ImportError:
                        raise HTTPException(status_code=400, detail="PyPDF2 failed and pdf2image not installed")
                    except Exception as e:
                        print(f"❌ Fallback error: {e}")
                        raise HTTPException(status_code=400, detail=f"PDF processing error: {str(e)}")
            except HTTPException:
                raise
            except Exception as pdf_error:
                print(f"❌ PDF Error: {pdf_error}")
                raise HTTPException(status_code=400, detail=f"PDF processing error: {str(pdf_error)}")
        else:
            # Process image files
            print(f"📸 Processing image: {file.filename}")
            image = Image.open(tmp_path)
            extracted_text = pytesseract.image_to_string(image)
        
        print(f"📄 Extracted OCR text ({len(extracted_text)} chars):\n{extracted_text[:500]}...")
        
        # Extract numeric values using regex
        try:
            extracted_values = extract_numeric_values(extracted_text)
        except Exception as extract_error:
            print(f"⚠️  Error extracting values: {extract_error}")
            print(f"Continuing with empty extraction results...")
            extracted_values = {}
        
        # Clean up
        os.unlink(tmp_path)
        
        return {
            "message": "Values extracted successfully",
            "extracted_text": extracted_text[:1000],  # First 1000 chars
            **extracted_values  # Merge all extracted values
        }
        
    except HTTPException as e:
        print(f"❌ HTTP Error: {str(e)}")
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)
        raise e
    except Exception as e:
        print(f"❌ OCR Error: {str(e)}")
        if os.path.exists(tmp_path):
            try:
                os.unlink(tmp_path)
            except:
                pass
        raise HTTPException(status_code=400, detail=f"Error extracting values: {str(e)}")

def extract_numeric_values(text):
    """
    Extract medical values from OCR text
    Handles multiple formats: inline (key: value) and table formats
    """
    values = {}
    text_lower = text.lower() if text else ""
    
    try:
        # Helper function to safely extract and convert
        def safe_extract(pattern, text_to_search):
            match = re.search(pattern, text_to_search, re.IGNORECASE | re.MULTILINE | re.DOTALL)
            if match and match.group(1):
                try:
                    return float(match.group(1).strip())
                except (ValueError, TypeError):
                    return None
            return None
        
        # Diabetes parameters - multiple pattern attempts for each parameter
        
        # Glucose - handles "Glucose: 95", "Plasma Glucose\n95", "Glucose Level: 90 mg/dL"
        glucose_val = safe_extract(r'(?:plasma\s+)?glucose[^0-9\n]*(?:\n\s*)?(\d+\.?\d*)', text_lower)
        if glucose_val is not None:
            values['glucose'] = glucose_val
        
        # BMI - handles "BMI: 22", "Body Mass Index\n22", "BMI 22 kg/m2", "BMI\n22.0"
        # More flexible pattern for table format where value might be on next line
        bmi_val = safe_extract(r'bmi[^0-9\n]*(?:\n\s*)?(\d+\.?\d*)', text_lower)
        if bmi_val is not None:
            values['bmi'] = bmi_val
        
        # Age - handles "Age: 25", "Age\n25", "Age / Gender: 25 Years"
        age_val = safe_extract(r'age[^0-9\n]*(?:\n\s*)?(\d+\.?\d*)', text_lower)
        if age_val is not None:
            values['age'] = age_val
        
        # Pregnancies - handles "Pregnancies: 1", "Pregnancies\n1", "Number of Pregnancies: 1"
        preg_val = safe_extract(r'(?:number\s+of\s+)?pregnancies[^0-9\n]*(?:\n\s*)?(\d+\.?\d*)', text_lower)
        if preg_val is not None:
            values['pregnancies'] = preg_val
        
        # Blood Pressure / Diastolic BP - handles multiple formats
        bp_val = safe_extract(r'(?:diastolic\s+)?blood\s+pressure[^0-9\n]*(?:\n\s*)?(\d+\.?\d*)', text_lower)
        if bp_val is None:
            bp_val = safe_extract(r'(?:dbp|diastolic\s+bp)[^0-9\n]*(?:\n\s*)?(\d+\.?\d*)', text_lower)
        if bp_val is not None:
            values['blood_pressure'] = bp_val
        
        # Skin Thickness - handles "Skin Thickness: 20", "Skin Thickness (Triceps): 20", "Skin Thickness\n20", "Skin Thickness (Triceps)\n20"
        # More flexible pattern for table format where value might be on next line after (Triceps)
        skin_val = safe_extract(r'skin\s+thickness[^0-9\n]*(?:\n\s*)?(\d+\.?\d*)', text_lower)
        if skin_val is not None:
            values['skin_thickness'] = skin_val
        
        # Insulin - handles "Insulin: 80", "Serum Insulin\n80", "Insulin Level: 80"
        insulin_val = safe_extract(r'(?:serum\s+)?insulin[^0-9\n]*(?:\n\s*)?(\d+\.?\d*)', text_lower)
        if insulin_val is not None:
            values['insulin'] = insulin_val
        
        # Diabetes Pedigree Function - handles "DPF: 0.2", "Diabetes Pedigree Function\n0.2", "Diabetes Pedigree Function: 0.2"
        dpf_val = safe_extract(r'(?:diabetes\s+pedigree\s+function|dpf)[^0-9\n]*(?:\n\s*)?(\d+\.?\d*)', text_lower)
        if dpf_val is not None:
            values['diabetes_pedigree'] = dpf_val
        
        # Heart disease parameters  
        
        # Cholesterol - handles "Cholesterol: 210", "Total Cholesterol\n210"
        chol_val = safe_extract(r'(?:total\s+)?cholesterol[:\s\n]+(\d+\.?\d*)', text_lower)
        if chol_val is not None:
            values['cholesterol'] = chol_val
        
        # Resting BP / Systolic - handles "Resting BP: 130", "Systolic\n130"
        rbp_val = safe_extract(r'(?:resting\s+)?(?:blood\s+pressure|systolic|sbp)[:\s\n]+(\d+\.?\d*)', text_lower)
        if rbp_val is not None:
            values['resting_bp'] = rbp_val
        
        # Heart Rate - handles "Max Heart Rate: 180", "Heart Rate\n180"
        hr_val = safe_extract(r'(?:max(?:imum)?\s+)?heart\s+rate[:\s\n]+(\d+\.?\d*)', text_lower)
        if hr_val is not None:
            values['max_heart_rate'] = hr_val
        
        # Fasting Blood Sugar/Glucose - handles "Fasting Blood Sugar: 110", "FBS\n110"
        fbs_val = safe_extract(r'(?:fasting\s+)?(?:blood\s+(?:sugar|glucose)|fbs)[:\s\n]+(\d+\.?\d*)', text_lower)
        if fbs_val is not None:
            values['fasting_blood'] = fbs_val
        
        # Sex - handles "Sex: M", "Sex: Female", "Sex: 1"
        sex_match = re.search(r'sex[:\s\n]+(m|f|male|female|1|0)', text_lower, re.IGNORECASE)
        if sex_match and sex_match.group(1):
            sex_val = sex_match.group(1).lower().strip()
            values['sex'] = 1.0 if sex_val in ['m', 'male', '1'] else 0.0
        
        # Chest Pain - handles "Chest Pain: 2", "Chest Pain Type\n2"
        cp_val = safe_extract(r'chest\s+pain[:\s\n]+(\d+\.?\d*)', text_lower)
        if cp_val is not None:
            values['chest_pain'] = cp_val
        
        # Resting ECG - handles "Resting ECG: 1", "Rest ECG\n1"
        ecg_val = safe_extract(r'resting\s+(?:ecg|ekg)[:\s\n]+(\d+\.?\d*)', text_lower)
        if ecg_val is not None:
            values['resting_ecg'] = ecg_val
        
        # Exercise Induced Angina - handles "Exercise Induced: Yes", "Exercise Angina: 1"
        ex_match = re.search(r'exercise\s+induced\s+(?:angina|angina\s+pectoris|angina)?[:\s\n]*(yes|no|1|0)', text_lower, re.IGNORECASE)
        if ex_match and ex_match.group(1):
            ex_val = ex_match.group(1).lower().strip()
            values['exercise_induced'] = 1.0 if ex_val in ['yes', '1'] else 0.0
        
        # Old Peak (ST depression) - handles "ST Depression: 2.5", "Old Peak\n2.5"
        op_val = safe_extract(r'(?:st\s+)?depression[:\s\n]+(\d+\.?\d*)', text_lower)
        if op_val is not None:
            values['old_peak'] = op_val
    
    except Exception as e:
        print(f"⚠️  Error during value extraction: {e}")
    
    # Return all extracted values
    return values


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5001)
