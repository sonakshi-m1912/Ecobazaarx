import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { generatePassword } from '../utils/password'

const roleOptions = ["customer", "admin", "seller"]

function Register() {
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    role: 'customer' 
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleGeneratePassword = () => {
    const newPassword = generatePassword()
    setForm({ ...form, password: newPassword })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validation
    if (!form.name || !form.email || !form.password) {
      setError('Please fill all fields!')
      return
    }

    if (form.name.length < 2) {
      setError('Name must be at least 2 characters long!')
      return
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long!')
      return
    }

    // Get existing users
    let users = JSON.parse(localStorage.getItem('ecobazaar_users') || '[]')
    
    // Check if email already exists
    if (users.find(u => u.email === form.email)) {
      setError('Email already registered!')
      return
    }

    // Add user with timestamp
    const newUser = {
      ...form,
      id: Date.now(),
      createdAt: new Date().toISOString()
    }
    
    users.push(newUser)
    localStorage.setItem('ecobazaar_users', JSON.stringify(users))
    
    setError('')
    setSuccess('Registration successful! Redirecting to login...')
    
    setTimeout(() => {
      navigate('/login')
    }, 2000)
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>🌱 EcoBazaarX Registration</h2>
        <p className="subtitle">Join the carbon-conscious shopping community</p>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="password-input-group">
              <input
                type="text"
                name="password"
                placeholder="Enter password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="generate-btn"
                onClick={handleGeneratePassword}
              >
                🔐 Generate
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Select Role</label>
            <div className="role-options">
              {roleOptions.map(role => (
                <label key={role} className="radio-label">
                  <input
                    type="radio"
                    name="role"
                    value={role}
                    checked={form.role === role}
                    onChange={handleChange}
                  />
                  <span className="role-text">
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </span>
                  <span className="role-desc">
                    {role === 'customer' && '🛒 Shop eco-friendly products'}
                    {role === 'admin' && '⚙️ Manage platform'}
                    {role === 'seller' && '🏪 Sell sustainable products'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="btn-primary">
            Create Account
          </button>
          
          <div className="auth-links">
            Already have an account?{' '}
            <button
              type="button"
              className="link-btn"
              onClick={() => navigate('/login')}
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register
