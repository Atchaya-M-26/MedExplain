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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5001)
