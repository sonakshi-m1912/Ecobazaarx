import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { generatePassword } from '../utils/password'
import axios from 'axios'

const roleOptions = ["customer", "seller", "admin"]

function Register() {
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    role: 'customer' 
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
    setSuccess('')
  }

  const handleGeneratePassword = () => {
    const newPassword = generatePassword()
    setForm({ ...form, password: newPassword })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    // Client-side validation
    if (!form.name || !form.email || !form.password) {
      setError('Please fill all fields!')
      setLoading(false)
      return
    }

    if (form.name.length < 2) {
      setError('Name must be at least 2 characters long!')
      setLoading(false)
      return
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long!')
      setLoading(false)
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.email)) {
      setError('Please enter a valid email address!')
      setLoading(false)
      return
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      console.log('Attempting registration to:', `${apiUrl}/api/auth/signup`);
      
      const registrationData = {
        username: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role.toLowerCase()
      };

      console.log('Registration data:', { 
        ...registrationData, 
        password: '[HIDDEN]' 
      });

      const response = await axios.post(`${apiUrl}/api/auth/signup`, registrationData, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Registration successful:', response.data);

      setSuccess('Registration successful! Redirecting to login...')
      setError('')
      
      // Clear form
      setForm({ name: '', email: '', password: '', role: 'customer' })
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login')
      }, 2000)
      
    } catch (err) {
      console.error('Registration error:', err);
      
      let errorMessage = 'Registration failed!';
      
      if (err.code === 'ECONNREFUSED') {
        errorMessage = 'Cannot connect to server. Please check if the server is running.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 400) {
        errorMessage = err.response?.data?.message || 'Invalid registration data';
      } else if (err.message.includes('timeout')) {
        errorMessage = 'Request timeout. Please try again.';
      } else if (err.message === 'Network Error') {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      setError(errorMessage);
      setSuccess('')
    }
    
    setLoading(false)
  }

  return (
    <div className="auth-container" style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="auth-card" style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '500px'
      }}>
        <h2 style={{
          color: '#2c5530',
          textAlign: 'center',
          marginBottom: '10px',
          fontSize: '28px',
          fontWeight: 'bold'
        }}>
          🌱 EcoBazaarX Registration
        </h2>
        <p className="subtitle" style={{
          textAlign: 'center',
          color: '#666',
          marginBottom: '30px',
          fontSize: '16px'
        }}>
          Join the carbon-conscious shopping community
        </p>
        
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
            ❌ {error}
          </div>
        )}
        
        {success && (
          <div className="success-message" style={{
            backgroundColor: '#d4edda',
            color: '#155724',
            padding: '12px 16px',
            borderRadius: '6px',
            marginBottom: '20px',
            border: '1px solid #c3e6cb',
            fontSize: '14px'
          }}>
            ✅ {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#495057'
            }}>
              Full Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={form.name}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#495057'
            }}>
              Email Address
            </label>
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
                fontSize: '14px'
              }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#495057'
            }}>
              Password
            </label>
            <div className="password-input-group" style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                name="password"
                placeholder="Enter password (min 6 characters)"
                value={form.password}
                onChange={handleChange}
                required
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
              <button
                type="button"
                className="generate-btn"
                onClick={handleGeneratePassword}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '12px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  whiteSpace: 'nowrap'
                }}
              >
                🔐 Generate
              </button>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '30px' }}>
            <label style={{
              display: 'block',
              marginBottom: '15px',
              fontWeight: '600',
              color: '#495057'
            }}>
              Select Role
            </label>
            <div className="role-options" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {roleOptions.map(role => (
                <label key={role} className="radio-label" style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '15px',
                  border: '2px solid #e9ecef',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  backgroundColor: form.role === role ? '#e8f5e8' : 'white',
                  borderColor: form.role === role ? '#28a745' : '#e9ecef'
                }}>
                  <input
                    type="radio"
                    name="role"
                    value={role}
                    checked={form.role === role}
                    onChange={handleChange}
                    style={{
                      marginRight: '12px',
                      transform: 'scale(1.2)'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <span className="role-text" style={{
                      display: 'block',
                      fontWeight: '600',
                      color: '#333',
                      marginBottom: '4px',
                      fontSize: '16px'
                    }}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </span>
                    <span className="role-desc" style={{
                      fontSize: '13px',
                      color: '#666'
                    }}>
                      {role === 'customer' && '🛒 Shop eco-friendly products and track your carbon footprint'}
                      {role === 'admin' && '⚙️ Manage platform, users, and oversee all operations'}
                      {role === 'seller' && '🏪 Sell sustainable products and manage your inventory'}
                    </span>
                  </div>
                </label>
              ))}
            </div>
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
              padding: '15px 20px',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.3s',
              marginBottom: '20px'
            }}
          >
            {loading ? '🔄 Creating Account...' : '✨ Create Account'}
          </button>
          
          <div className="auth-links" style={{
            textAlign: 'center',
            fontSize: '14px',
            color: '#666'
          }}>
            Already have an account?{' '}
            <button
              type="button"
              className="link-btn"
              onClick={() => navigate('/login')}
              style={{
                background: 'none',
                border: 'none',
                color: '#007bff',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Sign In
            </button>
          </div>
        </form>

        {/* Development note */}
        <div style={{
          marginTop: '20px',
          padding: '12px',
          backgroundColor: '#e2e3e5',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#495057',
          textAlign: 'center'
        }}>
          💡 <strong>Development Mode:</strong> Use any email format and password 6+ characters
        </div>
      </div>
    </div>
  )
}

export default Register