import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Badge } from 'react-bootstrap';
import axios from 'axios';

const MedicalImageAnalysis = () => {
  const [authToken, setAuthToken] = useState(localStorage.getItem('token'));
  const [selectedFile, setSelectedFile] = useState(null);
  const [scanType, setScanType] = useState('chest-xray');
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const imageTypes = {
    'chest-xray': {
      name: 'Chest X-ray',
      description: 'Analyze chest X-rays for pneumonia, COVID-19, and other abnormalities',
      endpoint: '/api/image-analysis/analyze/chest-xray'
    },
    'ct-scan': {
      name: 'CT Scan',
      description: 'Analyze CT scans for lesions and structural abnormalities',
      endpoint: '/api/image-analysis/analyze/ct-scan'
    },
    'mri': {
      name: 'MRI',
      description: 'Analyze MRI scans for soft tissue and structural changes',
      endpoint: '/api/image-analysis/analyze/mri'
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Please select an image file');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await axios.post(
        `http://localhost:5000${imageTypes[scanType].endpoint}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`
          },
          timeout: 120000
        }
      );

      setResult(response.data.analysis);
      setSelectedFile(null);
      setPreview(null);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to analyze image. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelBg = (riskLevel) => {
    switch (riskLevel) {
      case 'Low':
        return '#d1fae5';
      case 'Medium':
        return '#fef3c7';
      case 'High':
        return '#fee2e2';
      default:
        return '#e2e3e5';
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'Low':
        return 'success';
      case 'Medium':
        return 'warning';
      case 'High':
        return 'danger';
      default:
        return 'secondary';
    }
  };


  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-dk) 100%)', paddingTop: '2rem', paddingBottom: '2rem' }}>
      {/* Header */}
      <div style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', margin: 0, marginBottom: '0.5rem' }}>
            Scan Analysis
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem', margin: 0 }}>
            Upload medical scans for AI-powered analysis
          </p>
        </div>
      </div>

      {/* Main Content */}
      <Container style={{ maxWidth: 1000 }}>
        {!result ? (
          <Card style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.1)', borderRadius: '12px', marginBottom: '2rem' }}>
            <Card.Body style={{ padding: '2rem' }}>
              <Card.Title style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '2rem' }}>
                Upload Scan
              </Card.Title>

              {error && (
                <Alert variant="danger" style={{ marginBottom: '1.5rem' }}>
                  {error}
                </Alert>
              )}

              <Form>
                {/* Image Upload Area */}
                <Form.Group style={{ marginBottom: '2rem' }}>
                  <div 
                    style={{
                      border: '2px dashed #ccc',
                      padding: '3rem 2rem',
                      textAlign: 'center',
                      borderRadius: '8px',
                      backgroundColor: '#f9f9f9',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'var(--color-accent)';
                      e.currentTarget.style.backgroundColor = 'rgba(43, 122, 142, 0.05)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = '#ccc';
                      e.currentTarget.style.backgroundColor = '#f9f9f9';
                    }}
                    onClick={() => document.getElementById('fileInput').click()}
                  >
                    {preview ? (
                      <div>
                        <img 
                          src={preview} 
                          alt="Preview" 
                          style={{
                            maxWidth: '100%',
                            maxHeight: '300px',
                            marginBottom: '1rem',
                            borderRadius: '8px'
                          }}
                        />
                        <p style={{ marginBottom: '0.5rem', fontWeight: 600 }}>
                          {selectedFile?.name}
                        </p>
                        <small style={{ color: '#6c757d' }}>
                          {(selectedFile?.size / 1024 / 1024).toFixed(2)} MB
                        </small>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📸</div>
                        <h5 style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Drag and drop your scan</h5>
                        <p style={{ color: '#6c757d', marginBottom: '0.5rem' }}>or click to select</p>
                        <small style={{ color: '#999' }}>
                          Supported: JPEG, PNG | Max 10MB
                        </small>
                      </div>
                    )}
                    <Form.Control
                      id="fileInput"
                      type="file"
                      accept="image/jpeg,image/png,image/jpg"
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                      disabled={loading}
                    />
                  </div>
                </Form.Group>

                {/* Upload Buttons */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleAnalyze}
                    disabled={!selectedFile || loading}
                    style={{ flex: 1 }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                        Analyzing...
                      </>
                    ) : (
                      'Analyze Scan'
                    )}
                  </Button>
                  {selectedFile && (
                    <Button
                      variant="outline-secondary"
                      size="lg"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreview(null);
                        setScanType(null);
                      }}
                      disabled={loading}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>
        ) : (
          <Card style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.1)', borderRadius: '12px' }}>
            <Card.Body style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <Card.Title style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>
                  {imageTypes[scanType].name} Analysis Results
                </Card.Title>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => {
                    setResult(null);
                    setSelectedFile(null);
                    setPreview(null);
                    setScanType('chest-xray');
                    setError(null);
                  }}
                >
                  + New Scan
                </Button>
              </div>

              {/* Risk Level */}
              <div style={{ 
                padding: '1rem',
                borderRadius: '8px',
                backgroundColor: getRiskLevelBg(result.riskLevel),
                marginBottom: '1.5rem'
              }}>
                <small style={{ color: '#666', display: 'block', marginBottom: '0.5rem' }}>Risk Level</small>
                <Badge bg={getRiskColor(result.riskLevel)} style={{ fontSize: '1rem' }}>
                  {result.riskLevel}
                </Badge>
              </div>

              {/* Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                  <small style={{ color: '#666', display: 'block', marginBottom: '0.25rem' }}>Prediction</small>
                  <h5 style={{ margin: 0, fontWeight: 700 }}>{result.prediction}</h5>
                </div>
                <div style={{ padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                  <small style={{ color: '#666', display: 'block', marginBottom: '0.25rem' }}>Confidence</small>
                  <h5 style={{ margin: 0, fontWeight: 700 }}>
                    {result.confidence ? `${(result.confidence * 100).toFixed(1)}%` : 'N/A'}
                  </h5>
                </div>
              </div>

              {/* Findings */}
              {result.findings && result.findings.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h6 style={{ fontWeight: 700, marginBottom: '1rem' }}>Key Findings</h6>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {result.findings.map((finding, index) => (
                      <li key={index} style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.75rem' }}>
                        <Badge bg="light" text="dark" style={{ minWidth: '24px' }}>
                          {index + 1}
                        </Badge>
                        <span>{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendation */}
              {result.recommendation && (
                <Alert variant="info">
                  <strong>Clinical Recommendation:</strong> {result.recommendation}
                </Alert>
              )}
            </Card.Body>
          </Card>
        )}
      </Container>
    </div>
  );
};

export default MedicalImageAnalysis;
