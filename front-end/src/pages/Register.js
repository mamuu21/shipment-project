import React, { useState } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    role: 'customer'
  });

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

    const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/register/', formData);
      alert("Registered successfully!");
      navigate('/login');
    } catch (error) {
      if (error.response && error.response.data) {
        const errors = error.response.data;
        let errorMessages = "";
        for (let key in errors) {
          if (Array.isArray(errors[key])) {
            errorMessages += `${key}: ${errors[key].join(', ')}\n`;
          } else {
            errorMessages += `${key}: ${errors[key]}\n`;
          }
        }
        alert(errorMessages);  // <-- shows real reason
      } else {
        alert("An unexpected error occurred.");
      }
    }
  };


  return (
    <div>
      <form onSubmit={handleSubmit} className="p-4 border rounded shadow bg-white" style={{ maxWidth: '500px', margin: '0 auto' }}>
        <h4 className="mb-4 text-center">Register</h4>

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

        <div className="mb-3">
            <label className="form-label">Email</label>
            <input
            name="email"
            type="email"
            className="form-control"
            placeholder="Enter your email"
            onChange={handleChange}
            required
            />
        </div>

        <div className="mb-3">
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

        <div className="mb-3">
            <label className="form-label">Confirm Password</label>
            <input
            name="password2"
            type="password"
            className="form-control"
            placeholder="Confirm password"
            onChange={handleChange}
            required
            />
        </div>

        <div className="mb-4">
            <label className="form-label">Role</label>
            <select
            name="role"
            className="form-select"
            onChange={handleChange}
            required
            >
            <option value="">Select role</option>
            <option value="customer">Customer</option>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
            </select>
        </div>

        <div className="d-grid">
            <button type="submit" className="btn btn-primary">Register</button>
        </div>
      </form>


    </div>
  );
}

export default Register;
