import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Badge, Row, Col, Alert, Spinner, Button } from 'react-bootstrap';
import { imageAnalysisService } from '../services/api';

const ScanAnalysisDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const imageTypeLabels = {
    'chest-xray': 'Chest X-ray',
    'ct-scan': 'CT Scan',
    'mri': 'MRI'
  };

  useEffect(() => {
    loadAnalysisDetail();
  }, [id]);

  const loadAnalysisDetail = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await imageAnalysisService.getAnalysis(id);
      setAnalysis(response.data.analysis);
      setError('');
    } catch (err) {
      console.error('Error loading analysis detail:', err);
      setError('Failed to load scan analysis details');
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'low':
      case 'normal':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
      case 'abnormal':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Spinner animation="border" variant="primary" />
          <p style={{ marginTop: '1rem', color: '#6c757d' }}>Loading scan analysis...</p>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error || 'Analysis not found'}</Alert>
        <Button variant="outline-primary" onClick={() => navigate('/timeline')}>
          Back to History
        </Button>
      </Container>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', paddingBottom: '2rem' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #2b7a8e 0%, #1e5a6b 100%)', padding: '2rem 0', marginBottom: '2rem' }}>
        <Container>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ color: 'white', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                {imageTypeLabels[analysis.imageType] || analysis.imageType} Analysis
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 0 }}>
                {new Date(analysis.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <Button 
              variant="light" 
              onClick={() => navigate('/timeline')}
              style={{ height: 'fit-content' }}
            >
              ← Back
            </Button>
          </div>
        </Container>
      </div>

      <Container>
        {/* Risk Level Card */}
        <Card className="mb-4" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <Card.Body className="text-center py-4">
            <h6 style={{ color: '#6c757d', marginBottom: '1rem', textTransform: 'uppercase', fontSize: '0.85rem' }}>Overall Risk Level</h6>
            <Badge 
              bg={getRiskLevelColor(analysis.riskLevel)} 
              style={{ fontSize: '1.2rem', padding: '0.5rem 1.5rem' }}
            >
              {analysis.riskLevel}
            </Badge>
          </Card.Body>
        </Card>

        {/* Analysis Summary */}
        <Row className="mb-4">
          <Col lg={4} md={6} className="mb-3">
            <Card style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <Card.Body>
                <small style={{ color: '#6c757d', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                  Prediction
                </small>
                <h5 style={{ marginBottom: 0 }}>{analysis.prediction}</h5>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={4} md={6} className="mb-3">
            <Card style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <Card.Body>
                <small style={{ color: '#6c757d', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                  Confidence
                </small>
                <h5 style={{ marginBottom: 0 }}>
                  {analysis.confidence ? `${parseFloat(analysis.confidence).toFixed(1)}%` : 'N/A'}
                </h5>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={4} md={6} className="mb-3">
            <Card style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <Card.Body>
                <small style={{ color: '#6c757d', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                  Image Type
                </small>
                <h5 style={{ marginBottom: 0 }}>
                  {imageTypeLabels[analysis.imageType] || analysis.imageType}
                </h5>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Findings */}
        {analysis.findings && analysis.findings.length > 0 && (
          <Card className="mb-4" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <Card.Header style={{ background: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
              <Card.Title className="mb-0">Key Findings</Card.Title>
            </Card.Header>
            <Card.Body>
              <ul style={{ marginBottom: 0, paddingLeft: '1.5rem' }}>
                {analysis.findings.map((finding, idx) => (
                  <li key={idx} style={{ marginBottom: '0.75rem', color: '#495057' }}>
                    {finding}
                  </li>
                ))}
              </ul>
            </Card.Body>
          </Card>
        )}

        {/* Recommendation */}
        {analysis.recommendation && (
          <Card className="mb-4" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <Card.Header style={{ background: '#e7f3ff', borderBottom: '1px solid #b3d9ff' }}>
              <Card.Title className="mb-0" style={{ color: '#004085' }}>Clinical Recommendation</Card.Title>
            </Card.Header>
            <Card.Body style={{ background: '#f8f9fa' }}>
              <p style={{ marginBottom: 0, color: '#495057', lineHeight: '1.6' }}>
                {analysis.recommendation}
              </p>
            </Card.Body>
          </Card>
        )}

        {/* Detailed Probabilities */}
        {(analysis.chestXrayData || analysis.ctScanData || analysis.mriData) && (
          <Card style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <Card.Header style={{ background: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
              <Card.Title className="mb-0">Detailed Analysis</Card.Title>
            </Card.Header>
            <Card.Body>
              <Row>
                {analysis.chestXrayData && (
                  <>
                    <Col md={6} className="mb-3">
                      <small style={{ color: '#6c757d', display: 'block', marginBottom: '0.5rem' }}>
                        Normal Probability
                      </small>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2b7a8e' }}>
                        {analysis.chestXrayData.normalProbability}%
                      </div>
                    </Col>
                    <Col md={6} className="mb-3">
                      <small style={{ color: '#6c757d', display: 'block', marginBottom: '0.5rem' }}>
                        Abnormal Probability
                      </small>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc3545' }}>
                        {analysis.chestXrayData.abnormalProbability}%
                      </div>
                    </Col>
                  </>
                )}

                {analysis.mriData && (
                  <>
                    <Col md={6} className="mb-3">
                      <small style={{ color: '#6c757d', display: 'block', marginBottom: '0.5rem' }}>
                        Normal Probability
                      </small>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2b7a8e' }}>
                        {analysis.mriData.normalProbability}%
                      </div>
                    </Col>
                    <Col md={6} className="mb-3">
                      <small style={{ color: '#6c757d', display: 'block', marginBottom: '0.5rem' }}>
                        Abnormal Probability
                      </small>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc3545' }}>
                        {analysis.mriData.abnormalProbability}%
                      </div>
                    </Col>
                  </>
                )}

                {analysis.ctScanData && (
                  <Col md={12} className="mb-3">
                    <small style={{ color: '#6c757d', display: 'block', marginBottom: '0.5rem' }}>
                      Classification Probabilities
                    </small>
                    <pre style={{ 
                      background: '#f5f5f5', 
                      padding: '1rem', 
                      borderRadius: '4px',
                      overflow: 'auto',
                      fontSize: '0.9rem'
                    }}>
                      {JSON.stringify(analysis.ctScanData.probabilities, null, 2)}
                    </pre>
                  </Col>
                )}
              </Row>
            </Card.Body>
          </Card>
        )}

        {/* Metadata */}
        <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '4px', fontSize: '0.85rem', color: '#6c757d' }}>
          <p style={{ marginBottom: '0.3rem' }}>
            <strong>Analysis ID:</strong> {analysis._id}
          </p>
          <p style={{ marginBottom: '0.3rem' }}>
            <strong>File Name:</strong> {analysis.fileName}
          </p>
          <p style={{ marginBottom: 0 }}>
            <strong>Analyzed:</strong> {new Date(analysis.createdAt).toLocaleString()}
          </p>
        </div>
      </Container>
    </div>
  );
};

export default ScanAnalysisDetail;
