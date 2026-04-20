import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import GoogleSignIn from '../components/GoogleSignIn';

const inputStyle = {
  width: '100%', padding: '0.65rem 0.9rem',
  border: '1px solid var(--color-border)', borderRadius: '8px',
  fontSize: '0.95rem', color: 'var(--color-text)',
  background: 'var(--color-bg)', outline: 'none',
  boxSizing: 'border-box', fontFamily: 'var(--font-family)',
  transition: 'border-color 0.2s',
};

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'patient' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password, formData.role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-text)' }}>MedExplain</h1>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Clinical Record System</p>
        </div>

        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-card)', padding: '2rem' }}>
          <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text)' }}>Create your account</h2>

          {error && (
            <div style={{ background: '#fde8e8', color: '#9b1c1c', border: '1px solid #f5c6cb', borderRadius: '8px', padding: '0.65rem 0.9rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.35rem' }}>Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Your full name" required autocomplete="name" style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--color-accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--color-border)'} />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.35rem' }}>Email address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required autocomplete="email" style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--color-accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--color-border)'} />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.35rem' }}>Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Min. 6 characters" required minLength={6} autocomplete="new-password" style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--color-accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--color-border)'} />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.5rem' }}>I am a</label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {['patient', 'doctor'].map(role => (
                  <label key={role} style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    padding: '0.6rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500,
                    border: `2px solid ${formData.role === role ? 'var(--color-accent)' : 'var(--color-border)'}`,
                    background: formData.role === role ? 'var(--color-accent-lt)' : 'var(--color-bg)',
                    color: formData.role === role ? 'var(--color-accent)' : 'var(--color-text)',
                    transition: 'all 0.15s',
                  }}>
                    <input type="radio" name="role" value={role} checked={formData.role === role} onChange={handleChange} style={{ display: 'none' }} />
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '0.7rem', fontSize: '0.95rem', justifyContent: 'center' }}>
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <GoogleSignIn role={formData.role} />

          <p style={{ margin: '1.25rem 0 0', textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--color-accent)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
