import React, { useContext, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Header = () => {
  const { user, isAuthenticated, logout, userRole } = useContext(AuthContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const navLink = ({ isActive }) => ({
    color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)',
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: 500,
    padding: '0.35rem 0.75rem',
    borderRadius: '6px',
    background: isActive ? 'var(--color-accent-lt)' : 'transparent',
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap',
  });

  const avatar = user?.name ? user.name.charAt(0).toUpperCase() : '?';

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 200,
      background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--color-border)',
      boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
    }}>
      <div style={{
        maxWidth: '1200px', margin: '0 auto',
        padding: '0 1.5rem', height: '62px',
        display: 'flex', alignItems: 'center', gap: '1.5rem',
      }}>
        {/* Brand */}
        <NavLink to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-dk) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem', color: '#fff', fontWeight: 700,
          }}>M</div>
          <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
            MedExplain
          </span>
        </NavLink>

        {/* Nav links */}
        {isAuthenticated && (
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flex: 1 }}>
            {userRole === 'patient' && (
              <>
                <NavLink to="/dashboard" style={navLink}>Dashboard</NavLink>
                <NavLink to="/timeline" style={navLink}>History</NavLink>
                <NavLink to="/share" style={navLink}>Share</NavLink>
              </>
            )}
            {userRole === 'doctor' && (
              <NavLink to="/doctor" style={navLink}>Patient Search</NavLink>
            )}
          </nav>
        )}

        {/* Right */}
        {isAuthenticated && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: 'auto', flexShrink: 0 }}>
            {/* Role badge */}
            <span style={{
              fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.06em', padding: '2px 8px', borderRadius: 20,
              background: userRole === 'doctor' ? '#e0f2fe' : 'var(--color-accent-lt)',
              color: userRole === 'doctor' ? '#0369a1' : 'var(--color-accent)',
            }}>
              {userRole}
            </span>

            {/* Avatar + name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--color-accent-mid), var(--color-accent-dk))',
                color: '#fff', fontWeight: 700, fontSize: '0.85rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>{avatar}</div>
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name}
              </span>
            </div>

            <button onClick={handleLogout} style={{
              background: 'none', border: '1.5px solid var(--color-border)',
              borderRadius: '6px', padding: '5px 12px',
              fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-muted)',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#e53e3e'; e.currentTarget.style.color = '#e53e3e'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
