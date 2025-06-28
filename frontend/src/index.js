import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import Room from './Room';
import Register from './auth/Register';
import Login from './auth/Login';

const ProtectedRoute = ({ user, children }) => {
  return user ? children : <Navigate to='/login' />;
};

const Root = () => {
  const [user, setUser] = useState(localStorage.getItem('username') || null);

  useEffect(() => {
    const storedUser = localStorage.getItem('username');
    if (storedUser && !user) {
      setUser(storedUser);
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* 👇 Default route now shows Register page */}
        <Route path='/' element={<Register />} />
        <Route path='/register' element={<Register />} />
        <Route path='/login' element={<Login setUser={setUser} />} />

        <Route
          path='/room/:roomId'
          element={
            <ProtectedRoute user={user}>
              <Room user={user} />
            </ProtectedRoute>
          }
        />

        {/* Optional: Redirect unknown routes */}
        <Route path='*' element={<Navigate to='/' />} />
      </Routes>
    </BrowserRouter>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Root />);
