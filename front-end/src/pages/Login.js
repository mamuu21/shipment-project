import React, { useState } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/token/', formData);
      const token = response.data.access;

      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);


      alert("Login successful!");
      navigate('/dashboard'); 
    } catch (error) {
      alert("Login failed. Please check your credentials.");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="p-4 border rounded shadow bg-white" style={{ maxWidth: '500px', margin: '0 auto' }}>
        <h4 className="mb-4 text-center">Login</h4>

        <div className="mb-3">
          <label className="form-label">Username</label>
          <input
            name="username"
            className="form-control"
            placeholder="Enter your username"
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-4">
          <label className="form-label">Password</label>
          <input
            name="password"
            type="password"
            className="form-control"
            placeholder="Enter password"
            onChange={handleChange}
            required
          />
        </div>

        <div className="d-grid">
          <button type="submit" className="btn btn-primary">Login</button>
        </div>
      </form>
    </div>
  );
}

export default Login;
