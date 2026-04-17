import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DiseasePrediction = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('diabetes');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Diabetes form state
  const [diabetesData, setDiabetesData] = useState({
    pregnancies: '',
    glucose: '',
    blood_pressure: '',
    skin_thickness: '',
    insulin: '',
    bmi: '',
    diabetes_pedigree: '',
    age: '',
  });

  // Heart disease form state
  const [heartData, setHeartData] = useState({
    age: '',
    sex: '',
    chest_pain: '',
    resting_bp: '',
    cholesterol: '',
    fasting_blood: '',
    resting_ecg: '',
    max_heart_rate: '',
    exercise_induced: '',
    old_peak: '',
  });

  const handleDiabetesChange = (e) => {
    setDiabetesData({ ...diabetesData, [e.target.name]: e.target.value });
  };

  const handleHeartChange = (e) => {
    setHeartData({ ...heartData, [e.target.name]: e.target.value });
  };

  const predictDiabetes = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('http://localhost:5001/predict/diabetes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pregnancies: parseFloat(diabetesData.pregnancies),
          glucose: parseFloat(diabetesData.glucose),
          blood_pressure: parseFloat(diabetesData.blood_pressure),
          skin_thickness: parseFloat(diabetesData.skin_thickness),
          insulin: parseFloat(diabetesData.insulin),
          bmi: parseFloat(diabetesData.bmi),
          diabetes_pedigree: parseFloat(diabetesData.diabetes_pedigree),
          age: parseFloat(diabetesData.age),
        }),
      });

      if (!response.ok) throw new Error('Prediction failed');
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to predict. Make sure ML server is running on port 5001');
    } finally {
      setLoading(false);
    }
  };

  const predictHeart = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('http://localhost:5001/predict/heart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: parseFloat(heartData.age),
          sex: parseFloat(heartData.sex),
          chest_pain: parseFloat(heartData.chest_pain),
          resting_bp: parseFloat(heartData.resting_bp),
          cholesterol: parseFloat(heartData.cholesterol),
          fasting_blood: parseFloat(heartData.fasting_blood),
          resting_ecg: parseFloat(heartData.resting_ecg),
          max_heart_rate: parseFloat(heartData.max_heart_rate),
          exercise_induced: parseFloat(heartData.exercise_induced),
          old_peak: parseFloat(heartData.old_peak),
        }),
      });

      if (!response.ok) throw new Error('Prediction failed');
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to predict. Make sure ML server is running on port 5001');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'Low':
        return '#10b981';
      case 'Medium':
        return '#f59e0b';
      case 'High':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const containerStyle = {
    maxWidth: '900px',
    margin: '2rem auto',
    padding: '2rem',
  };

  const tabStyle = {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
    borderBottom: '2px solid var(--color-border)',
  };

  const tabButtonStyle = (isActive) => ({
    padding: '0.75rem 1.5rem',
    border: 'none',
    background: 'transparent',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)',
    borderBottom: isActive ? '3px solid var(--color-accent)' : 'none',
    transition: 'all 0.2s',
  });

  const formStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  };

  const inputStyle = {
    width: '100%',
    padding: '0.65rem 0.9rem',
    border: '1px solid var(--color-border)',
    borderRadius: '8px',
    fontSize: '0.95rem',
    background: 'var(--color-bg)',
    color: 'var(--color-text)',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--color-text)',
    marginBottom: '0.35rem',
  };

  const buttonStyle = {
    gridColumn: '1 / -1',
    padding: '0.8rem 1.5rem',
    background: 'var(--color-accent)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  };

  const resultStyle = {
    background: 'var(--color-surface)',
    border: '2px solid var(--color-border)',
    borderRadius: '12px',
    padding: '2rem',
    marginTop: '2rem',
  };

  const riskBadgeStyle = (riskLevel) => ({
    display: 'inline-block',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    background: getRiskColor(riskLevel),
    color: '#fff',
    fontWeight: 600,
    fontSize: '0.9rem',
  });

  return (
    <div style={containerStyle}>
      <h1 style={{ marginBottom: '1rem', color: 'var(--color-text)' }}>Disease Prediction</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
        Get personalized health risk assessments using AI-powered predictions
      </p>

      {/* Tabs */}
      <div style={tabStyle}>
        <button
          style={tabButtonStyle(activeTab === 'diabetes')}
          onClick={() => {
            setActiveTab('diabetes');
            setResult(null);
            setError('');
          }}
        >
          Diabetes Risk
        </button>
        <button
          style={tabButtonStyle(activeTab === 'heart')}
          onClick={() => {
            setActiveTab('heart');
            setResult(null);
            setError('');
          }}
        >
          Heart Disease Risk
        </button>
      </div>

      {/* Diabetes Form */}
      {activeTab === 'diabetes' && (
        <div>
          <form onSubmit={predictDiabetes} style={formStyle}>
            {Object.entries(diabetesData).map(([key, value]) => (
              <div key={key}>
                <label style={labelStyle}>
                  {key.replace(/_/g, ' ').toUpperCase()}
                </label>
                <input
                  type="number"
                  step="any"
                  name={key}
                  value={value}
                  onChange={handleDiabetesChange}
                  required
                  placeholder="Enter value"
                  style={inputStyle}
                />
              </div>
            ))}
            <button type="submit" disabled={loading} style={buttonStyle}>
              {loading ? 'Predicting...' : 'Predict Diabetes Risk'}
            </button>
          </form>
        </div>
      )}

      {/* Heart Disease Form */}
      {activeTab === 'heart' && (
        <div>
          <form onSubmit={predictHeart} style={formStyle}>
            {Object.entries(heartData).map(([key, value]) => (
              <div key={key}>
                <label style={labelStyle}>
                  {key.replace(/_/g, ' ').toUpperCase()}
                </label>
                <input
                  type="number"
                  step="any"
                  name={key}
                  value={value}
                  onChange={handleHeartChange}
                  required
                  placeholder="Enter value"
                  style={inputStyle}
                />
              </div>
            ))}
            <button type="submit" disabled={loading} style={buttonStyle}>
              {loading ? 'Predicting...' : 'Predict Heart Disease Risk'}
            </button>
          </form>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div
          style={{
            background: '#fde8e8',
            border: '1px solid #f5c6cb',
            color: '#9b1c1c',
            padding: '1rem',
            borderRadius: '8px',
            marginTop: '1rem',
          }}
        >
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div style={resultStyle}>
          <h2 style={{ marginTop: 0, color: 'var(--color-text)' }}>{result.disease} Risk Assessment</h2>

          <div style={{ display: 'grid', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', margin: '0 0 0.5rem' }}>
                Risk Level
              </p>
              <div style={riskBadgeStyle(result.risk_level)}>{result.risk_level}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', margin: '0 0 0.25rem' }}>
                  Risk Score
                </p>
                <p style={{ fontSize: '1.8rem', fontWeight: 700, color: getRiskColor(result.risk_level), margin: 0 }}>
                  {(result.risk * 100).toFixed(1)}%
                </p>
              </div>
              <div>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', margin: '0 0 0.25rem' }}>
                  Model Confidence
                </p>
                <p style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-accent)', margin: 0 }}>
                  {(result.confidence * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            <div>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', margin: '0 0 0.5rem' }}>
                Interpretation
              </p>
              <p style={{ color: 'var(--color-text)', lineHeight: 1.6, margin: 0 }}>
                {result.interpretation}
              </p>
            </div>

            <div style={{ background: 'var(--color-accent-lt)', padding: '1rem', borderRadius: '8px' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-accent)', fontWeight: 600, margin: '0 0 0.5rem' }}>
                Recommendation
              </p>
              <p style={{ color: 'var(--color-accent)', margin: 0, lineHeight: 1.6 }}>
                {result.recommendation}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setResult(null);
              setError('');
            }}
            style={{
              padding: '0.65rem 1.5rem',
              background: 'transparent',
              border: '1.5px solid var(--color-border)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 500,
              color: 'var(--color-text-muted)',
              transition: 'all 0.2s',
            }}
          >
            New Prediction
          </button>
        </div>
      )}
    </div>
  );
};

export default DiseasePrediction;
