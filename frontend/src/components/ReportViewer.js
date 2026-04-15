import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import Chatbot from './Chatbot';

const ReportViewer = ({ report, onDelete }) => {
  const [showChat, setShowChat] = useState(false);
  const [currentReport, setCurrentReport] = useState(report);
  const { t } = useTranslation();

  useEffect(() => {
    setCurrentReport(report);
  }, [report]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'processing': return 'warning';
      case 'failed': return 'danger';
      default: return 'secondary';
    }
  };

  // Simplify medical terms in finding text
  const simplifyFindingText = (finding) => {
    const simplificationMap = {
      'high blood pressure': { simple: 'High Blood Pressure', explain: 'Your blood pressure is higher than normal. Follow your doctor\'s advice to manage it.' },
      'hypertension': { simple: 'High Blood Pressure', explain: 'Your blood pressure is higher than normal. Follow your doctor\'s advice to manage it.' },
      'elevated cholesterol': { simple: 'High Cholesterol', explain: 'Your cholesterol level is too high. Reduce fatty foods and exercise regularly.' },
      'high cholesterol': { simple: 'High Cholesterol', explain: 'Your cholesterol level is too high. Reduce fatty foods and exercise regularly.' },
      'elevated triglycerides': { simple: 'High Fat in Blood', explain: 'Fat levels in your blood are too high. Eat less sugar and processed foods.' },
      'high triglycerides': { simple: 'High Fat in Blood', explain: 'Fat levels in your blood are too high. Eat less sugar and processed foods.' },
      'low hemoglobin': { simple: 'Low Red Blood Cell Count', explain: 'You may have anemia. Eat iron-rich foods like spinach, red meat, or beans.' },
      'anemia': { simple: 'Low Red Blood Cell Count', explain: 'You may have anemia. Eat iron-rich foods like spinach, red meat, or beans.' },
      'high blood sugar': { simple: 'High Blood Sugar (Glucose)', explain: 'Your blood sugar is too high. Eat less sugar, more vegetables, and exercise.' },
      'hyperglycemia': { simple: 'High Blood Sugar', explain: 'Your blood sugar is too high. Eat less sugar, more vegetables, and exercise.' },
      'low blood sugar': { simple: 'Low Blood Sugar', explain: 'Your blood sugar is too low. Eat something sweet or consult your doctor.' },
      'hypoglycemia': { simple: 'Low Blood Sugar', explain: 'Your blood sugar is too low. Eat something sweet or consult your doctor.' },
      'high ldl': { simple: 'High Bad Cholesterol', explain: 'The "bad" cholesterol in your blood is too high. Exercise and eat healthy fats.' },
      'low hdl': { simple: 'Low Good Cholesterol', explain: 'The "good" cholesterol is too low. Exercise more and eat heart-healthy foods.' },
    };

    let mainText = finding;
    let explanation = '';

    // Check each simplification rule
    for (const [medical, { simple, explain }] of Object.entries(simplificationMap)) {
      if (finding.toLowerCase().includes(medical)) {
        mainText = finding.replace(new RegExp(medical, 'gi'), simple);
        explanation = explain;
        break;
      }
    }

    // If no specific match, generate a generic explanation
    if (!explanation) {
      explanation = 'Please discuss this finding with your doctor for proper guidance.';
    }

    return { main: mainText, explanation };
  };

  return (
    <Card>
      <Card.Body>
        <Row className="mb-4">
          <Col>
            <Card.Title>{currentReport.fileName}</Card.Title>
            <p className="text-muted">
              Uploaded: {new Date(currentReport.uploadDate).toLocaleDateString()}
            </p>
          </Col>
          <Col className="text-end">
            <Badge bg={getStatusColor(currentReport.status)} className="me-2">
              {currentReport.status}
            </Badge>
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete(currentReport._id)}
            >
              {t('dashboard.delete')}
            </Button>
          </Col>
        </Row>

        {currentReport.status === 'processing' && (
          <Alert variant="info">
            <Spinner animation="border" size="sm" className="me-2" />
            {t('reportViewer.processing')}
          </Alert>
        )}

        {currentReport.status === 'failed' && (
          <Alert variant="danger">
            {t('reportViewer.failed')} {currentReport.analysisError}
          </Alert>
        )}

        {currentReport.status === 'completed' && (
          <>
            {/* Simplified Summary Section */}
            {currentReport.simplifiedSummary && (
              <Alert variant="success" className="mb-4">
                <h6 className="mb-2">{t('reportViewer.whatYourReportSays')}</h6>
                {Array.isArray(currentReport.simplifiedSummary) ? (
                  <ul className="mb-0" style={{paddingLeft: '20px'}}>
                    {currentReport.simplifiedSummary.map((point, idx) => (
                      <li key={idx} style={{marginBottom: '8px'}}>{point}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mb-0">{currentReport.simplifiedSummary}</p>
                )}
              </Alert>
            )}

            {/* Color Legend - Explain what colors mean */}
            <Alert variant="info" className="mb-4">
              <h6 className="mb-2">🎨 Understanding Your Results:</h6>
              <div className="row">
                <div className="col-md-4">
                  <span className="badge bg-success me-2">✓ Green</span>
                  <small>Normal - Your value is healthy</small>
                </div>
                <div className="col-md-4">
                  <span className="badge bg-danger me-2">⚠️ Red</span>
                  <small>Needs Attention - Action may be needed</small>
                </div>
                <div className="col-md-4">
                  <span className="badge bg-warning text-dark me-2">📋 Yellow</span>
                  <small>Important - Review this finding</small>
                </div>
              </div>
            </Alert>

            {/* Abnormal Findings Section */}
            {currentReport.abnormalFindings && currentReport.abnormalFindings.length > 0 && (
              <Alert variant="warning" className="mb-4">
                <h6 className="mb-3">{t('reportViewer.importantFindings')}</h6>
                <p className="text-muted small mb-3">
                  These values are outside the normal range and should be discussed with your doctor:
                </p>
                <div>
                  {currentReport.abnormalFindings.map((finding, idx) => {
                    // Parse and simplify the finding with context
                    const findingText = finding || '';
                    const simplifiedFinding = simplifyFindingText(findingText);
                    
                    return (
                      <div key={idx} className="mb-3 p-2" style={{backgroundColor: '#fff3cd', borderRadius: '5px', borderLeft: '4px solid #ffc107'}}>
                        <p className="mb-1">
                          <strong>Finding {idx + 1}:</strong> {simplifiedFinding.main}
                        </p>
                        {simplifiedFinding.explanation && (
                          <p className="text-muted small mb-0">
                            💡 <em>{simplifiedFinding.explanation}</em>
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Alert>
            )}

            {/* Detailed Analysis Results */}
            {currentReport.analysis && currentReport.analysis.length > 0 && (
              <>
                <h5 className="mt-4 mb-3">{t('reportViewer.testResultsExplained')}</h5>
                <div className="row">
                  {currentReport.analysis.map((item, idx) => (
                    <div key={idx} className="col-md-6 mb-3">
                      <div className={`card ${item.isAbnormal ? 'border-danger' : 'border-success'}`}>
                        <div className="card-body">
                          <h6 className="card-title">{item.parameter}</h6>
                          <p className="card-text">
                            <strong>{t('reportViewer.yourValue')}</strong> {item.value} {item.unit}
                          </p>
                          <p className="card-text text-muted small mb-0">
                            {item.explanation}
                          </p>
                          <div className="mt-2">
                            {item.isAbnormal ? (
                              <span className="badge bg-danger">{t('reportViewer.abnormalStatus')}</span>
                            ) : (
                              <span className="badge bg-success">{t('reportViewer.normalStatus')}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Extracted Full Text Section - Only show if text looks valid and real */}
            {currentReport.extractedText && currentReport.extractedText.length > 150 && currentReport.extractedText.split(' ').length > 20 && !currentReport.extractedText.match(/[^\w\s.,()'"\-\/:\n]/g) && (
              <Alert variant="light" className="mt-4">
                <h6>{t('reportViewer.fullReportText')}</h6>
                <p className="small mb-0" style={{ maxHeight: '150px', overflow: 'auto' }}>
                  {currentReport.extractedText.substring(0, 500)}...
                </p>
              </Alert>
            )}
          </>
        )}

        {currentReport.status === 'completed' && (
          <Button
            variant="info"
            className="mt-3"
            onClick={() => setShowChat(!showChat)}
          >
            {showChat ? t('chatbot.title') : t('chatbot.chat')}
          </Button>
        )}

        {showChat && <Chatbot reportId={currentReport._id} reportData={currentReport} />}
      </Card.Body>
    </Card>
  );
};

export default ReportViewer;
