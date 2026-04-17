"""
Train ML models for disease prediction
- Diabetes Risk Prediction
- Heart Disease Risk Prediction
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import pickle
import os

# Create models directory
os.makedirs('models', exist_ok=True)

# ==================== DIABETES PREDICTION ====================
print("🔄 Training Diabetes Prediction Model...")

# Sample dataset (Pima Indians Diabetes Dataset structure)
# In production, load from actual dataset or database
diabetes_data = {
    'Pregnancies': np.random.randint(0, 15, 768),
    'Glucose': np.random.randint(44, 200, 768),
    'BloodPressure': np.random.randint(24, 122, 768),
    'SkinThickness': np.random.randint(7, 100, 768),
    'Insulin': np.random.randint(14, 846, 768),
    'BMI': np.random.uniform(18.2, 67.1, 768),
    'DiabetesPedigreeFunction': np.random.uniform(0.078, 2.42, 768),
    'Age': np.random.randint(21, 81, 768),
}

# Add realistic target variable (based on medical logic)
df_diabetes = pd.DataFrame(diabetes_data)
df_diabetes['Outcome'] = (
    (df_diabetes['Glucose'] > 120).astype(int) * 0.3 +
    (df_diabetes['BMI'] > 30).astype(int) * 0.3 +
    (df_diabetes['Age'] > 45).astype(int) * 0.2 +
    (df_diabetes['BloodPressure'] > 90).astype(int) * 0.2
) > 0.5

# Features and target
X_diabetes = df_diabetes.drop('Outcome', axis=1)
y_diabetes = df_diabetes['Outcome']

# Train-test split
X_train_d, X_test_d, y_train_d, y_test_d = train_test_split(
    X_diabetes, y_diabetes, test_size=0.2, random_state=42
)

# Scale features
scaler_diabetes = StandardScaler()
X_train_d_scaled = scaler_diabetes.fit_transform(X_train_d)
X_test_d_scaled = scaler_diabetes.transform(X_test_d)

# Train model
model_diabetes = RandomForestClassifier(n_estimators=100, random_state=42, max_depth=10)
model_diabetes.fit(X_train_d_scaled, y_train_d)

# Evaluate
y_pred_d = model_diabetes.predict(X_test_d_scaled)
acc_d = accuracy_score(y_test_d, y_pred_d)
prec_d = precision_score(y_test_d, y_pred_d, zero_division=0)
rec_d = recall_score(y_test_d, y_pred_d, zero_division=0)
f1_d = f1_score(y_test_d, y_pred_d, zero_division=0)

print(f"✅ Diabetes Model Trained!")
print(f"   Accuracy:  {acc_d:.2%}")
print(f"   Precision: {prec_d:.2%}")
print(f"   Recall:    {rec_d:.2%}")
print(f"   F1 Score:  {f1_d:.2%}")

# Save model and scaler
with open('models/diabetes_model.pkl', 'wb') as f:
    pickle.dump(model_diabetes, f)
with open('models/diabetes_scaler.pkl', 'wb') as f:
    pickle.dump(scaler_diabetes, f)

# ==================== HEART DISEASE PREDICTION ====================
print("\n🔄 Training Heart Disease Prediction Model...")

# Sample dataset (Heart Disease dataset structure)
heart_data = {
    'Age': np.random.randint(29, 77, 303),
    'Sex': np.random.randint(0, 2, 303),  # 0=Female, 1=Male
    'ChestPain': np.random.randint(0, 4, 303),
    'RestingBP': np.random.randint(94, 200, 303),
    'Cholesterol': np.random.randint(126, 564, 303),
    'FastingBlood': np.random.randint(0, 2, 303),
    'RestingECG': np.random.randint(0, 3, 303),
    'MaxHeartRate': np.random.randint(71, 202, 303),
    'ExerciseInduced': np.random.randint(0, 2, 303),
    'OldPeak': np.random.uniform(0, 6.2, 303),
}

df_heart = pd.DataFrame(heart_data)
df_heart['HeartDisease'] = (
    (df_heart['Age'] > 50).astype(int) * 0.3 +
    (df_heart['Cholesterol'] > 240).astype(int) * 0.3 +
    (df_heart['RestingBP'] > 140).astype(int) * 0.2 +
    (df_heart['MaxHeartRate'] < 100).astype(int) * 0.2
) > 0.5

X_heart = df_heart.drop('HeartDisease', axis=1)
y_heart = df_heart['HeartDisease']

# Train-test split
X_train_h, X_test_h, y_train_h, y_test_h = train_test_split(
    X_heart, y_heart, test_size=0.2, random_state=42
)

# Scale features
scaler_heart = StandardScaler()
X_train_h_scaled = scaler_heart.fit_transform(X_train_h)
X_test_h_scaled = scaler_heart.transform(X_test_h)

# Train model
model_heart = RandomForestClassifier(n_estimators=100, random_state=42, max_depth=10)
model_heart.fit(X_train_h_scaled, y_train_h)

# Evaluate
y_pred_h = model_heart.predict(X_test_h_scaled)
acc_h = accuracy_score(y_test_h, y_pred_h)
prec_h = precision_score(y_test_h, y_pred_h, zero_division=0)
rec_h = recall_score(y_test_h, y_pred_h, zero_division=0)
f1_h = f1_score(y_test_h, y_pred_h, zero_division=0)

print(f"✅ Heart Disease Model Trained!")
print(f"   Accuracy:  {acc_h:.2%}")
print(f"   Precision: {prec_h:.2%}")
print(f"   Recall:    {rec_h:.2%}")
print(f"   F1 Score:  {f1_h:.2%}")

# Save model and scaler
with open('models/heart_model.pkl', 'wb') as f:
    pickle.dump(model_heart, f)
with open('models/heart_scaler.pkl', 'wb') as f:
    pickle.dump(scaler_heart, f)

print("\n🎉 All models trained and saved!")
print("📁 Models saved in: ./models/")
