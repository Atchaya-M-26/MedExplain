import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';
import { timelineService } from '../services/api';

const fmt = d => d ? new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
const fmtMonth = d => d ? new Date(d).toLocaleDateString(undefined, { month: 'short' }) : '';
const fmtDay = d => d ? new Date(d).getDate() : '';
const fmtYear = d => d ? new Date(d).getFullYear() : '';

const imageTypeLabels = {
  'chest-xray': 'Chest X-ray',
  'ct-scan': 'CT Scan',
  'mri': 'MRI'
};

const Timeline = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletedReports, setDeletedReports] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  useEffect(() => {
    // Load deleted reports from localStorage
    const stored = localStorage.getItem('deletedReports');
    if (stored) {
      setDeletedReports(JSON.parse(stored));
    }
    loadCombinedHistory();
  }, []);

  const loadCombinedHistory = async () => {
    try {
      // Load report history
      const reportResponse = await timelineService.getTimeline();
      const reportEntries = reportResponse.data.data || reportResponse.data || [];

      // Load scan analysis history
      const token = localStorage.getItem('token');
      const scanResponse = await axios.get('http://localhost:5000/api/image-analysis/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const scanEntries = (scanResponse.data.analyses || []).map(scan => ({
        ...scan,
        type: 'scan',
        imageTypeName: imageTypeLabels[scan.imageType] || scan.imageType,
        condition: imageTypeLabels[scan.imageType] || scan.imageType
      }));

      // Combine and sort by date
      const combined = [...reportEntries, ...scanEntries].sort((a, b) => 
        new Date(b.visitDate || b.createdAt) - new Date(a.visitDate || a.createdAt)
      );

      setEntries(combined);
      setError('');
    } catch (err) {
      console.error('Error loading history:', err);
      setError('Failed to load history.');
    } finally {
      setLoading(false);
    }
  };

  const deleteScanAnalysis = async (scanId) => {
    setDeleteItem({ id: scanId, type: 'scan' });
    setShowConfirm(true);
  };

  const deleteReport = (reportId) => {
    setDeleteItem({ id: reportId, type: 'report' });
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;

    try {
      if (deleteItem.type === 'scan') {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/image-analysis/${deleteItem.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        // For reports, just store in localStorage
        const deleted = [...deletedReports, deleteItem.id];
        setDeletedReports(deleted);
        localStorage.setItem('deletedReports', JSON.stringify(deleted));
      }

      // Remove from entries
      setEntries(entries.filter(entry => entry._id !== deleteItem.id && entry.reportId !== deleteItem.id));
      setShowConfirm(false);
      setDeleteItem(null);
    } catch (err) {
      console.error('Error deleting item:', err);
      alert('Failed to delete item');
      setShowConfirm(false);
      setDeleteItem(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-dk) 100%)', padding: '2rem 1.5rem' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>Medical History</h1>
          <p style={{ margin: '0.3rem 0 0', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
            Chronological record of your visits and conditions
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1.5rem' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem' }} />
            Loading history…
          </div>
        )}

        {!loading && error && (
          <div style={{ background: 'var(--color-danger-lt)', color: 'var(--color-danger)', borderRadius: 8, padding: '0.75rem 1rem', fontSize: '0.875rem' }}>{error}</div>
        )}

        {!loading && !error && entries.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-card)', border: '2px dashed var(--color-border)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🕐</div>
            <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '0.9rem' }}>
              No history yet. Upload your first report or scan to start building your timeline.
            </p>
          </div>
        )}

        {!loading && !error && entries.length > 0 && (
          <div style={{ position: 'relative' }}>
            {/* Vertical line */}
            <div style={{ position: 'absolute', left: 52, top: 8, bottom: 8, width: 2, background: 'linear-gradient(to bottom, var(--color-accent), var(--color-border))', borderRadius: 1 }} />

            {entries.map((entry, i) => (
              <div key={entry.reportId || entry._id || i} style={{ display: 'flex', gap: '1.25rem', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
                {/* Date column */}
                <div style={{ flexShrink: 0, width: 56, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: 52, background: 'var(--color-surface)', border: '2px solid var(--color-accent)',
                    borderRadius: 10, padding: '4px 0', textAlign: 'center',
                    boxShadow: '0 2px 8px rgba(43,122,142,0.2)',
                  }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-accent)', letterSpacing: '0.05em' }}>
                      {fmtMonth(entry.visitDate || entry.createdAt)}
                    </div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.1 }}>
                      {fmtDay(entry.visitDate || entry.createdAt)}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                      {fmtYear(entry.visitDate || entry.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Content card */}
                <div style={{
                  flex: 1, background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-card)', padding: '1rem 1.25rem',
                  transition: 'all 0.18s ease',
                }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.borderColor = 'var(--color-accent)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-card)'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                >
                  {/* Scan Analysis Entry */}
                  {entry.type === 'scan' ? (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)' }}>
                          {entry.imageTypeName}
                        </div>
                        <span style={{
                          fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                          background: entry.riskLevel === 'Low' || entry.riskLevel === 'Normal' ? '#d1fae5' : entry.riskLevel === 'Medium' ? '#fef3c7' : '#fee2e2',
                          color: entry.riskLevel === 'Low' || entry.riskLevel === 'Normal' ? '#065f46' : entry.riskLevel === 'Medium' ? '#92400e' : '#991b1b',
                        }}>
                          {entry.riskLevel} Risk
                        </span>
                      </div>
                      
                      <div style={{ marginTop: '0.5rem', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                        <strong>Prediction:</strong> {entry.prediction}
                      </div>
                      
                      <div style={{ marginTop: '0.3rem', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                        <strong>Confidence:</strong> {entry.confidence ? `${(entry.confidence * 100).toFixed(1)}%` : 'N/A'}
                      </div>

                      {entry.findings && entry.findings.length > 0 && (
                        <div style={{ marginTop: '0.5rem', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                          <strong>Findings:</strong> {entry.findings.slice(0, 2).join(', ')}
                          {entry.findings.length > 2 && ` +${entry.findings.length - 2} more`}
                        </div>
                      )}

                      {entry.recommendation && (
                        <p style={{ margin: '0.5rem 0 0', fontSize: '0.82rem', color: 'var(--color-text-muted)', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          <strong>Recommendation:</strong> {entry.recommendation}
                        </p>
                      )}

                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.75rem' }}>
                        <Link to={`/scan/${entry._id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--color-accent)', fontWeight: 600, textDecoration: 'none' }}
                          onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                          onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
                          View analysis details →
                        </Link>
                        <button
                          onClick={() => deleteScanAnalysis(entry._id)}
                          style={{
                            fontSize: '0.8rem',
                            padding: '4px 12px',
                            borderRadius: '4px',
                            border: '1px solid #dc3545',
                            background: 'transparent',
                            color: '#dc3545',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.18s ease'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = '#fee2e2';
                            e.currentTarget.style.borderColor = '#c82333';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.borderColor = '#dc3545';
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Report Entry */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)' }}>
                          {entry.condition || 'General Checkup'}
                        </div>
                        {entry.clinicalAnalysis?.risk_indicator?.attention_level && (
                          <span style={{
                            fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                            background: { High: '#fee2e2', Moderate: '#fef3c7', Low: '#d1fae5' }[entry.clinicalAnalysis.risk_indicator.attention_level] || '#f1f5f9',
                            color: { High: '#991b1b', Moderate: '#92400e', Low: '#065f46' }[entry.clinicalAnalysis.risk_indicator.attention_level] || '#64748b',
                          }}>
                            {entry.clinicalAnalysis.risk_indicator.attention_level} Risk
                          </span>
                        )}
                      </div>

                      {entry.medications?.length > 0 && (
                        <div style={{ marginTop: '0.4rem', fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                          <span>💊</span>
                          {entry.medications.slice(0, 4).map((m, j) => (
                            <span key={j} style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '1px 7px', fontSize: '0.72rem' }}>{m}</span>
                          ))}
                          {entry.medications.length > 4 && <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>+{entry.medications.length - 4} more</span>}
                        </div>
                      )}

                      {entry.summary && (
                        <p style={{ margin: '0.5rem 0 0', fontSize: '0.82rem', color: 'var(--color-text-muted)', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {entry.summary}
                        </p>
                      )}

                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.75rem' }}>
                        {entry.reportId && (
                          <Link to={`/report/${entry.reportId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--color-accent)', fontWeight: 600, textDecoration: 'none' }}
                          onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                          onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
                            View full report →
                          </Link>
                        )}
                        <button
                          onClick={() => deleteReport(entry.reportId)}
                          style={{
                            fontSize: '0.8rem',
                            padding: '4px 12px',
                            borderRadius: '4px',
                            border: '1px solid #dc3545',
                            background: 'transparent',
                            color: '#dc3545',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.18s ease'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = '#fee2e2';
                            e.currentTarget.style.borderColor = '#c82333';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.borderColor = '#dc3545';
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {deleteItem?.type === 'scan' 
            ? 'Are you sure you want to delete this scan analysis? You can restore it from Profile → Deleted History.'
            : 'Are you sure you want to delete this report? You can view it in Profile → Deleted Reports.'
          }
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Timeline;
