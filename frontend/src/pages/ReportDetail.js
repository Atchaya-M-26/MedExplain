import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reportService, timelineService } from '../services/api';
import Chatbot from '../components/Chatbot';

const card = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-card)',
  boxShadow: 'var(--shadow-card)',
  padding: '1.25rem 1.5rem',
  marginBottom: '1rem',
};

const sectionLabel = {
  fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
  letterSpacing: '0.06em', color: 'var(--color-text-muted)', marginBottom: '0.5rem',
};

const pill = (bg, color) => ({
  display: 'inline-block', padding: '2px 10px', borderRadius: 12,
  fontSize: '0.72rem', fontWeight: 600, background: bg, color,
  marginRight: 4, marginBottom: 4,
});

const Spinner = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
    <div style={{ width: 36, height: 36, border: '4px solid var(--color-border)', borderTopColor: 'var(--color-accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '0.75rem' }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    Processing report…
  </div>
);

const AbnormalBadge = ({ isAbnormal }) =>
  isAbnormal
    ? <span style={pill('#fde8e8', '#9b1c1c')}>Abnormal</span>
    : <span style={pill('#def7ec', '#03543f')}>Normal</span>;

const TABS = ['Summary', 'Details', 'Insights', 'Trends', 'Follow-up', 'Case Sheet', 'Doctor View'];

const TabBar = ({ active, onChange }) => (
  <div style={{ display: 'flex', borderBottom: '2px solid var(--color-border)', marginBottom: '1.5rem', overflowX: 'auto' }}>
    {TABS.map(tab => (
      <button key={tab} onClick={() => onChange(tab)} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        padding: '0.55rem 1.1rem', fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap',
        color: active === tab ? 'var(--color-accent)' : 'var(--color-text-muted)',
        borderBottom: active === tab ? '2px solid var(--color-accent)' : '2px solid transparent',
        marginBottom: '-2px', transition: 'color 0.2s',
      }}>{tab}</button>
    ))}
  </div>
);

const SummaryTab = ({ ca, summary }) => {
  const s = ca?.structured_data;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={card}>
        <div style={sectionLabel}>Clinical Summary</div>
        <p style={{ margin: 0, lineHeight: 1.75, color: 'var(--color-text)' }}>
          {ca?.summary || summary || 'No summary available.'}
        </p>
      </div>
      {s?.condition && (
        <div style={card}>
          <div style={sectionLabel}>Condition / Diagnosis</div>
          <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-text)', fontSize: '1rem' }}>{s.condition}</p>
        </div>
      )}
      {ca?.emergency_summary && (
        <div style={{ ...card, borderLeft: '4px solid #e53e3e' }}>
          <div style={{ ...sectionLabel, color: '#c53030' }}>Critical Information</div>
          {ca.emergency_summary.critical_conditions?.length > 0 && (
            <div style={{ marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Abnormal values: </span>
              {ca.emergency_summary.critical_conditions.map((c, i) => <span key={i} style={pill('#fde8e8', '#9b1c1c')}>{c}</span>)}
            </div>
          )}
          {ca.emergency_summary.allergies?.length > 0 && (
            <div style={{ marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Allergies: </span>
              {ca.emergency_summary.allergies.map((a, i) => <span key={i} style={pill('#fef3c7', '#92400e')}>{a}</span>)}
            </div>
          )}
          {ca.emergency_summary.ongoing_medications?.length > 0 && (
            <div>
              <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Ongoing medications: </span>
              {ca.emergency_summary.ongoing_medications.map((m, i) => <span key={i} style={pill('#e8f4f8', '#2c7a7b')}>{m}</span>)}
            </div>
          )}
          {!ca.emergency_summary.critical_conditions?.length && !ca.emergency_summary.allergies?.length && !ca.emergency_summary.ongoing_medications?.length && (
            <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>No critical information recorded.</p>
          )}
        </div>
      )}
    </div>
  );
};

const DetailsTab = ({ ca, data }) => {
  const s = ca?.structured_data;
  const medications = s?.medications || data?.medications || [];
  const dosage = data?.dosage || [];
  const testResults = data?.testResults || [];
  const tests = s?.tests || [];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={card}>
        <div style={sectionLabel}>Medications</div>
        {medications.length === 0 ? (
          <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>None listed.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: 'var(--color-bg)' }}>
                {['Medication', 'Dosage'].map(h => (
                  <th key={h} style={{ padding: '0.4rem 0.75rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {medications.map((med, i) => {
                const name = typeof med === 'object' ? med.name : med;
                const dose = typeof med === 'object' ? med.dosage : (dosage[i] || '—');
                return (
                  <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '0.45rem 0.75rem', color: 'var(--color-text)', fontWeight: 500 }}>{name}</td>
                    <td style={{ padding: '0.45rem 0.75rem', color: 'var(--color-text-muted)' }}>{dose || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      {tests.length > 0 && (
        <div style={card}>
          <div style={sectionLabel}>Tests Ordered</div>
          <div>{tests.map((t, i) => <span key={i} style={pill('#e8f4f8', '#2c7a7b')}>{t}</span>)}</div>
        </div>
      )}
      <div style={card}>
        <div style={sectionLabel}>Test Results</div>
        {testResults.length === 0 ? (
          <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>No numeric results available.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'var(--color-bg)' }}>
                  {['Parameter', 'Value', 'Unit', 'Status'].map(h => (
                    <th key={h} style={{ padding: '0.4rem 0.75rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {testResults.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--color-border)', background: row.isAbnormal ? '#fff8f8' : 'transparent' }}>
                    <td style={{ padding: '0.45rem 0.75rem', color: 'var(--color-text)', fontWeight: 500 }}>{row.parameter || '—'}</td>
                    <td style={{ padding: '0.45rem 0.75rem', color: 'var(--color-text)' }}>{row.value ?? '—'}</td>
                    <td style={{ padding: '0.45rem 0.75rem', color: 'var(--color-text-muted)' }}>{row.unit || '—'}</td>
                    <td style={{ padding: '0.45rem 0.75rem' }}><AbnormalBadge isAbnormal={row.isAbnormal} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const InsightsTab = ({ ca, data }) => {
  const ma = ca?.medication_analysis;
  const te = ca?.treatment_effectiveness;
  const insights = data?.insights || [];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {ma && (
        <div style={card}>
          <div style={sectionLabel}>Medication Review</div>
          {ma.duplicate_medications?.length > 0 && (
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Repeated medications:</div>
              {ma.duplicate_medications.map((d, i) => (
                <div key={i} style={{ borderLeft: '3px solid #d69e2e', background: '#fffbeb', borderRadius: '0 6px 6px 0', padding: '0.5rem 0.75rem', marginBottom: '0.4rem', fontSize: '0.875rem', color: 'var(--color-text)' }}>
                  {d} has appeared in a previous report.
                </div>
              ))}
            </div>
          )}
          {ma.potential_conflicts?.length > 0 && (
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Items to review with clinician:</div>
              {ma.potential_conflicts.map((c, i) => (
                <div key={i} style={{ borderLeft: '3px solid #e53e3e', background: '#fff5f5', borderRadius: '0 6px 6px 0', padding: '0.5rem 0.75rem', marginBottom: '0.4rem', fontSize: '0.875rem', color: 'var(--color-text)' }}>
                  {c}
                </div>
              ))}
            </div>
          )}
          {!ma.duplicate_medications?.length && !ma.potential_conflicts?.length && (
            <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>No medication issues detected.</p>
          )}
          {ma.notes && <p style={{ margin: '0.5rem 0 0', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>{ma.notes}</p>}
        </div>
      )}
      {te && (
        <div style={card}>
          <div style={sectionLabel}>Treatment History</div>
          <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: 'var(--color-text)', lineHeight: 1.6 }}>{te.effectiveness_summary}</p>
          {te.ineffective_treatments?.length > 0 && (
            <div>
              <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Conditions with repeated visits:</div>
              {te.ineffective_treatments.map((t, i) => <span key={i} style={pill('#fef3c7', '#92400e')}>{t}</span>)}
            </div>
          )}
        </div>
      )}
      {!ma && !te && insights.length > 0 && (
        <div style={card}>
          <div style={sectionLabel}>Notes</div>
          {insights.map((ins, i) => {
            const msg = typeof ins === 'string' ? ins : ins.message || '';
            return (
              <div key={i} style={{ borderLeft: '3px solid #d69e2e', background: '#fffbeb', borderRadius: '0 6px 6px 0', padding: '0.5rem 0.75rem', marginBottom: '0.4rem', fontSize: '0.875rem', color: 'var(--color-text)' }}>
                {msg}
              </div>
            );
          })}
        </div>
      )}
      {!ma && !te && insights.length === 0 && (
        <p style={{ color: 'var(--color-text-muted)' }}>No insights available.</p>
      )}
    </div>
  );
};

const TrendsTab = ({ ca }) => {
  const ht = ca?.health_trends;
  if (!ht) return (
    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
      <p style={{ margin: 0 }}>Trend analysis requires at least 2 uploaded reports to compare values over time.</p>
    </div>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={card}>
        <div style={sectionLabel}>Health Trends</div>
        <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: 'var(--color-text)', lineHeight: 1.6 }}>{ht.short_summary}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
          {[
            { label: 'Increasing', items: ht.increasing_metrics, color: '#e53e3e', bg: '#fff5f5', icon: '↑' },
            { label: 'Decreasing', items: ht.decreasing_metrics, color: '#2f855a', bg: '#f0fff4', icon: '↓' },
            { label: 'Stable',     items: ht.stable_metrics,     color: '#2b6cb0', bg: '#ebf8ff', icon: '→' },
          ].map(({ label, items, color, bg, icon }) => (
            <div key={label} style={{ background: bg, border: `1px solid ${color}33`, borderRadius: 8, padding: '0.75rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color, marginBottom: '0.4rem' }}>{icon} {label}</div>
              {items?.length > 0
                ? items.map((m, i) => <div key={i} style={{ fontSize: '0.82rem', color: 'var(--color-text)' }}>{m}</div>)
                : <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>None</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const FollowUpTab = ({ ca, data }) => {
  const fu = ca?.follow_up;
  const te = ca?.treatment_effectiveness;

  // Derive a fallback follow-up from test results if clinicalAnalysis not yet available
  const abnormalCount = data?.testResults?.filter(r => r.isAbnormal)?.length || 0;
  const fallbackRec = abnormalCount >= 3
    ? 'Review in 3–5 days.'
    : abnormalCount >= 1
    ? 'Review in 7–14 days.'
    : 'Routine follow-up in 3 months.';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ ...card, borderLeft: '4px solid var(--color-accent)' }}>
        <div style={sectionLabel}>Follow-up Recommendation</div>
        <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--color-accent)' }}>
          {fu?.recommendation || fallbackRec}
        </p>
        {abnormalCount > 0 && (
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
            Based on {abnormalCount} value(s) outside reference range.
          </p>
        )}
      </div>
      {te?.effectiveness_summary && (
        <div style={card}>
          <div style={sectionLabel}>Treatment Notes</div>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text)', lineHeight: 1.6 }}>{te.effectiveness_summary}</p>
        </div>
      )}
      {!fu && !te && (
        <div style={{ ...card, background: 'var(--color-accent-lt)' }}>
          <div style={sectionLabel}>Note</div>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            Detailed follow-up analysis is generated after report processing completes. Re-upload the report if this persists.
          </p>
        </div>
      )}
    </div>
  );
};

const CaseSheetTab = ({ ca }) => {
  const cs = ca?.case_sheet;
  const td = ca?.treatment_duration;
  const stm = ca?.symptom_treatment_mapping;
  const exp = ca?.expense_estimate;
  const pq = ca?.patient_questions;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {cs?.case_summary && (
        <div style={card}>
          <div style={sectionLabel}>Case Summary</div>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text)', lineHeight: 1.75 }}>{cs.case_summary}</p>
        </div>
      )}
      {td?.duration_summary && (
        <div style={card}>
          <div style={sectionLabel}>Treatment Duration</div>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text)' }}>{td.duration_summary}</p>
        </div>
      )}
      {stm?.mappings?.length > 0 && (
        <div style={card}>
          <div style={sectionLabel}>Symptom — Treatment Mapping</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: 'var(--color-bg)' }}>
                {['Symptom', 'Expected Treatment', 'Prescribed'].map(h => (
                  <th key={h} style={{ padding: '0.4rem 0.6rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stm.mappings.map((m, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '0.4rem 0.6rem', color: 'var(--color-text)' }}>{m.symptom}</td>
                  <td style={{ padding: '0.4rem 0.6rem', color: 'var(--color-text-muted)' }}>{m.suggested_treatment}</td>
                  <td style={{ padding: '0.4rem 0.6rem', color: 'var(--color-accent)', fontWeight: 500 }}>{m.prescribed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {exp?.estimated_cost_summary && (
        <div style={{ ...card, borderLeft: '4px solid #d69e2e' }}>
          <div style={sectionLabel}>Expense Estimate</div>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text)' }}>{exp.estimated_cost_summary}</p>
        </div>
      )}
      {pq?.suggested_questions?.length > 0 && (
        <div style={card}>
          <div style={sectionLabel}>Questions to Ask Your Doctor</div>
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            {pq.suggested_questions.map((q, i) => (
              <li key={i} style={{ fontSize: '0.875rem', color: 'var(--color-text)', marginBottom: '0.35rem' }}>{q}</li>
            ))}
          </ul>
        </div>
      )}
      {!cs && !td && !exp && <p style={{ color: 'var(--color-text-muted)' }}>Case sheet data not yet available.</p>}
    </div>
  );
};

const DoctorViewTab = ({ ca }) => {
  const ds = ca?.doctor_decision_snapshot;
  const pr = ca?.patient_reliability;
  const ri = ca?.risk_indicator;
  const hp = ca?.hospital_visit_pattern;
  const vg = ca?.visit_grouping;
  const hpf = ca?.health_profile;
  const riskColor = { High: '#e53e3e', Moderate: '#d69e2e', Low: '#38a169' };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {ri && (
        <div style={{ ...card, borderLeft: `4px solid ${riskColor[ri.attention_level] || '#718096'}` }}>
          <div style={sectionLabel}>Risk Indicator</div>
          <span style={{ display: 'inline-block', padding: '3px 12px', borderRadius: 10, fontSize: '0.82rem', fontWeight: 700, background: `${riskColor[ri.attention_level]}22`, color: riskColor[ri.attention_level] || '#718096' }}>
            {ri.attention_level} Attention
          </span>
        </div>
      )}
      {ds && (
        <div style={card}>
          <div style={sectionLabel}>Decision Snapshot</div>
          <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: 'var(--color-text)' }}><strong>Pattern:</strong> {ds.recent_pattern}</p>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text)' }}><strong>Note:</strong> {ds.quick_note}</p>
        </div>
      )}
      {pr && (
        <div style={card}>
          <div style={sectionLabel}>Patient Reliability</div>
          <div style={{ marginBottom: '0.4rem' }}>
            <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 10, fontSize: '0.75rem', fontWeight: 600, background: pr.reliability_level === 'Good' ? '#def7ec' : pr.reliability_level === 'Moderate' ? '#fef3c7' : '#fde8e8', color: pr.reliability_level === 'Good' ? '#03543f' : pr.reliability_level === 'Moderate' ? '#92400e' : '#9b1c1c' }}>
              {pr.reliability_level}
            </span>
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            {pr.reasons?.map((r, i) => <li key={i} style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>{r}</li>)}
          </ul>
        </div>
      )}
      {hp && (
        <div style={card}>
          <div style={sectionLabel}>Visit Pattern</div>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text)' }}>{hp.hospital_pattern_summary}</p>
        </div>
      )}
      {hpf && (
        <div style={card}>
          <div style={sectionLabel}>Health Profile</div>
          {hpf.frequent_conditions?.length > 0 && (
            <div style={{ marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Frequent conditions: </span>
              {hpf.frequent_conditions.map((c, i) => <span key={i} style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 8, fontSize: '0.72rem', background: '#e8f4f8', color: '#2c7a7b', marginRight: 4 }}>{c}</span>)}
            </div>
          )}
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>{hpf.recurring_patterns}</p>
        </div>
      )}
      {vg?.grouped_visits?.length > 0 && (
        <div style={card}>
          <div style={sectionLabel}>Visit Groups</div>
          {vg.grouped_visits.map((g, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: i < vg.grouped_visits.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--color-text)' }}>{g.condition}</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-accent)' }}>{g.visit_count} visit{g.visit_count > 1 ? 's' : ''}</span>
            </div>
          ))}
        </div>
      )}
      {!ds && !pr && !ri && <p style={{ color: 'var(--color-text-muted)' }}>Doctor view data not yet available.</p>}
    </div>
  );
};

const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Summary');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [reportRes, timelineRes] = await Promise.all([
          reportService.getReport(id),
          timelineService.getTimeline(),
        ]);
        setReport(reportRes.data.data || reportRes.data);
        const timeline = timelineRes.data.data || timelineRes.data || [];
        const entry = timeline.find(t => String(t.reportId) === id || String(t.reportId?._id) === id);
        if (entry) setExtractedData(entry);
      } catch {
        setError('Failed to load report.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this report? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await reportService.deleteReport(id);
      navigate('/dashboard');
    } catch {
      setError('Failed to delete report.');
      setDeleting(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spinner />
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', padding: '2rem' }}>
      <div style={{ background: '#fde8e8', color: '#9b1c1c', border: '1px solid #f5c6cb', borderRadius: 8, padding: '0.75rem 1rem' }}>{error}</div>
      <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/dashboard')}>← Back</button>
    </div>
  );

  const fileName = report?.fileName || '';
  const originalName = report?.originalName || fileName || 'Report';
  const fileType = report?.fileType || (fileName.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image');
  const fileUrl = `${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}/uploads/${fileName}`;
  const ca = extractedData?.clinicalAnalysis || null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: '1px solid var(--color-border)', borderRadius: 8, cursor: 'pointer', padding: '0.45rem 1rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          ← Back
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{originalName}</span>
          <button onClick={handleDelete} disabled={deleting} style={{ background: 'none', border: '1px solid #f5c6cb', borderRadius: 8, cursor: deleting ? 'not-allowed' : 'pointer', padding: '0.45rem 0.9rem', fontSize: '0.875rem', color: '#9b1c1c', opacity: deleting ? 0.6 : 1 }}>
            🗑 {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ flex: '0 0 38%', minWidth: 260, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-card)', padding: '1.25rem' }}>
          {fileType === 'pdf' ? (
            <>
              <object data={fileUrl} type="application/pdf" style={{ width: '100%', height: 460, borderRadius: 8, border: '1px solid var(--color-border)' }}>
                <iframe src={fileUrl} title={originalName} style={{ width: '100%', height: 460, border: 'none', borderRadius: 8 }}>
                  <a href={fileUrl} target="_blank" rel="noopener noreferrer">Open PDF</a>
                </iframe>
              </object>
              <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display: 'inline-flex', marginTop: '0.75rem', fontSize: '0.82rem' }}>
                🔗 Open in new tab
              </a>
              <a href={fileUrl} download={originalName} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.75rem', marginLeft: '0.5rem', padding: '0.45rem 0.9rem', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '7px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text)', textDecoration: 'none' }}>
                ⬇ Download
              </a>
            </>
          ) : (
            <>
              <img src={fileUrl} alt={originalName} style={{ width: '100%', maxHeight: 460, objectFit: 'contain', borderRadius: 8, border: '1px solid var(--color-border)' }} />
              <a href={fileUrl} download={originalName} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.75rem', padding: '0.45rem 0.9rem', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '7px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text)', textDecoration: 'none' }}>
                ⬇ Download
              </a>
            </>
          )}
        </div>

        <div style={{ flex: '1 1 55%', minWidth: 300, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-card)', padding: '1.5rem' }}>
          {!extractedData ? <Spinner /> : (
            <>
              <TabBar active={activeTab} onChange={setActiveTab} />
              {activeTab === 'Summary'    && <SummaryTab  ca={ca} summary={extractedData.summary} />}
              {activeTab === 'Details'    && <DetailsTab  ca={ca} data={extractedData} />}
              {activeTab === 'Insights'   && <InsightsTab ca={ca} data={extractedData} />}
              {activeTab === 'Trends'     && <TrendsTab   ca={ca} />}
              {activeTab === 'Follow-up'  && <FollowUpTab ca={ca} data={extractedData} />}
              {activeTab === 'Case Sheet' && <CaseSheetTab ca={ca} />}
              {activeTab === 'Doctor View' && <DoctorViewTab ca={ca} />}
            </>
          )}
        </div>
      </div>

      {/* Chatbot section */}
      {extractedData && (
        <div style={{ marginTop: '1.5rem', height: 520 }}>
          <Chatbot reportId={id} extractedData={extractedData} />
        </div>
      )}
    </div>
  );
};

export default ReportDetail;
