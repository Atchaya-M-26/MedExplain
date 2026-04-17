# ML Module - Disease Prediction

This module provides machine learning models for disease prediction using FastAPI.

## Features

- **Diabetes Risk Prediction** - Predicts diabetes risk based on health metrics
- **Heart Disease Risk Prediction** - Predicts heart disease risk
- Real-time predictions with confidence scores
- Risk level classification (Low/Medium/High)
- Personalized recommendations

## Setup

### 1. Create Python Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Train Models

```bash
python train_model.py
```

This will:
- Train diabetes prediction model
- Train heart disease prediction model
- Save models to `models/` directory
- Display model accuracy and performance metrics

### 4. Run API Server

```bash
python main.py
```

The server will start on `http://localhost:5001`

## API Endpoints

### Health Check
```
GET /health
```

Response:
```json
{
  "status": "healthy",
  "models": {
    "diabetes": true,
    "heart": true
  }
}
```

### List Models
```
GET /models
```

### Predict Diabetes
```
POST /predict/diabetes
Content-Type: application/json

{
  "pregnancies": 6,
  "glucose": 148,
  "blood_pressure": 72,
  "skin_thickness": 35,
  "insulin": 155,
  "bmi": 33.6,
  "diabetes_pedigree": 0.627,
  "age": 50
}
```

Response:
```json
{
  "disease": "Diabetes",
  "risk": 0.8234,
  "risk_level": "High",
  "confidence": 0.9123,
  "interpretation": "Your diabetes risk is high...",
  "recommendation": "Schedule an appointment with an endocrinologist..."
}
```

### Predict Heart Disease
```
POST /predict/heart
Content-Type: application/json

{
  "age": 63,
  "sex": 1,
  "chest_pain": 3,
  "resting_bp": 145,
  "cholesterol": 233,
  "fasting_blood": 1,
  "resting_ecg": 0,
  "max_heart_rate": 150,
  "exercise_induced": 0,
  "old_peak": 2.3
}
```

Response:
```json
{
  "disease": "Heart Disease",
  "risk": 0.7654,
  "risk_level": "High",
  "confidence": 0.8901,
  "interpretation": "Your heart disease risk is high...",
  "recommendation": "Seek immediate consultation with a cardiologist..."
}
```

## Testing with cURL

### Diabetes Prediction
```bash
curl -X POST http://localhost:5001/predict/diabetes \
  -H "Content-Type: application/json" \
  -d '{
    "pregnancies": 6,
    "glucose": 148,
    "blood_pressure": 72,
    "skin_thickness": 35,
    "insulin": 155,
    "bmi": 33.6,
    "diabetes_pedigree": 0.627,
    "age": 50
  }'
```

### Heart Disease Prediction
```bash
curl -X POST http://localhost:5001/predict/heart \
  -H "Content-Type: application/json" \
  -d '{
    "age": 63,
    "sex": 1,
    "chest_pain": 3,
    "resting_bp": 145,
    "cholesterol": 233,
    "fasting_blood": 1,
    "resting_ecg": 0,
    "max_heart_rate": 150,
    "exercise_induced": 0,
    "old_peak": 2.3
  }'
```

## Project Structure

```
ml/
├── main.py              # FastAPI server with endpoints
├── train_model.py       # Model training script
├── requirements.txt     # Python dependencies
├── models/              # Trained models (generated)
│   ├── diabetes_model.pkl
│   ├── diabetes_scaler.pkl
│   ├── heart_model.pkl
│   └── heart_scaler.pkl
└── README.md           # This file
```

## Integration with MedExplain

The ML API is called from the Node.js backend:

```javascript
// backend/services/mlService.js
const axios = require('axios');

const ML_API = 'http://localhost:5001';

const predictDiabetes = async (healthData) => {
  const response = await axios.post(`${ML_API}/predict/diabetes`, healthData);
  return response.data;
};

const predictHeartDisease = async (healthData) => {
  const response = await axios.post(`${ML_API}/predict/heart`, healthData);
  return response.data;
};

module.exports = { predictDiabetes, predictHeartDisease };
```

## Models Used

- **Algorithm**: Random Forest Classifier
- **Trees**: 100
- **Max Depth**: 10
- **Scaling**: StandardScaler (for normalization)

## Performance Metrics

After training, you'll see accuracy, precision, recall, and F1 scores:

- **Diabetes Model**: ~80% accuracy
- **Heart Disease Model**: ~75% accuracy

Note: Actual performance varies based on dataset quality

## Troubleshooting

### Models not found
```
⚠️ Diabetes model not found
```
**Solution**: Run `python train_model.py` first

### Connection refused on localhost:5001
**Solution**: Make sure the FastAPI server is running with `python main.py`

### CORS errors
The API is configured to accept requests from:
- http://localhost:3000 (Frontend)
- http://localhost:5000 (Backend)

## Future Enhancements

- [ ] Add more diseases (stroke, kidney disease, etc.)
- [ ] Implement model versioning
- [ ] Add model retraining endpoint
- [ ] Create dashboard for model metrics
- [ ] Add feature importance visualization
- [ ] Implement user feedback loop for continuous improvement
