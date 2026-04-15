import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const DoctorDashboard = () => {
  const { userRole } = useContext(AuthContext);
  const navigate = useNavigate();
  const [patientId, setPatientId] = useState('');
  const [error, setError] = useState('');

  // Redirect patients away
  if (userRole && userRole !== 'doctor') {
    navigate('/dashboard');
    return null;
  }

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = patientId.trim();
    if (!trimmed) {
      setError('Please enter a patient ID.');
      return;
    }
    setError('');
    navigate(`/doctor/patient/${encodeURIComponent(trimmed)}`);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: '480px', margin: '4rem auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🩺</div>
          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.6rem', color: 'var(--color-text)', fontWeight: 700 }}>
            Patient Search
          </h1>
          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
            Enter a patient ID to view their medical history
          </p>
        </div>

        {/* Search card */}
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-card)',
          boxShadow: 'var(--shadow-card)',
          padding: '2rem',
        }}>
          <form onSubmit={handleSearch}>
            <label
              htmlFor="patientId"
              style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-text)', fontSize: '0.9rem' }}
            >
              Patient ID
            </label>
            <input
              id="patientId"
              type="text"
              value={patientId}
              onChange={(e) => { setPatientId(e.target.value); setError(''); }}
              placeholder="e.g. MED-00042"
              style={{
                width: '100%',
                padding: '0.65rem 0.9rem',
                border: `1px solid ${error ? '#f5c6cb' : 'var(--color-border)'}`,
                borderRadius: '8px',
                fontSize: '1rem',
                color: 'var(--color-text)',
                background: 'var(--color-bg)',
                outline: 'none',
                boxSizing: 'border-box',
                marginBottom: '0.5rem',
              }}
              autoFocus
            />
            {error && (
              <div style={{ color: '#721c24', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                {error}
              </div>
            )}
            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', marginTop: '0.75rem', padding: '0.65rem', fontSize: '1rem' }}
            >
              Search
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
