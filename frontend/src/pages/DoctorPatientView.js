import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorService } from '../services/api';

const STATUS_STYLES = {
  pending:    { background: '#fff3cd', color: '#856404', label: 'Pending' },
  processing: { background: '#cce5ff', color: '#004085', label: 'Processing' },
  completed:  { background: '#d4edda', color: '#155724', label: 'Completed' },
  failed:     { background: '#f8d7da', color: '#721c24', label: 'Failed' },
};

const StatusBadge = ({ status }) => {
  const style = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: '12px',
      fontSize: '0.75rem',
      fontWeight: 600,
      background: style.background,
      color: style.color,
    }}>
      {style.label}
    </span>
  );
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

const DoctorPatientView = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openReports, setOpenReports] = useState({});

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response = await doctorService.getPatient(patientId);
        setData(response.data.data || response.data);
      } catch (err) {
        if (err.response?.status === 404) {
          setError(`No patient found with ID "${patientId}".`);
        } else {
          setError('Failed to load patient data. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [patientId]);

  const toggleReport = (id) => {
    setOpenReports((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        {/* Back button */}
        <button
          onClick={() => navigate('/doctor')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-accent)',
            fontSize: '0.9rem',
            fontWeight: 500,
            padding: '0 0 1.5rem 0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          ← Back to Patient Search
        </button>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
            Loading patient data…
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div style={{
            background: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb',
            borderRadius: '8px', padding: '0.75rem 1rem',
          }}>
            {error}
          </div>
        )}

        {/* Patient data */}
        {!loading && !error && data && (
          <>
            {/* Patient header card */}
            <div style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-card)',
              boxShadow: 'var(--shadow-card)',
              padding: '1.5rem',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
            }}>
              <div style={{ fontSize: '2.5rem' }}>👤</div>
              <div>
                <h1 style={{ margin: '0 0 0.35rem 0', fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text)' }}>
                  {data.name || 'Unknown Patient'}
                </h1>
                <span style={{
                  display: 'inline-block',
                  background: 'var(--color-accent)',
                  color: '#fff',
                  borderRadius: '12px',
                  padding: '2px 12px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  letterSpacing: '0.03em',
                }}>
                  {data.patientId || patientId}
                </span>
              </div>
            </div>

            {/* Timeline section */}
            {data.timeline && data.timeline.length > 0 && (
              <section style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '1.25rem' }}>
                  Medical Timeline
                </h2>
                <div style={{ maxWidth: '680px', position: 'relative' }}>
                  {/* Vertical line */}
                  <div style={{
                    position: 'absolute',
                    left: '90px',
                    top: '20px',
                    bottom: '20px',
                    width: '2px',
                    background: 'var(--color-border)',
                    zIndex: 0,
                  }} />

                  {data.timeline.map((entry, index) => (
                    <div
                      key={entry.reportId || index}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '1.25rem',
                        marginBottom: '1.75rem',
                        position: 'relative',
                        zIndex: 1,
                      }}
                    >
                      {/* Date pill */}
                      <div style={{
                        flexShrink: 0,
                        width: '80px',
                        textAlign: 'center',
                        background: 'var(--color-accent)',
                        color: '#ffffff',
                        borderRadius: '20px',
                        padding: '4px 8px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        lineHeight: 1.4,
                        marginTop: '4px',
                      }}>
                        {formatDate(entry.date)}
                      </div>

                      {/* Dot */}
                      <div style={{
                        flexShrink: 0,
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: 'var(--color-accent)',
                        border: '2px solid var(--color-surface)',
                        marginTop: '8px',
                        boxShadow: '0 0 0 2px var(--color-accent)',
                      }} />

                      {/* Content card */}
                      <div style={{
                        flex: 1,
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-card)',
                        boxShadow: 'var(--shadow-card)',
                        padding: '1rem 1.25rem',
                      }}>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)', marginBottom: '0.35rem' }}>
                          {entry.condition || 'Unknown Condition'}
                        </div>
                        {entry.medications && entry.medications.length > 0 && (
                          <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '0.4rem' }}>
                            💊 {entry.medications.join(', ')}
                          </div>
                        )}
                        {entry.summary && (
                          <div style={{
                            fontSize: '0.875rem',
                            color: 'var(--color-text-muted)',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            lineHeight: 1.5,
                          }}>
                            {entry.summary}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Reports section */}
            <section>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '1rem' }}>
                Reports
              </h2>

              {(!data.reports || data.reports.length === 0) ? (
                <div style={{
                  textAlign: 'center',
                  padding: '2.5rem',
                  background: 'var(--color-surface)',
                  borderRadius: 'var(--radius-card)',
                  border: '1px dashed var(--color-border)',
                  color: 'var(--color-text-muted)',
                }}>
                  No reports on file.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {data.reports.map((report) => (
                    <div
                      key={report._id}
                      style={{
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-card)',
                        boxShadow: 'var(--shadow-card)',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Collapsible header */}
                      <button
                        onClick={() => toggleReport(report._id)}
                        style={{
                          width: '100%',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0.9rem 1.25rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '1rem',
                          textAlign: 'left',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: '1.1rem' }}>📄</span>
                          <span style={{
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            color: 'var(--color-text)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {report.originalName || report.fileName || 'Report'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                          <StatusBadge status={report.status} />
                          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                            {openReports[report._id] ? '▲' : '▼'}
                          </span>
                        </div>
                      </button>

                      {/* Expanded details */}
                      {openReports[report._id] && (
                        <div style={{
                          borderTop: '1px solid var(--color-border)',
                          padding: '0.9rem 1.25rem',
                          fontSize: '0.875rem',
                          color: 'var(--color-text-muted)',
                        }}>
                          <div>🗓 Uploaded: {formatDate(report.uploadDate || report.createdAt)}</div>
                          {report.status === 'completed' && report.summary && (
                            <div style={{ marginTop: '0.5rem', color: 'var(--color-text)', lineHeight: 1.6 }}>
                              {report.summary}
                            </div>
                          )}
                          {report.fileName && (
                            <a
                              href={`${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}/uploads/${report.fileName}`}
                              download={report.originalName || report.fileName}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                marginTop: '0.75rem',
                                padding: '0.4rem 0.9rem',
                                background: 'var(--color-accent)',
                                color: '#fff',
                                borderRadius: '7px',
                                fontSize: '0.82rem',
                                fontWeight: 600,
                                textDecoration: 'none',
                              }}
                            >
                              ⬇ Download
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default DoctorPatientView;
