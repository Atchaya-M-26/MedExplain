import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { qrService } from '../services/api';

const QRShare = () => {
  const { user, userRole } = useContext(AuthContext);
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (userRole !== 'patient') {
      setLoading(false);
      return;
    }

    const fetchQR = async () => {
      try {
        const response = await qrService.getQR(user.patientId);
        setQrData(response.data);
      } catch (err) {
        setError('Failed to load QR code. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.patientId) {
      fetchQR();
    } else {
      setError('Patient ID not found.');
      setLoading(false);
    }
  }, [user, userRole]);

  const handleCopy = () => {
    if (!qrData?.url) return;
    navigator.clipboard.writeText(qrData.url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Doctor guard
  if (userRole === 'doctor') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-card)',
          padding: '2.5rem 3rem',
          textAlign: 'center',
          maxWidth: '400px',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🩺</div>
          <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '0.95rem' }}>
            QR sharing is for patients only
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card)',
        boxShadow: 'var(--shadow-card)',
        padding: '2.5rem 2rem',
        textAlign: 'center',
        maxWidth: '360px',
        width: '100%',
      }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 0.5rem 0' }}>
          Share with your doctor
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', margin: '0 0 1.25rem 0' }}>
          Your doctor can scan this QR or enter your Patient ID to view your medical history
        </p>

        {/* Patient ID badge — always visible */}
        {user?.patientId && (
          <div style={{
            background: 'var(--color-accent-lt)',
            border: '1px solid var(--color-accent)',
            borderRadius: '10px',
            padding: '0.6rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'inline-block',
          }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>Your Patient ID</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text)', letterSpacing: '0.08em' }}>{user.patientId}</div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ padding: '3rem 0', color: 'var(--color-text-muted)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
            Loading QR code…
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div style={{
            background: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb',
            borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.875rem',
          }}>
            {error}
          </div>
        )}

        {/* QR Code */}
        {!loading && !error && qrData && (
          <>
            <div style={{
              display: 'inline-block',
              padding: '1rem',
              background: '#ffffff',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              marginBottom: '1.5rem',
            }}>
              <img
                src={qrData.qr}
                alt="QR code for sharing medical history"
                width={200}
                height={200}
                style={{ display: 'block' }}
              />
            </div>

            <div>
              <button
                onClick={handleCopy}
                style={{
                  background: copied ? '#28a745' : 'var(--color-accent)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.6rem 1.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  minWidth: '130px',
                }}
              >
                {copied ? 'Copied!' : 'Copy link'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default QRShare;
