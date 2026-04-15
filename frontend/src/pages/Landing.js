import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      {/* Navigation */}
      <nav style={{ background: 'rgba(255,255,255,0.95)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-accent)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ background: 'var(--color-accent)', color: 'white', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>M</div>
            MedExplain
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/login" style={{ padding: '0.6rem 1.4rem', background: 'transparent', border: '2px solid var(--color-accent)', borderRadius: '8px', color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s' }}>Sign In</Link>
            <Link to="/register" style={{ padding: '0.6rem 1.4rem', background: 'var(--color-accent)', color: 'white', border: 'none', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s' }}>Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '6rem 2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
          Your Medical Records, Simplified
        </h1>
        <p style={{ fontSize: '1.3rem', color: 'var(--color-text-muted)', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
          Secure, intelligent healthcare record management powered by AI. Access your medical history anytime, anywhere.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/register')} style={{ padding: '1rem 2rem', background: 'var(--color-accent)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 4px 12px rgba(52, 152, 219, 0.3)' }}>Start Free</button>
          <button onClick={() => navigate('/login')} style={{ padding: '1rem 2rem', background: 'white', color: 'var(--color-accent)', border: '2px solid var(--color-accent)', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s' }}>Sign In</button>
        </div>
      </div>

      {/* Features */}
      <div style={{ background: 'rgba(255,255,255,0.6)', padding: '4rem 2rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 700, textAlign: 'center', marginBottom: '3rem', color: 'var(--color-text)' }}>Why Choose MedExplain?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {[
              { icon: '🔒', title: 'Secure & Private', desc: 'Enterprise-grade encryption protects your sensitive health data' },
              { icon: '🤖', title: 'AI-Powered Analysis', desc: 'Intelligent insights extracted from your medical documents' },
              { icon: '📱', title: 'Anytime Access', desc: 'View your records on any device, from anywhere in the world' },
              { icon: '👨‍⚕️', title: 'Doctor Integration', desc: 'Share records securely with healthcare providers' },
              { icon: '⚡', title: 'Quick Upload', desc: 'Upload and process reports in seconds' },
              { icon: '📊', title: 'Complete Timeline', desc: 'Visual timeline of your complete health journey' }
            ].map((item, idx) => (
              <div key={idx} style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.07)', transition: 'all 0.3s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'} onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.07)'}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{item.icon}</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-text)' }}>{item.title}</h3>
                <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div style={{ padding: '4rem 2rem', maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 700, textAlign: 'center', marginBottom: '3rem', color: 'var(--color-text)' }}>How It Works</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
          {[
            { num: 1, title: 'Upload Reports', desc: 'Upload your medical reports in any format' },
            { num: 2, title: 'AI Analysis', desc: 'Our AI extracts key information automatically' },
            { num: 3, title: 'Access Anywhere', desc: 'View organized records anytime, on any device' }
          ].map((step, idx) => (
            <div key={idx} style={{ textAlign: 'center' }}>
              <div style={{ width: 60, height: 60, background: 'var(--color-accent)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, margin: '0 auto 1rem' }}>{step.num}</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-text)' }}>{step.title}</h3>
              <p style={{ color: 'var(--color-text-muted)' }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div style={{ background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-dk) 100%)', padding: '4rem 2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'white', marginBottom: '1rem' }}>Ready to Take Control of Your Health?</h2>
        <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.9)', marginBottom: '2rem' }}>Join thousands of users managing their medical records securely with MedExplain</p>
        <button onClick={() => navigate('/register')} style={{ padding: '1rem 2.5rem', background: 'white', color: 'var(--color-accent)', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.3s' }}>Create Account Now</button>
      </div>

      {/* Footer */}
      <footer style={{ background: 'rgba(0,0,0,0.05)', padding: '3rem 2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <a href="#" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', transition: 'color 0.3s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--color-accent)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}>About</a>
            <a href="#" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', transition: 'color 0.3s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--color-accent)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}>Privacy</a>
            <a href="#" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', transition: 'color 0.3s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--color-accent)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}>Terms</a>
            <a href="#" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', transition: 'color 0.3s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--color-accent)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}>Contact</a>
          </div>
        </div>
        <p style={{ margin: 0 }}>&copy; 2024 MedExplain. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;
