import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (!form.email || !form.password) {
      setError('Please fill all fields!')
      setLoading(false)
      return
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      console.log('Attempting login to:', `${apiUrl}/api/auth/login`);
      console.log('Login data:', { email: form.email, password: '[HIDDEN]' });

      const res = await axios.post(`${apiUrl}/api/auth/login`, {
        email: form.email.trim().toLowerCase(),
        password: form.password
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Login response:', res.data);

      // Check if response has required data
      if (!res.data.user || !res.data.token) {
        throw new Error('Invalid response from server');
      }

      // Store user data and token
      localStorage.setItem('ecobazaar_user', JSON.stringify(res.data.user))
      localStorage.setItem('ecobazaar_token', res.data.token)
      
      console.log('User logged in successfully:', {
        username: res.data.user.username,
        role: res.data.user.role,
        email: res.data.user.email
      });

      // Navigate to dashboard
      navigate('/dashboard')
      
    } catch (err) {
      console.error('Login error:', err);
      
      let errorMessage = 'Login failed!';
      
      if (err.code === 'ECONNREFUSED') {
        errorMessage = 'Cannot connect to server. Please check if the server is running.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 400) {
        errorMessage = 'Invalid email or password';
      } else if (err.response?.status === 423) {
        errorMessage = 'Account temporarily locked due to too many failed attempts';
      } else if (err.message.includes('timeout')) {
        errorMessage = 'Request timeout. Please try again.';
      } else if (err.message === 'Network Error') {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      setError(errorMessage);
    }
    setLoading(false)
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>🌱 Welcome Back</h2>
        <p className="subtitle">Sign in to EcoBazaarX</p>
        
        {error && (
          <div className="error-message" style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '12px 16px',
            borderRadius: '6px',
            marginBottom: '20px',
            border: '1px solid #f5c6cb',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                marginBottom: '15px'
              }}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                marginBottom: '15px'
              }}
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: loading ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.3s',
              marginBottom: '20px'
            }}
          >
            {loading ? '🔄 Signing In...' : '🔑 Sign In'}
          </button>
          
          <div className="auth-links" style={{
            textAlign: 'center',
            fontSize: '14px',
            color: '#666'
          }}>
            Don't have an account?{' '}
            <button
              type="button"
              className="link-btn"
              onClick={() => navigate('/register')}
              style={{
                background: 'none',
                border: 'none',
                color: '#007bff',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Create Account
            </button>
          </div>
        </form>

        
          </div>
        </div>
  )
}

export default Login