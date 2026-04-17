import React, { useState, useEffect } from 'react';
import { Container, Card, Badge, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { imageAnalysisService } from '../services/api';

const History = () => {
  const [scanHistory, setScanHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const imageTypes = {
    'chest-xray': { name: 'Chest X-ray', icon: '🫁' },
    'ct-scan': { name: 'CT Scan', icon: '📊' },
    'mri': { name: 'MRI', icon: '🧠' }
  };

  useEffect(() => {
    loadScanHistory();
  }, []);

  const loadScanHistory = async () => {
    try {
      setLoading(true);
      const response = await imageAnalysisService.getHistory();
      setScanHistory(response.data.analyses || []);
      setError('');
    } catch (err) {
      console.error('Error loading scan history:', err);
      setError('Failed to load scan analysis history');
      setScanHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
        return 'danger';
      case 'abnormal':
        return 'danger';
      case 'normal':
        return 'success';
      default:
        return 'secondary';
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', paddingBottom: '2rem' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #2b7a8e 0%, #1e5a6b 100%)', padding: '2rem 0', marginBottom: '2rem' }}>
        <Container>
          <h1 style={{ color: 'white', fontWeight: 'bold', marginBottom: '0.5rem' }}>Scan Analysis History</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 0 }}>View all your medical scan analyses</p>
        </Container>
      </div>

      <Container>
        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <Spinner animation="border" variant="primary" />
            <p style={{ marginTop: '1rem', color: '#6c757d' }}>Loading scan history...</p>
          </div>
        )}

        {!loading && error && (
          <Alert variant="danger">{error}</Alert>
        )}

        {!loading && !error && scanHistory.length === 0 && (
          <Card style={{ textAlign: 'center', padding: '3rem', border: '2px dashed #dee2e6' }}>
            <Card.Body>
              <h5 style={{ color: '#6c757d', marginBottom: '0.5rem' }}>No scan analyses yet</h5>
              <p style={{ color: '#adb5bd', marginBottom: 0 }}>Upload and analyze medical images to see your history here</p>
            </Card.Body>
          </Card>
        )}

        {!loading && !error && scanHistory.length > 0 && (
          <div>
            <Row>
              {scanHistory.map((analysis) => (
                <Col lg={6} md={12} key={analysis._id} style={{ marginBottom: '1.5rem' }}>
                  <Card style={{ height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <Card.Header style={{ background: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h6 style={{ marginBottom: '0.25rem', fontWeight: 'bold' }}>
                            {imageTypes[analysis.imageType]?.name || analysis.imageType}
                          </h6>
                          <small style={{ color: '#6c757d' }}>
                            {new Date(analysis.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </small>
                        </div>
                        <div>
                          <Badge bg={getRiskLevelColor(analysis.riskLevel)} style={{ marginRight: '0.5rem' }}>
                            {analysis.riskLevel || 'Unknown'}
                          </Badge>
                        </div>
                      </div>
                    </Card.Header>
                    <Card.Body>
                      <div style={{ marginBottom: '1rem' }}>
                        <small style={{ color: '#6c757d', display: 'block', marginBottom: '0.5rem' }}>Prediction</small>
                        <p style={{ marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: 'bold' }}>
                          {analysis.prediction}
                        </p>
                        <small style={{ color: '#6c757d' }}>
                          Confidence: {analysis.confidence ? `${(analysis.confidence * 100).toFixed(1)}%` : 'N/A'}
                        </small>
                      </div>

                      {analysis.findings && analysis.findings.length > 0 && (
                        <div style={{ marginBottom: '1rem' }}>
                          <small style={{ color: '#6c757d', display: 'block', marginBottom: '0.5rem' }}>Findings</small>
                          <ul style={{ marginBottom: 0, paddingLeft: '1.25rem' }}>
                            {analysis.findings.map((finding, idx) => (
                              <li key={idx} style={{ fontSize: '0.9rem', color: '#495057' }}>
                                {finding}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {analysis.recommendation && (
                        <div>
                          <small style={{ color: '#6c757d', display: 'block', marginBottom: '0.5rem' }}>Recommendation</small>
                          <p style={{ marginBottom: 0, fontSize: '0.9rem', color: '#495057' }}>
                            {analysis.recommendation}
                          </p>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        )}
      </Container>
    </div>
  );
};

export default History;
