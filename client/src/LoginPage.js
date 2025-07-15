// src/LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const colors = {
    tealDark: '#006D6D',
    teal: '#008080',
    greyLight: '#F5F5F5',
    greyDark: '#666666',
  };

  const handleLogin = () => {
    if (username === 'admin' && password === 'recruitiq123') {
      navigate('/home');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: colors.greyLight,
      fontFamily: 'sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 0 30px rgba(0,0,0,0.2)',
        width: '90%',
        maxWidth: '400px'
      }}>
        <h2 style={{ color: colors.tealDark, marginBottom: '20px', textAlign: 'center' }}>Login to RecruitIQ</h2>

        <label style={{ fontWeight: 'bold', marginBottom: '5px' }}>Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '15px',
            borderRadius: '6px',
            border: '1px solid #ccc'
          }}
        />

        <label style={{ fontWeight: 'bold', marginBottom: '5px' }}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '20px',
            borderRadius: '6px',
            border: '1px solid #ccc'
          }}
        />

        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

        <button
          onClick={handleLogin}
          style={{
            backgroundColor: colors.teal,
            color: 'white',
            padding: '12px',
            border: 'none',
            borderRadius: '6px',
            width: '100%',
            fontWeight: 'bold',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
