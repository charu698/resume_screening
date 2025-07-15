import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';


const Footer = () => {
  const [showHelp, setShowHelp] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  

  const colors = {
    tealDark: '#006D6D',
    white: 'white',
    teal: '#008080',
  };

  const modalStyle = {
    position: 'fixed',
    bottom: '80px',
    right: '20px',
    backgroundColor: 'white',
    color: '#333',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 0 20px rgba(0, 0, 0, 0.3)',
    zIndex: 1100,
    maxWidth: '300px',
    fontSize: '14px',
    lineHeight: '1.6',
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
 

  return (
    <div>
      <main>
        <Outlet />
      </main>

      {/* Modals */}
      {showHelp && (
        <div style={modalStyle}>
          <button style={closeButtonStyle} onClick={() => setShowHelp(false)}>×</button>
          <strong>Help & Support</strong>
          <p>If you need assistance, contact us at:</p>
          <p><strong>Email:</strong> support@recruitiq.com</p>
          <p><strong>Phone:</strong> +91-9876543210</p>
        </div>
      )}

      {showAbout && (
        <div style={modalStyle}>
          <button style={closeButtonStyle} onClick={() => setShowAbout(false)}>×</button>
          <strong>About RecruitIQ</strong>
          <p>RecruitIQ helps HR professionals automatically screen and score resumes based on custom queries, saving time and improving hiring accuracy.</p>
        </div>
      )}

     

      {/* Footer */}
      <footer style={{
        position: 'fixed',
        bottom: '10px',
        right: '20px',
        backgroundColor: colors.tealDark,
        color: 'white',
        padding: '12px 20px',
        borderRadius: '12px',
        boxShadow: '0 0 10px rgba(0,0,0,0.2)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '10px',
      }}>
        <div style={{ display: 'flex', gap: '20px' }}>
          <button
            onClick={() => setShowHelp(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Help & Support
          </button>
          <button
            onClick={() => setShowAbout(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            About Us
          </button>
        </div>
        <div style={{ fontSize: '12px', opacity: 0.8 }}>
          © 2025 RecruitIQ. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Footer;
