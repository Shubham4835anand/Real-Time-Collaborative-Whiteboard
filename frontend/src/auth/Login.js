// src/auth/Login.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css'; // Import shared styles

const API_URL = process.env.REACT_APP_API_BASE_URL;

function Login({ setUser }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      setUser(data.username);
      navigate(`/room/room123`);
    } else {
      alert('Login failed');
    }
  };

  return (
    <div className='auth-wrapper'>
      <div className='auth-card'>
        <h2>Welcome Back</h2>
        <form onSubmit={handleLogin}>
          <input
            type='email'
            placeholder='Email'
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            type='password'
            placeholder='Password'
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <button type='submit'>Login</button>
        </form>
        <p>
          Don’t have an account? <Link to='/register'>Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
