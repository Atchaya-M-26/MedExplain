import React, { useState } from 'react';

const DiseasePrediction = () => {
  const token = localStorage.getItem('token');
  const [activeTab, setActiveTab] = useState('diabetes');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [uploadMode, setUploadMode] = useState('manual'); // 'manual' or 'upload'
  const [uploadFile, setUploadFile] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [extractedValues, setExtractedValues] = useState(null);

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

  // Handle file upload for value extraction
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadFile(file);
    setExtracting(true);
    setError('');
    setExtractedValues(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Send to backend for OCR/value extraction
      const response = await fetch('http://localhost:5000/api/image-analysis/extract-values', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to extract values from image');
      
      const data = await response.json();
      
      // Check if OCR is available
      if (data.warning) {
        setError('📝 OCR not available - Please enter values manually or install Tesseract OCR');
      }
      
      setExtractedValues(data.extractedValues);

      // Auto-populate form fields only if values were successfully extracted
      if (data.extractedValues && !data.warning) {
        if (activeTab === 'diabetes' && data.extractedValues.diabetes) {
          setDiabetesData(prev => ({
            ...prev,
            ...data.extractedValues.diabetes
          }));
        } else if (activeTab === 'heart' && data.extractedValues.heart) {
          setHeartData(prev => ({
            ...prev,
            ...data.extractedValues.heart
          }));
        }
      }

      setError('');
    } catch (err) {
      setError(err.message || 'Failed to extract values. Please enter them manually.');
      setExtractedValues(null);
    } finally {
      setExtracting(false);
    }
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

      {/* Input Mode Selector */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
        <button
          onClick={() => {
            setUploadMode('manual');
            setError('');
          }}
          style={{
            padding: '0.5rem 1rem',
            border: 'none',
            background: uploadMode === 'manual' ? 'var(--color-accent)' : 'var(--color-surface)',
            color: uploadMode === 'manual' ? '#fff' : 'var(--color-text)',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 500,
            transition: 'all 0.2s',
          }}
        >
          📝 Manual Input
        </button>
        <button
          onClick={() => setUploadMode('upload')}
          style={{
            padding: '0.5rem 1rem',
            border: 'none',
            background: uploadMode === 'upload' ? 'var(--color-accent)' : 'var(--color-surface)',
            color: uploadMode === 'upload' ? '#fff' : 'var(--color-text)',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 500,
            transition: 'all 0.2s',
          }}
        >
          📤 Upload Report
        </button>
      </div>

      {/* Diabetes Form */}
      {activeTab === 'diabetes' && (
        <div>
          {uploadMode === 'upload' ? (
            <div style={{ marginBottom: '2rem' }}>
              <div style={{
                border: '2px dashed var(--color-border)',
                borderRadius: '12px',
                padding: '2rem',
                textAlign: 'center',
                cursor: 'pointer',
                background: 'var(--color-bg)',
                transition: 'all 0.2s',
              }} onClick={() => document.getElementById('diabetes-upload').click()}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📁</div>
                <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text)', margin: '0 0 0.5rem' }}>
                  Upload Medical Report
                </p>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  PDF, Image (JPG, PNG) - We'll extract values automatically
                </p>
                {uploadFile && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-accent)', marginTop: '0.5rem' }}>
                    ✓ {uploadFile.name}
                  </p>
                )}
              </div>
              <input
                id="diabetes-upload"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              {extracting && (
                <p style={{ textAlign: 'center', color: 'var(--color-accent)', marginTop: '1rem' }}>
                  🔄 Extracting values from report...
                </p>
              )}
              {extractedValues && (
                <div style={{ background: '#e8f5e9', border: '1px solid #4caf50', borderRadius: '8px', padding: '1rem', marginTop: '1rem' }}>
                  <p style={{ color: '#1b5e20', fontWeight: 600, margin: '0 0 0.5rem' }}>✓ Values extracted successfully!</p>
                  <p style={{ color: '#2e7d32', margin: 0 }}>The form fields below have been auto-filled. Review and adjust if needed.</p>
                </div>
              )}
            </div>
          ) : null}

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
          {uploadMode === 'upload' ? (
            <div style={{ marginBottom: '2rem' }}>
              <div style={{
                border: '2px dashed var(--color-border)',
                borderRadius: '12px',
                padding: '2rem',
                textAlign: 'center',
                cursor: 'pointer',
                background: 'var(--color-bg)',
                transition: 'all 0.2s',
              }} onClick={() => document.getElementById('heart-upload').click()}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📁</div>
                <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text)', margin: '0 0 0.5rem' }}>
                  Upload Medical Report
                </p>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  PDF, Image (JPG, PNG) - We'll extract values automatically
                </p>
                {uploadFile && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-accent)', marginTop: '0.5rem' }}>
                    ✓ {uploadFile.name}
                  </p>
                )}
              </div>
              <input
                id="heart-upload"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              {extracting && (
                <p style={{ textAlign: 'center', color: 'var(--color-accent)', marginTop: '1rem' }}>
                  🔄 Extracting values from report...
                </p>
              )}
              {extractedValues && (
                <div style={{ background: '#e8f5e9', border: '1px solid #4caf50', borderRadius: '8px', padding: '1rem', marginTop: '1rem' }}>
                  <p style={{ color: '#1b5e20', fontWeight: 600, margin: '0 0 0.5rem' }}>✓ Values extracted successfully!</p>
                  <p style={{ color: '#2e7d32', margin: 0 }}>The form fields below have been auto-filled. Review and adjust if needed.</p>
                </div>
              )}
            </div>
          ) : null}

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
                  {parseFloat(result.confidence).toFixed(1)}%
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
              setExtractedValues(null);
              setUploadFile(null);
              // Clear form fields
              setDiabetesData({
                pregnancies: '',
                glucose: '',
                blood_pressure: '',
                skin_thickness: '',
                insulin: '',
                bmi: '',
                diabetes_pedigree: '',
                age: '',
              });
              setHeartData({
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
