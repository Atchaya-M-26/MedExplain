import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { AuthContext } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';

const GoogleSignIn = ({ role = 'patient' }) => {
  const navigate = useNavigate();
  const { googleLogin } = useContext(AuthContext);
  const [error, setError] = React.useState('');

  const handleSuccess = async (credentialResponse) => {
    try {
      setError('');
      const decoded = jwtDecode(credentialResponse.credential);
      const { sub: googleId, email, name, picture } = decoded;

      console.log('✅ Google Sign-In successful:', { googleId, email, name, role });

      // Call backend to verify and create/update user with role
      const response = await googleLogin(googleId, email, name, picture, role);
      
      if (response && response.token) {
        console.log('✅ Backend auth successful, redirecting to dashboard...');
        navigate('/dashboard');
      } else {
        setError('Authentication failed. Please try again.');
      }
    } catch (error) {
      console.error('❌ Google Sign-In Error:', error);
      setError(error.response?.data?.error || error.message || 'Authentication failed');
    }
  };

  const handleError = (error) => {
    console.error('❌ Google Login Failed:', error);
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocalhost) {
      setError('Google Sign-In requires localhost to be registered in Google Cloud Console. Use email/password instead.');
    } else {
      setError('Google Sign-In failed. Please try again.');
    }
  };

  return (
    <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
      {error && (
        <div style={{ background: '#fde8e8', color: '#9b1c1c', border: '1px solid #f5c6cb', borderRadius: '8px', padding: '0.65rem 0.9rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Or continue with</span>
        <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
      </div>
      
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        theme="outline"
        size="large"
        locale="en"
      />
    </div>
  );
};

export default GoogleSignIn;
