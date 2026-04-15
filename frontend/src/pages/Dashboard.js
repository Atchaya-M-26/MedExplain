import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportService, timelineService } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import FileUpload from '../components/FileUpload';

const STATUS = {
  pending:    { bg: '#fef3c7', color: '#92400e', dot: '#f59e0b', label: 'Pending' },
  processing: { bg: '#dbeafe', color: '#1e40af', dot: '#3b82f6', label: 'Processing' },
  completed:  { bg: '#d1fae5', color: '#065f46', dot: '#10b981', label: 'Completed' },
  failed:     { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444', label: 'Failed' },
};

const StatusBadge = ({ status }) => {
  const s = STATUS[status] || STATUS.pending;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, background: s.bg, color: s.color }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, display: 'inline-block' }} />
      {s.label}
    </span>
  );
};

const fmt = d => d ? new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const intervalRef = useRef(null);

  const fetchReports = async () => {
    try {
      const [repRes, tlRes] = await Promise.all([
        reportService.getReports(),
        timelineService.getTimeline().catch(() => ({ data: { data: [] } })),
      ]);
      setReports(repRes.data.data || []);
      setTimeline(tlRes.data.data || []);
    } catch { setError('Failed to load reports.'); }
    finally { setLoading(false); }
  };

  const getCondition = id => {
    const e = timeline.find(t => String(t.reportId) === String(id) || String(t.reportId?._id) === String(id));
    return e?.condition || null;
  };

  useEffect(() => { fetchReports(); }, []);

  useEffect(() => {
    const busy = reports.some(r => r.status === 'processing' || r.status === 'pending');
    if (busy) {
      if (!intervalRef.current) intervalRef.current = setInterval(fetchReports, 2000);
    } else {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    }
    return () => { if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; } };
  }, [reports]);

  const handleUpload = r => { setReports(p => [r, ...p]); setShowUpload(false); setTimeout(fetchReports, 1000); };
  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try { await reportService.deleteReport(id); setReports(p => p.filter(r => r._id !== id)); }
    catch { setError('Failed to delete.'); }
  };

  const completed = reports.filter(r => r.status === 'completed').length;
  const pending = reports.filter(r => r.status === 'pending' || r.status === 'processing').length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      {/* Hero banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-dk) 100%)',
        padding: '2rem 1.5rem 3.5rem',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
                Hello, {user?.name?.split(' ')[0] || 'there'} 👋
              </h1>
              <p style={{ margin: '0.35rem 0 0', color: 'rgba(255,255,255,0.75)', fontSize: '0.95rem' }}>
                Your medical records, organised and ready.
              </p>
              {user?.patientId && (
                <span style={{ display: 'inline-block', marginTop: '0.6rem', background: 'rgba(255,255,255,0.2)', color: '#fff', borderRadius: 20, padding: '3px 12px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                  ID: {user.patientId}
                </span>
              )}
            </div>
            <button className="btn-primary" onClick={() => setShowUpload(v => !v)}
              style={{ background: '#fff', color: 'var(--color-accent)', boxShadow: '0 4px 16px rgba(0,0,0,0.15)', fontWeight: 700 }}>
              + Upload Report
            </button>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            {[
              { label: 'Total Reports', value: reports.length, icon: '📋' },
              { label: 'Completed', value: completed, icon: '✅' },
              { label: 'Processing', value: pending, icon: '⏳' },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: '0.6rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '1.1rem' }}>{s.icon}</span>
                <div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: -60, right: 80, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: '-1.5rem auto 0', padding: '0 1.5rem 2rem', position: 'relative', zIndex: 2 }}>
        {/* Upload panel */}
        {showUpload && (
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-lg)', padding: '1.5rem', marginBottom: '1.5rem', maxWidth: 500, animation: 'fadeUp 0.2s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)' }}>Upload Medical Report</h2>
              <button onClick={() => setShowUpload(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--color-text-muted)', lineHeight: 1 }}>✕</button>
            </div>
            <FileUpload onUpload={handleUpload} />
          </div>
        )}

        {error && <div style={{ background: 'var(--color-danger-lt)', color: 'var(--color-danger)', border: '1px solid #fca5a5', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>{error}</div>}

        {loading && (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem' }} />
            Loading your reports…
          </div>
        )}

        {!loading && reports.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-card)', border: '2px dashed var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🗂️</div>
            <h3 style={{ color: 'var(--color-text)', margin: '0 0 0.5rem', fontWeight: 700 }}>No reports yet</h3>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Upload your first medical report to get started.</p>
            <button className="btn-primary" onClick={() => setShowUpload(true)}>+ Upload Report</button>
          </div>
        )}

        {!loading && reports.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {reports.map(report => {
              const condition = getCondition(report._id);
              return (
                <div key={report._id} style={{
                  background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-card)',
                  padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem',
                  transition: 'all 0.18s ease', cursor: 'default',
                }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-card)'; e.currentTarget.style.transform = 'none'; }}
                >
                  {/* Top row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--color-accent-lt)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
                        {report.fileType === 'pdf' ? '📄' : '🖼️'}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>
                          {report.originalName || report.fileName || 'Report'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{fmt(report.uploadDate)}</div>
                      </div>
                    </div>
                    <StatusBadge status={report.status} />
                  </div>

                  {/* Condition */}
                  {condition && (
                    <div style={{ background: 'var(--color-accent-lt)', borderRadius: 8, padding: '0.4rem 0.75rem', fontSize: '0.8rem', color: 'var(--color-accent)', fontWeight: 600 }}>
                      {condition}
                    </div>
                  )}

                  {/* Processing indicator */}
                  {(report.status === 'processing' || report.status === 'pending') && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#1e40af' }}>
                      <div style={{ width: 12, height: 12, border: '2px solid #93c5fd', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
                      Analysing report…
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.25rem' }}>
                    <button className="btn-primary" style={{ flex: 1, fontSize: '0.82rem', padding: '0.45rem 0.75rem' }}
                      onClick={() => navigate(`/report/${report._id}`)}>
                      View Details →
                    </button>
                    <button onClick={e => handleDelete(e, report._id)} title="Delete"
                      style={{ background: 'none', border: '1.5px solid var(--color-border)', borderRadius: 6, cursor: 'pointer', padding: '0.45rem 0.6rem', fontSize: '0.85rem', color: 'var(--color-text-muted)', transition: 'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#fca5a5'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#fff5f5'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.background = 'none'; }}>
                      🗑
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
