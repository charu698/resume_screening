import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);

  const colors = {
    tealDark: '#006D6D',
    white: 'white',
    teal: '#008080',
  };

  const closeButtonStyle = {
    position: 'absolute',
    top: '8px',
    right: '12px',
    background: 'transparent',
    border: 'none',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#666',
    cursor: 'pointer',
  };

  const modalStyle = {
    position: 'absolute',
    top: '60px',
    right: '30px',
    backgroundColor: 'white',
    color: '#333',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 0 20px rgba(0, 0, 0, 0.3)',
    zIndex: 1100,
    maxWidth: '250px',
    fontSize: '14px',
    lineHeight: '1.6',
  };

  const linkStyle = {
    color: 'white',
    textDecoration: 'none',
    fontSize: '18px',
    fontWeight: 'bold',
    padding: '6px 12px',
    borderRadius: '5px',
    cursor: 'pointer',
    background: 'transparent',
    border: 'none',
  };

  return (
    <div>
      {/* Header */}
      <header style={{
        backgroundColor: colors.teal,
        padding: '10px',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ textAlign: 'left' }}>
          <h1 style={{ margin: 0, fontSize: '2.5rem' }}>RecruitIQ</h1>
          <h2 style={{ margin: '5px 0 0', fontWeight: 'normal' }}>Resume Evaluation Results</h2>
        </div>
        <nav style={{ display: 'flex', gap: '40px' }}>
          <span onClick={() => navigate('/home')} style={linkStyle}>Home</span>
          <button onClick={() => setShowProfile(true)} style={linkStyle}>Profile</button>
          <button onClick={() => navigate('/')} style={linkStyle}>Logout</button>
        </nav>
      </header>

      {/* Profile Modal */}
      {showProfile && (
        <div style={modalStyle}>
          <button style={closeButtonStyle} onClick={() => setShowProfile(false)}>×</button>
          <strong>Profile</strong>
          <p><strong>Name:</strong> NAME</p>
          <p><strong>Post:</strong> HR</p>
          <p><strong>Email:</strong> name@gmail.com</p>
        </div>
      )}

      {/* Main content placeholder */}
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Header;
