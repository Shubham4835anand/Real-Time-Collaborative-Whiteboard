// src/auth/Register.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css'; // Shared styling

const API_URL = process.env.REACT_APP_API_BASE_URL;

function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        alert('✅ Registered successfully!');
        navigate('/login');
      } else {
        alert(data.message || '❌ Registration failed');
      }
    } catch (error) {
      alert('🚨 Backend not reachable');
    }
  };

  return (
    <div className='auth-wrapper'>
      <div className='auth-card'>
        <h2>Create an Account</h2>
        <form onSubmit={handleRegister}>
          <input
            type='text'
            placeholder='Username'
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />
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
          <button type='submit'>Register</button>
        </form>
        <p>
          Already registered? <Link to='/login'>Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
